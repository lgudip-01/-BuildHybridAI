import Foundation

let path = CommandLine.arguments[1]
let fixtures = try JSONSerialization.jsonObject(with: Data(contentsOf: URL(fileURLWithPath: path))) as! [String: Any]
let cases = fixtures["cases"] as! [[String: Any]]
@MainActor func expanded(_ value: Any) throws -> Any {
    if let s = value as? String, s == "$SYSTEM" { return fixtures["system"]! }
    if let s = value as? String, s == "$SCHEMA" { return fixtures["schema"]! }
    if let array = value as? [Any] { return try array.map(expanded) }
    if let object = value as? [String: Any] {
        if let repeatText = object["$repeat"] as? String { return String(repeating: repeatText, count: object["count"] as! Int) }
        if let payload = object["$payload"] {
            return String(data: try JSONSerialization.data(withJSONObject: expanded(payload)), encoding: .utf8)!
        }
        return try object.mapValues(expanded)
    }
    return value
}
var passed = 0
for fixture in cases {
    let expected = fixture["valid"] as! Bool
    var accepted = false
    do { _ = try NativeChatPolicy.validate(try expanded(fixture["request"]!) as! [String: Any]); accepted = true } catch {}
    guard accepted == expected else { fatalError("Native policy mismatch: \(fixture["name"]!)") }
    passed += 1
}
for (version, expected) in [(NativeChatPolicy.model, true), (NativeChatPolicy.model + "-001", true), ("", false), ("apple-foundation-models-system-language-model", false), ("unknown-cloud", false), (NativeChatPolicy.model + "-device", false)] {
    guard NativeChatPolicy.confirmsCloud(version) == expected else { fatalError("Unexpected model source acceptance") }
    passed += 1
}
do { try NativeChatRelease.assertEnabled(); fatalError("Release gate enabled") }
catch NativeChatFailure.releasePending { passed += 1 }
print("Swift native policy: \(passed) checks passed; release blocked; no SDK/provider calls.")
