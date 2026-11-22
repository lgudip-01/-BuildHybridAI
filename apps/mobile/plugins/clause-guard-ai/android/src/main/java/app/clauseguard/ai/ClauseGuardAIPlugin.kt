package app.clauseguard.ai

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import android.util.Log
import com.google.firebase.Firebase
import com.google.firebase.FirebaseApp
import com.google.firebase.ai.InferenceSource
import com.google.firebase.ai.InferenceMode
import com.google.firebase.ai.OnDeviceConfig
import com.google.firebase.ai.ai
import com.google.firebase.ai.ondevice.DownloadStatus
import com.google.firebase.ai.ondevice.FirebaseAIOnDevice
import com.google.firebase.ai.ondevice.OnDeviceModelStatus
import com.google.firebase.ai.type.GenerativeBackend
import com.google.firebase.ai.type.content
import com.google.firebase.ai.type.generationConfig
import org.json.JSONObject
import kotlinx.coroutines.withTimeout
import com.google.firebase.ai.type.PublicPreviewAPI
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Native AiBridge for Android. Method names and payloads match apps/web/src/nativeBridge.ts.
 *
 * On-device model: Gemini Nano through Firebase AI Logic (AICore). Prompts passed to `onDevice` contain raw
 * contract text, so nothing here logs a prompt or a result.
 *
 * NOT COMPILED YET: written from the Firebase AI Logic hybrid docs. Check the imports against the SDK
 * versions in build.gradle once Android Studio is set up.
 */
@OptIn(PublicPreviewAPI::class) // the hybrid on-device API is an experimental public preview
@CapacitorPlugin(name = "ClauseGuardAI")
class ClauseGuardAIPlugin : Plugin() {
    private val scope = CoroutineScope(Dispatchers.Default)
    private val CLOUD_MODEL_UNUSED = "gemini-2.5-flash-lite"

    override fun load() {
        // App Check first, then any Firebase AI Logic call. Needs google-services.json in apps/mobile/android/app.
        try {
            if (FirebaseApp.getApps(context).isEmpty()) FirebaseApp.initializeApp(context)
            if (FirebaseApp.getApps(context).isNotEmpty()) AppCheckSetup.install()
            else Log.w("ClauseGuardAI", "Firebase is not configured (no google-services.json); cloud analysis is unavailable.")
        } catch (e: Exception) {
            Log.w("ClauseGuardAI", "App Check setup failed: ${e.javaClass.simpleName}")
        }
    }

    @PluginMethod
    fun vaultKey(call: PluginCall) {
        try {
            call.resolve(JSObject().put("key", VaultKeystore.keyBase64(context)))
        } catch (e: Exception) {
            call.reject("Couldn't read the vault key from the Android Keystore.")
        }
    }

    /** available | downloadable | downloading | unavailable */
    private suspend fun currentStatus(): String = try {
        when (FirebaseAIOnDevice.checkStatus()) {
            OnDeviceModelStatus.AVAILABLE -> "available"
            OnDeviceModelStatus.DOWNLOADABLE -> "downloadable"
            OnDeviceModelStatus.DOWNLOADING -> "downloading"
            else -> "unavailable"
        }
    } catch (e: Exception) {
        "unavailable"
    }

    @PluginMethod
    fun onDeviceStatus(call: PluginCall) {
        scope.launch { call.resolve(JSObject().put("status", currentStatus())) }
    }

