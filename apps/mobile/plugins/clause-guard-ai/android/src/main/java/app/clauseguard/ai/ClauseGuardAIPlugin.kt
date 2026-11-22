package app.clauseguard.ai

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.firebase.Firebase
import com.google.firebase.ai.InferenceMode
import com.google.firebase.ai.OnDeviceConfig
import com.google.firebase.ai.ai
import com.google.firebase.ai.ondevice.DownloadStatus
import com.google.firebase.ai.ondevice.FirebaseAIOnDevice
import com.google.firebase.ai.ondevice.OnDeviceModelStatus
import com.google.firebase.ai.type.GenerativeBackend
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
        // TODO: install App Check first (debug provider in debug builds, Play Integrity in release),
        // then create the Firebase AI Logic instance for analyze().
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

    @PluginMethod
    fun analyze(call: PluginCall) {
        call.getArray("clauses") ?: return call.reject("clauses is required")
        // TODO: PREFER_IN_CLOUD with prompts and schema from Remote Config.
        // Resolve { results, ranOn: "cloud" | "device" }. Input is leak-checked text only; never log it.
        call.reject("analyze not implemented")
    }
}
