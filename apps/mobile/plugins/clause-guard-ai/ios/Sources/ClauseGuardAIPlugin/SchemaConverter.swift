import Foundation

#if canImport(FoundationModels)
import FoundationModels

enum SchemaError: Error, LocalizedError {
    case unsupported(String)
    var errorDescription: String? {
        if case .unsupported(let what) = self { return "Unsupported JSON schema: \(what)" }
        return nil
    }
}

/// Turns the JSON schemas the shared code sends (object, array, string, enum, boolean, number, integer)
/// into a FoundationModels schema, so the on-device model is constrained to the same shape as on the web.
@available(iOS 26.0, *)
struct SchemaConverter {
    private var counter = 0

    static func generationSchema(from json: [String: Any]) throws -> GenerationSchema {
        var converter = SchemaConverter()
        return try GenerationSchema(root: try converter.convert(json, name: "Result"), dependencies: [])
    }

    private mutating func nextName(_ base: String) -> String {
        counter += 1
        return "\(base)\(counter)"
    }

    private mutating func convert(_ node: [String: Any], name: String) throws -> DynamicGenerationSchema {
        if let options = node["enum"] as? [String] {
            return DynamicGenerationSchema(name: nextName(name), anyOf: options)
        }
        switch node["type"] as? String {
        case "object":
            let required = Set((node["required"] as? [String]) ?? [])
            let properties = (node["properties"] as? [String: Any]) ?? [:]
            var built: [DynamicGenerationSchema.Property] = []
            // Sorted so the output is the same on every run.
            for key in properties.keys.sorted() {
                guard let child = properties[key] as? [String: Any] else { throw SchemaError.unsupported(key) }
                built.append(.init(name: key, schema: try convert(child, name: key), isOptional: !required.contains(key)))
            }
            return DynamicGenerationSchema(name: name, properties: built)
        case "array":
            guard let items = node["items"] as? [String: Any] else { throw SchemaError.unsupported("array without items") }
            return DynamicGenerationSchema(arrayOf: try convert(items, name: nextName(name)))
        case "string":
            return DynamicGenerationSchema(type: String.self)
        case "boolean":
            return DynamicGenerationSchema(type: Bool.self)
        case "integer":
            return DynamicGenerationSchema(type: Int.self)
        case "number":
            return DynamicGenerationSchema(type: Double.self)
        default:
            throw SchemaError.unsupported(String(describing: node["type"] ?? "missing type"))
        }
    }
}
#endif
