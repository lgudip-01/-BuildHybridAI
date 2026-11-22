import Capacitor
import Foundation

#if canImport(FoundationModels)
import FoundationModels
#endif

/// Native AiBridge for iOS. Method names and payloads match apps/web/src/nativeBridge.ts.
///
/// On-device model: Apple Foundation Models (iOS 26+ with Apple Intelligence). Prompts passed to
/// `onDevice` contain raw contract text, so nothing here logs a prompt or a result.
@objc(ClauseGuardAIPlugin)
public class ClauseGuardAIPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ClauseGuardAIPlugin"
    public let jsName = "ClauseGuardAI"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "onDeviceStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "downloadModel", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "onDevice", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "analyze", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "vaultKey", returnType: CAPPluginReturnPromise),
    ]

    public override func load() {
        // TODO: install App Check first (debug provider in DEBUG, App Attest in release),
        // then create the Firebase AI Logic instance for analyze().
    }

    // MARK: - Vault key

    /// The vault's AES-256 key, created on first use and kept in the Keychain (this device only, never backed up).
    @objc func vaultKey(_ call: CAPPluginCall) {
        do {
            call.resolve(["key": try VaultKeychain.key().base64EncodedString()])
        } catch let failure as VaultKeychain.Failure {
            call.reject("Couldn't read the vault key from the Keychain (OSStatus \(failure.status)).")
        } catch {
            call.reject("Couldn't read the vault key from the Keychain.")
        }
    }

    // MARK: - On-device status

    /// available | downloadable | downloading | unavailable
    private func currentStatus() -> String {
        #if canImport(FoundationModels)
        if #available(iOS 26.0, *) {
            switch SystemLanguageModel.default.availability {
            case .available:
                return "available"
            case .unavailable(let reason):
                switch reason {
                case .modelNotReady: return "downloading"
                default: return "unavailable" // device not eligible, or Apple Intelligence is off
                }
            }
        }
        #endif
        return "unavailable"
    }

    @objc func onDeviceStatus(_ call: CAPPluginCall) {
        call.resolve(["status": currentStatus()])
    }

    /// Apple downloads the model itself when Apple Intelligence is on, and there is no API to start or
    /// track it. So this polls until it is ready, with no real progress to report.
    @objc func downloadModel(_ call: CAPPluginCall) {
        Task {
            let deadline = Date().addingTimeInterval(10 * 60)
            while Date() < deadline {
                switch currentStatus() {
                case "available":
                    self.notifyListeners("downloadProgress", data: ["fraction": 1.0])
                    return call.resolve()
                case "unavailable":
                    return call.reject("Apple Intelligence isn't available or isn't turned on for this device.")
                default:
                    try? await Task.sleep(nanoseconds: 2_000_000_000)
                }
            }
            call.reject("The on-device model is still downloading. Try again in a few minutes.")
        }
    }

    // MARK: - onDevice (raw text allowed)

    @objc func onDevice(_ call: CAPPluginCall) {
        guard let prompt = call.getString("prompt") else { return call.reject("prompt is required") }
        let schema = call.getObject("schema")

        #if canImport(FoundationModels)
        if #available(iOS 26.0, *) {
            guard currentStatus() == "available" else {
                return call.reject("The on-device model isn't available.", "UNAVAILABLE")
            }
            Task {
                do {
                    // A new session per call: one clause per call, and no history carried between clauses.
                    let session = LanguageModelSession()
                    if let schema {
                        let generationSchema = try SchemaConverter.generationSchema(from: schema)
                        let response = try await session.respond(to: prompt, schema: generationSchema)
                        call.resolve(["text": response.content.jsonString])
                    } else {
                        let response = try await session.respond(to: prompt)
                        call.resolve(["text": response.content])
                    }
                } catch {
                    #if DEBUG
                    // The error only, never the prompt or the result: both hold raw contract text.
                    NSLog("ClauseGuardAI onDevice failed: %@ (%@)", String(describing: type(of: error)), error.localizedDescription)
                    #endif
                    call.reject("On-device generation failed: \(error.localizedDescription)")
                }
            }
            return
        }
        #endif
        call.reject("The on-device model isn't available.", "UNAVAILABLE")
    }

    // MARK: - analyze (leak-checked text only)

    @objc func analyze(_ call: CAPPluginCall) {
        guard let clauses = call.getArray("clauses") else { return call.reject("clauses is required") }
        _ = clauses
        // TODO: PREFER_IN_CLOUD with prompts and schema from Remote Config.
        // Resolve ["results": [...], "ranOn": "cloud" | "device"]. Input is leak-checked text only; never log it.
        call.reject("analyze not implemented")
    }
}
