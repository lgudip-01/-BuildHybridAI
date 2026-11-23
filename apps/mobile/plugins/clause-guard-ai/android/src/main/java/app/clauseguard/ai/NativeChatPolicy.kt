package app.clauseguard.ai

import org.json.JSONArray
import org.json.JSONObject

/** Shape/size checks only. Shared JS engine owns masking and approval authority. */
internal class NativeChatFailure(val code: String) : Exception(code)
internal object NativeChatRelease {
    fun assertEnabled(): Unit = throw NativeChatFailure("release_pending")
}
internal data class NativeChatRequest(val system: String, val input: String, val model: String, val schema: JSONObject, val timeoutMs: Long)
internal object NativeChatPolicy {
    const val MODEL = "gemini-3.5-flash-lite"
    private fun invalid(): Nothing = throw NativeChatFailure("invalid_request")
    private fun requireValid(value: Boolean) { if (!value) invalid() }
    private fun keys(o: JSONObject, vararg expected: String) = o.keys().asSequence().toSet() == expected.toSet()
    private fun text(value: Any?, max: Int): String =
        (value as? String)?.takeIf { it.isNotBlank() && it.length <= max } ?: invalid()
    private fun same(a: Any?, b: Any?): Boolean = when {
        a is JSONObject && b is JSONObject -> a.keys().asSequence().toSet() == b.keys().asSequence().toSet() && a.keys().asSequence().all { same(a.get(it), b.get(it)) }
        a is JSONArray && b is JSONArray -> a.length() == b.length() && (0 until a.length()).all { same(a.get(it), b.get(it)) }
        a is Number && b is Number -> a.toDouble() == b.toDouble()
        else -> a == b
    }
    fun schema() = JSONObject("""{"type":"object","properties":{"status":{"type":"string","enum":["answered","insufficient_context"]},"answer":{"type":"string"},"citations":{"type":"array","items":{"type":"string"},"maxItems":10}},"required":["status","answer","citations"],"additionalProperties":false}""")
    fun validate(options: JSONObject): NativeChatRequest {
        requireValid(keys(options, "system", "input", "model", "schema", "cloudOnly", "timeoutMs"))
        requireValid(options.opt("cloudOnly") == true)
        val timeout = options.opt("timeoutMs") as? Number ?: invalid()
        requireValid(timeout.toDouble() == 30_000.0)
        val system = text(options.opt("system"), 4096)
        val input = text(options.opt("input"), 600_000)
        val model = text(options.opt("model"), 100)
        requireValid(model == MODEL && same(options.opt("schema"), schema()))
        val payload = JSONObject(input)
        requireValid(keys(payload, "contract", "history", "question"))
        val contract = payload.optJSONArray("contract") ?: invalid()
        val history = payload.optJSONArray("history") ?: invalid()
        val question = payload.optJSONObject("question") ?: invalid()
        requireValid(contract.length() in 1..40 && history.length() <= 14 && history.length() % 2 == 0 && keys(question, "text"))
        text(question.opt("text"), 2000)
        val ids = mutableSetOf<String>()
        var total = 0
        for (i in 0 until contract.length()) {
            val clause = contract.optJSONObject(i) ?: invalid()
            requireValid(keys(clause, "id", "text") || keys(clause, "id", "text", "type"))
            requireValid(ids.add(text(clause.opt("id"), 1000)))
            total += text(clause.opt("text"), 6000).length
            if (clause.has("type")) text(clause.opt("type"), 100)
        }
        requireValid(total <= 60_000)
        var historySize = 0
        for (i in 0 until history.length()) {
            val turn = history.optJSONObject(i) ?: invalid()
            if (i % 2 == 0) {
                requireValid(keys(turn, "role", "text") && turn.opt("role") == "user")
                historySize += text(turn.opt("text"), 2000).length
            } else {
                requireValid(keys(turn, "role", "content") && turn.opt("role") == "assistant")
                val content = turn.optJSONObject("content") ?: invalid()
                requireValid(keys(content, "status", "answer", "citations"))
                val status = text(content.opt("status"), 100)
                requireValid(status in listOf("answered", "insufficient_context"))
                val answer = text(content.opt("answer"), 6000)
                val citations = content.optJSONArray("citations") ?: invalid()
                requireValid(citations.length() <= 10 && (status != "answered" || citations.length() > 0))
                val seen = mutableSetOf<String>()
                var citationSize = 0
                for (j in 0 until citations.length()) {
                    val id = text(citations.opt(j), 1000)
                    requireValid(id in ids && seen.add(id))
                    citationSize += id.length
                }
                historySize += answer.length + status.length + citationSize
            }
        }
        requireValid(historySize <= 20_000)
        return NativeChatRequest(system, input, model, schema(), 30_000L)
    }
}
