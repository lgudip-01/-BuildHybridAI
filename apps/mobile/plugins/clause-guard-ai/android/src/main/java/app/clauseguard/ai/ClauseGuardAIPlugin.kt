package app.clauseguard.ai

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/** Native AiBridge for Android. Method names and payloads match apps/web/src/nativeBridge.ts. */
@CapacitorPlugin(name = "ClauseGuardAI")
class ClauseGuardAIPlugin : Plugin() {
    private val scope = CoroutineScope(Dispatchers.Default)

    override fun load() {
        // TODO: install App Check first (debug provider in debug builds, Play Integrity in release),
        // then create the Firebase AI Logic instance.
    }

    @PluginMethod
    fun onDeviceStatus(call: PluginCall) {
        // TODO: query Gemini Nano availability. Map to: available | downloadable | downloading | unavailable.
        call.resolve(JSObject().put("status", "unavailable"))
    }

    @PluginMethod
    fun downloadModel(call: PluginCall) {
        // TODO: trigger the model download; emit notifyListeners("downloadProgress", {fraction}) while it runs.
        call.reject("downloadModel not implemented")
    }

    @PluginMethod
    fun onDevice(call: PluginCall) {
        val prompt = call.getString("prompt") ?: return call.reject("prompt is required")
        val schema = call.getObject("schema")
        scope.launch {
            // TODO: InferenceMode.ONLY_ON_DEVICE. Apply `schema` as the response constraint.
            call.reject("onDevice not implemented")
        }
    }

    @PluginMethod
    fun analyze(call: PluginCall) {
        val clauses = call.getArray("clauses") ?: return call.reject("clauses is required")
        scope.launch {
            // TODO: InferenceMode.PREFER_IN_CLOUD with prompts and schema from Remote Config.
            // Resolve { results, ranOn: "cloud" | "device" }. Input is leak-checked text only; never log it.
            call.reject("analyze not implemented")
        }
    }
}
