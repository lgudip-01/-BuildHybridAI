import Foundation

#if canImport(FirebaseAILogic) && canImport(FoundationModels) && compiler(>=6.2.3)
import FirebaseAILogic
import FirebaseAppCheck
import FirebaseCore
import FoundationModels

/// App Check for Firebase AI Logic: the debug provider in debug builds, App Attest in release builds.
final class ClauseGuardAppCheckFactory: NSObject, AppCheckProviderFactory {
    func createProvider(with app: FirebaseApp) -> AppCheckProvider? {
        #if DEBUG
        // The debug token is printed in the Xcode console and must be registered in the Firebase console.
        return AppCheckDebugProviderFactory().createProvider(with: app)
        #else
        return AppAttestProvider(app: app)
        #endif
    }
}

enum AnalysisSupport {
    static let deviceModelVersion = "apple-foundation-models-system-language-model"

    /// Sets up App Check, then Firebase. Returns false when GoogleService-Info.plist is missing: Firebase's
    /// configure() would crash without it, so cloud analysis stays unavailable instead.
    @discardableResult
    static func configureFirebase() -> Bool {
        if FirebaseApp.app() != nil { return true }
        guard Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil else { return false }
        AppCheck.setAppCheckProviderFactory(ClauseGuardAppCheckFactory()) // must come before configure()
        FirebaseApp.configure()
        return true
    }

    /// Runs `work`, giving up after `seconds`.
    static func withDeadline<T: Sendable>(seconds: Double, _ work: @escaping @Sendable () async throws -> T) async throws -> T {
        try await withThrowingTaskGroup(of: T.self) { group in
            group.addTask { try await work() }
            group.addTask {
                try await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
                throw CancellationError()
            }
            guard let first = try await group.next() else { throw CancellationError() }
            group.cancelAll()
            return first
        }
    }

    /// Fresh cloud-only session per masked chat request. No provider history or local fallback.
    @available(iOS 26.0, *)
    static func runCloudChat(_ request: NativeChatRequest) async throws -> String {
        guard configureFirebase() else { throw AnalysisError.notConfigured }
        let ai = FirebaseAI.firebaseAI(backend: .googleAI())
        let session = ai.generativeModelSession(model: ai.geminiModel(name: request.model), instructions: request.system)
        // Experimental session schema API is not public; shared JS validates the JSON response.
        let schema = request.schemaJSON
        let prompt = "Return only JSON matching this schema:\n\(schema)\n\nMasked contract, history and question data:\n\(request.input)"
        let response = try await session.respond(to: prompt)
        guard NativeChatPolicy.confirmsCloud(response.rawResponse.modelVersion) else { throw NativeChatFailure.wrongSource }
        return response.content
    }

    /// One masked clause through Firebase AI Logic. `source` is "cloud" (Gemini) or "device" (Apple's model).
    @available(iOS 26.0, *)
    static func run(source: String, model: String, system: String, input: String, schema: [String: Any]) async throws -> String {
        guard configureFirebase() else { throw AnalysisError.notConfigured }
        let ai = FirebaseAI.firebaseAI(backend: .googleAI())
        // The SDK's schema-constrained respond() is not public yet, so the schema goes into the prompt.
        // The shared TypeScript validator rejects any answer that does not match it.
        let schemaText = String(data: try JSONSerialization.data(withJSONObject: schema, options: [.sortedKeys]), encoding: .utf8) ?? "{}"
        let prompt = "Answer with only JSON that matches this JSON schema, and nothing else:\n\(schemaText)\n\nClause:\n\(input)"

        let session: GenerativeModelSession
        if source == "cloud" {
            session = ai.generativeModelSession(model: ai.geminiModel(name: model), instructions: system)
        } else {
            let apple = FirebaseAI.SystemLanguageModel.default
            guard apple.isAvailable else { throw AnalysisError.unavailable }
            session = ai.generativeModelSession(model: apple, instructions: system)
        }
        let response = try await session.respond(to: prompt)
        // Do not trust the request: confirm which model really answered.
        let answeredByDevice = response.rawResponse.modelVersion == deviceModelVersion
        guard answeredByDevice == (source == "device") else { throw AnalysisError.wrongSource }
        return response.content
    }
}

enum AnalysisError: Error { case notConfigured, unavailable, wrongSource }
#endif
