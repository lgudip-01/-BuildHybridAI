import Capacitor
import Foundation

/// Native AiBridge for iOS. Method names and payloads match apps/web/src/nativeBridge.ts.
@objc(ClauseGuardAIPlugin)
public class ClauseGuardAIPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ClauseGuardAIPlugin"
    public let jsName = "ClauseGuardAI"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "onDeviceStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "downloadModel", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "onDevice", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "analyze", returnType: CAPPluginReturnPromise),
    ]

    public override func load() {
        // TODO: install App Check first (debug provider in DEBUG, App Attest in release),
        // then create the Firebase AI Logic instance.
    }

    @objc func onDeviceStatus(_ call: CAPPluginCall) {
        // TODO: check Apple Foundation Models availability.
        // Map to: available | downloadable | downloading | unavailable.
        call.resolve(["status": "unavailable"])
    }

    @objc func downloadModel(_ call: CAPPluginCall) {
        // Apple manages the model download. Resolve once it is available.
        call.reject("downloadModel not implemented")
    }

    @objc func onDevice(_ call: CAPPluginCall) {
        guard let prompt = call.getString("prompt") else { return call.reject("prompt is required") }
        let schema = call.getObject("schema")
        _ = (prompt, schema)
        // TODO: ONLY_ON_DEVICE. The context window is small, so the shared code sends one clause per call.
        call.reject("onDevice not implemented")
    }

    @objc func analyze(_ call: CAPPluginCall) {
        guard let clauses = call.getArray("clauses") else { return call.reject("clauses is required") }
        _ = clauses
        // TODO: PREFER_IN_CLOUD with prompts and schema from Remote Config.
        // Resolve ["results": [...], "ranOn": "cloud" | "device"]. Input is leak-checked text only; never log it.
        call.reject("analyze not implemented")
    }
}
