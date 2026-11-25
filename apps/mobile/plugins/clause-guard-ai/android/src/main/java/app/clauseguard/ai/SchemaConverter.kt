package app.clauseguard.ai

import com.google.firebase.ai.type.Schema
import org.json.JSONObject

/**
 * Turns the JSON schema the shared code sends (object, array, string, string enum, boolean, number, integer)
 * into a Firebase AI Logic schema, so the cloud model is held to the same shape as on the web.
 * Only the cloud path uses this: on-device structured output needs compile-time classes on Android.
 */
object SchemaConverter {
    fun toSchema(node: JSONObject): Schema {
        node.optJSONArray("enum")?.let { options ->
            return Schema.enumeration((0 until options.length()).map { options.getString(it) })
        }
        return when (val type = node.optString("type")) {
            "object" -> {
                val props = node.optJSONObject("properties") ?: JSONObject()
                val required = node.optJSONArray("required")?.let { r -> (0 until r.length()).map { r.getString(it) }.toSet() } ?: emptySet()
                val map = props.keys().asSequence().associateWith { toSchema(props.getJSONObject(it)) }
                Schema.obj(map, optionalProperties = map.keys.filter { it !in required })
            }
            "array" -> Schema.array(toSchema(node.getJSONObject("items")))
            "string" -> Schema.string()
            "boolean" -> Schema.boolean()
            "integer" -> Schema.integer()
            "number" -> Schema.double()
            else -> throw IllegalArgumentException("Unsupported JSON schema type: $type")
        }
    }
}
