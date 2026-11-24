import Foundation
import CoreFoundation

/// Shape/size checks only: the shared engine owns masking and approval authority.
/// No native flag or request value can enable the production release gate.
enum NativeChatFailure: Error { case releasePending, invalidRequest, wrongSource }
enum NativeChatRelease {
    static func assertEnabled() throws { throw NativeChatFailure.releasePending }
}

struct NativeChatRequest: Sendable {
    let system: String
    let input: String
    let model: String
    let timeoutMs: Int
    let schemaJSON: String
}
enum NativeChatPolicy {
    static let model = "gemini-3.5-flash-lite"
    static var schema: [String: Any] { [
        "type": "object", "properties": [
            "status": ["type": "string", "enum": ["answered", "insufficient_context"]],
            "answer": ["type": "string"],
            "citations": ["type": "array", "items": ["type": "string"], "maxItems": 10],
        ], "required": ["status", "answer", "citations"], "additionalProperties": false,
    ] }
    private static func require(_ value: Bool) throws {
        if !value { throw NativeChatFailure.invalidRequest }
    }
    private static func keys(_ object: [String: Any], _ expected: [String]) -> Bool {
        Set(object.keys) == Set(expected)
    }
    private static func text(_ value: Any?, max: Int) -> String? {
        guard let value = value as? String, !value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
              value.utf16.count <= max else { return nil }
        return value
    }
    static func validate(_ options: [String: Any]) throws -> NativeChatRequest {
        try require(keys(options, ["system", "input", "model", "schema", "cloudOnly", "timeoutMs"]))
        guard let cloud = options["cloudOnly"] as? NSNumber, CFGetTypeID(cloud) == CFBooleanGetTypeID(), cloud.boolValue,
              let timeout = options["timeoutMs"] as? NSNumber, CFGetTypeID(timeout) != CFBooleanGetTypeID(), timeout.doubleValue == 30_000,
              let system = text(options["system"], max: 4096), let input = text(options["input"], max: 600_000),
              let model = options["model"] as? String, model == self.model,
              let suppliedSchema = options["schema"] as? [String: Any],
              let suppliedJSON = try? JSONSerialization.data(withJSONObject: suppliedSchema, options: [.sortedKeys]),
              let expectedJSON = try? JSONSerialization.data(withJSONObject: schema, options: [.sortedKeys]), suppliedJSON == expectedJSON,
              let data = input.data(using: .utf8),
              let payload = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw NativeChatFailure.invalidRequest
        }
        try require(keys(payload, ["contract", "history", "question"]))
        guard let contract = payload["contract"] as? [[String: Any]], (1...40).contains(contract.count),
              let history = payload["history"] as? [[String: Any]], history.count <= 14, history.count % 2 == 0,
              let question = payload["question"] as? [String: Any], keys(question, ["text"]),
              text(question["text"], max: 2000) != nil else { throw NativeChatFailure.invalidRequest }
        var ids = Set<String>(), total = 0
        for clause in contract {
            try require(keys(clause, ["id", "text"]) || keys(clause, ["id", "text", "type"]))
            guard let id = text(clause["id"], max: 1000), let body = text(clause["text"], max: 6000),
                  ids.insert(id).inserted else { throw NativeChatFailure.invalidRequest }
            if clause["type"] != nil { try require(text(clause["type"], max: 100) != nil) }
            total += body.utf16.count
        }
        try require(total <= 60_000)
        var historySize = 0
        for (index, turn) in history.enumerated() {
            if index % 2 == 0 {
                guard keys(turn, ["role", "text"]), turn["role"] as? String == "user",
                      let body = text(turn["text"], max: 2000) else { throw NativeChatFailure.invalidRequest }
                historySize += body.utf16.count
            } else {
                guard keys(turn, ["role", "content"]), turn["role"] as? String == "assistant",
                      let content = turn["content"] as? [String: Any], keys(content, ["status", "answer", "citations"]),
                      let status = content["status"] as? String, ["answered", "insufficient_context"].contains(status),
                      let answer = text(content["answer"], max: 6000), let citations = content["citations"] as? [String],
                      citations.count <= 10, Set(citations).count == citations.count,
                      citations.allSatisfy({ ids.contains($0) }), status != "answered" || !citations.isEmpty else {
                    throw NativeChatFailure.invalidRequest
                }
                historySize += answer.utf16.count + status.utf16.count + citations.reduce(0) { $0 + $1.utf16.count }
            }
        }
        try require(historySize <= 20_000)
        return NativeChatRequest(system: system, input: input, model: model, timeoutMs: 30_000, schemaJSON: String(data: expectedJSON, encoding: .utf8)!)
    }
    /// The SDK's cloud modelVersion must identify the requested Gemini model.
    /// Empty, on-device and unrelated values are not cloud confirmation.
    static func confirmsCloud(_ version: String) -> Bool {
        version == model || version.range(of: "^" + NSRegularExpression.escapedPattern(for: model) + "-[0-9]{3}\\z", options: .regularExpression) != nil
    }
}
