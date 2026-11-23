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
        CAPPluginMethod(name: "analyzeClause", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "vaultKey", returnType: CAPPluginReturnPromise),
    ]

    public override func load() {
        #if canImport(FirebaseAILogic) && canImport(FoundationModels) && compiler(>=6.2.3)
        // App Check (debug provider in DEBUG, App Attest in release), then Firebase. Needs GoogleService-Info.plist.
        if !AnalysisSupport.configureFirebase() {
            NSLog("ClauseGuardAI: GoogleService-Info.plist is missing; cloud analysis is unavailable.")
        }
        #endif
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
                    // The error's type only. Provider error text can echo the input, and this is the raw-contract path.
                    NSLog("ClauseGuardAI onDevice failed: %@", String(describing: type(of: error)))
                    #endif
                    call.reject("On-device generation failed.")
                }
            }
            return
        }
        #endif
        call.reject("The on-device model isn't available.", "UNAVAILABLE")
    }

    // MARK: - analyzeClause (leak-checked text only)

    /// One masked clause through Firebase AI Logic. Cloud first, then on-device when allowed; once the batch has an
    /// answer, JS pins the rest to that source. Approval, validation and name restoring all happen in JS.
    /// The input is leak-checked text only; nothing here logs a prompt, an input or a model answer.
    @objc func analyzeClause(_ call: CAPPluginCall) {
        guard let cloudSystem = call.getString("cloudSystem"),
              let deviceSystem = call.getString("deviceSystem"),
              let input = call.getString("input"),
              let schema = call.getObject("schema"),
              let model = call.getString("model") else {
            return call.reject("cloudSystem, deviceSystem, input, schema and model are required")
        }
        let pin = call.getString("pin")
        let allowDevice = call.getBool("allowDeviceFallback") ?? true
        let timeout = Double(call.getInt("timeoutMs") ?? 60_000) / 1000

        let order: [String]
        switch pin {
        case "cloud": order = ["cloud"]
        case "device": order = ["device"]
        default: order = allowDevice ? ["cloud", "device"] : ["cloud"]
        }

        #if canImport(FirebaseAILogic) && canImport(FoundationModels) && compiler(>=6.2.3)
        if #available(iOS 26.0, *) {
            Task {
                var failure = "model_error"
                for source in order {
                    do {
                        let system = source == "cloud" ? cloudSystem : deviceSystem
                        let text = try await AnalysisSupport.withDeadline(seconds: timeout) {
                            try await AnalysisSupport.run(source: source, model: model, system: system, input: input, schema: schema)
                        }
                        return call.resolve(["text": text, "source": source])
                    } catch {
                        failure = String(describing: type(of: error)) // type name only: messages could echo contract text
                    }
                }
                call.reject("The model request could not be completed (\(failure)).", "MODEL_ERROR")
            }
            return
        }
        #endif
        call.reject("Analysis needs iOS 26 or later.", "UNAVAILABLE")
    }
}