    @PluginMethod
    fun downloadModel(call: PluginCall) {
        scope.launch {
            try {
                when (currentStatus()) {
                    "available" -> {
                        notifyListeners("downloadProgress", JSObject().put("fraction", 1.0))
                        call.resolve()
                    }
                    "unavailable" -> call.reject("This phone doesn't support Gemini Nano.")
                    else -> {
                        var total = 0L
                        FirebaseAIOnDevice.download().collect { status ->
                            when (status) {
                                is DownloadStatus.DownloadStarted -> total = status.bytesToDownload
                                is DownloadStatus.DownloadInProgress -> if (total > 0) {
                                    notifyListeners(
                                        "downloadProgress",
                                        JSObject().put("fraction", status.totalBytesDownloaded.toDouble() / total),
                                    )
                                }
                                is DownloadStatus.DownloadCompleted -> {
                                    notifyListeners("downloadProgress", JSObject().put("fraction", 1.0))
                                    call.resolve()
                                }
                                is DownloadStatus.DownloadFailed -> call.reject("The model download failed.")
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                call.reject("The model download failed.")
            }
        }
    }

    @PluginMethod
    fun onDevice(call: PluginCall) {
        val prompt = call.getString("prompt") ?: return call.reject("prompt is required")
        val schema = call.getObject("schema")
        scope.launch {
            try {
                if (currentStatus() != "available") return@launch call.reject("The on-device model isn't available.", "UNAVAILABLE")
                val model = Firebase.ai(backend = GenerativeBackend.googleAI())
                    // The SDK requires a model name even here. ONLY_ON_DEVICE never calls the cloud, so it is unused.
                    .generativeModel(
                        modelName = CLOUD_MODEL_UNUSED,
                        onDeviceConfig = OnDeviceConfig(mode = InferenceMode.ONLY_ON_DEVICE),
                    )
                // On-device structured output needs compile-time @Generable classes, so a runtime JSON schema
                // goes into the prompt instead. The shared code parses the JSON and rejects answers it can't use.
                val full = if (schema == null) prompt else
                    "$prompt\n\nAnswer with only JSON that matches this JSON schema, and nothing else:\n$schema"
                val result = model.generateContent(full)
                call.resolve(JSObject().put("text", result.text ?: ""))
            } catch (e: Exception) {
                call.reject("On-device generation failed: ${e.javaClass.simpleName}")
            }
        }
    }

    /**
     * One masked clause through Firebase AI Logic. Cloud first, then on-device when allowed; once the batch has
     * an answer, JS pins the rest to that source. Approval, validation and name restoring all happen in JS.
     * The input is leak-checked text only; nothing here logs a prompt, an input or a model answer.
     */
    @PluginMethod
    fun analyzeClause(call: PluginCall) {
        val cloudSystem = call.getString("cloudSystem") ?: return call.reject("cloudSystem is required")
        val deviceSystem = call.getString("deviceSystem") ?: return call.reject("deviceSystem is required")
        val input = call.getString("input") ?: return call.reject("input is required")
        val schema = call.getObject("schema") ?: return call.reject("schema is required")
        val model = call.getString("model") ?: return call.reject("model is required")
        val pin = call.getString("pin")
        val allowDevice = call.getBoolean("allowDeviceFallback", true) ?: true
        val timeoutMs = (call.getInt("timeoutMs", 60_000) ?: 60_000).toLong()

        val order = when (pin) {
            "cloud" -> listOf("cloud")
            "device" -> listOf("device")
            else -> if (allowDevice) listOf("cloud", "device") else listOf("cloud")
        }
        scope.launch {
            var failure = "model_error"
            for (source in order) {
                try {
                    val text = withTimeout(timeoutMs) {
                        if (source == "cloud") runCloud(model, cloudSystem, input, schema) else runDevice(deviceSystem, input, schema)
                    }
                    return@launch call.resolve(JSObject().put("text", text).put("source", source))
                } catch (e: Exception) {
                    failure = e.javaClass.simpleName // class name only: messages could echo contract text
                }
            }
            call.reject("The model request could not be completed ($failure).", "MODEL_ERROR")
        }
    }

    private suspend fun runCloud(model: String, system: String, input: String, schema: JSONObject): String {
        val generative = Firebase.ai(backend = GenerativeBackend.googleAI()).generativeModel(
            modelName = model,
            generationConfig = generationConfig {
                responseMimeType = "application/json"
                responseSchema = SchemaConverter.toSchema(schema)
                maxOutputTokens = 2048
            },
            systemInstruction = content { text(system) },
            onDeviceConfig = OnDeviceConfig(mode = InferenceMode.ONLY_IN_CLOUD),
        )
        val response = generative.generateContent(input)
        // Do not trust the request: the SDK must confirm that the cloud really answered.
        if (response.inferenceSource != InferenceSource.IN_CLOUD) throw IllegalStateException("source")
        return response.text ?: throw IllegalStateException("empty")
    }

    private suspend fun runDevice(system: String, input: String, schema: JSONObject): String {
        if (currentStatus() != "available") throw IllegalStateException("unavailable")
        val generative = Firebase.ai(backend = GenerativeBackend.googleAI()).generativeModel(
            modelName = CLOUD_MODEL_UNUSED,
            onDeviceConfig = OnDeviceConfig(mode = InferenceMode.ONLY_ON_DEVICE),
        )
        // On-device structured output needs compile-time classes, so the schema goes into the prompt.
        // The 4,000-token on-device limit applies to this whole prompt.
        val prompt = "$system\n\nAnswer with only JSON that matches this JSON schema, and nothing else:\n$schema\n\nClause:\n$input"
        val response = generative.generateContent(prompt)
        if (response.inferenceSource != InferenceSource.ON_DEVICE) throw IllegalStateException("source")
        return response.text ?: throw IllegalStateException("empty")
    }
}
