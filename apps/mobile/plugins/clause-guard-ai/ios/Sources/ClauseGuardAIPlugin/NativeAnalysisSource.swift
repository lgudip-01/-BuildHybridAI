/// Source confirmation shared with the existing strict cloud-model policy.
/// A different or missing model version is not evidence of cloud execution.
enum NativeAnalysisSource {
    static let deviceModelVersion = "apple-foundation-models-system-language-model"

    static func confirms(source: String, model: String, version: String) -> Bool {
        switch source {
        case "cloud":
            // Analysis uses the same fixed, reviewed model as the shared chat policy.
            return model == NativeChatPolicy.model && NativeChatPolicy.confirmsCloud(version)
        case "device":
            return version == deviceModelVersion
        default:
            return false
        }
    }
}
