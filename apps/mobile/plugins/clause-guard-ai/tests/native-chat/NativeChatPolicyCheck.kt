package app.clauseguard.ai

import java.io.File
import org.json.JSONArray

fun main(args: Array<String>) {
    val fixtures = org.json.JSONObject(File(args[0]).readText())
    fun expanded(value: Any): Any = when (value) {
        "\$SYSTEM" -> fixtures.get("system")
        "\$SCHEMA" -> fixtures.get("schema")
        is JSONArray -> JSONArray().also { array -> for (i in 0 until value.length()) array.put(expanded(value.get(i))) }
        is org.json.JSONObject -> when {
            value.has("\$repeat") -> value.getString("\$repeat").repeat(value.getInt("count"))
            value.has("\$payload") -> expanded(value.get("\$payload")).toString()
            else -> org.json.JSONObject().also { result -> value.keys().forEach { key -> result.put(key, expanded(value.get(key))) } }
        }
        else -> value
    }
    val cases = fixtures.getJSONArray("cases")
    var passed = 0
    for (i in 0 until cases.length()) {
        val fixture = cases.getJSONObject(i)
        val accepted = try { NativeChatPolicy.validate(expanded(fixture.getJSONObject("request")) as org.json.JSONObject); true } catch (e: Exception) { false }
        check(accepted == fixture.getBoolean("valid")) { "Native policy mismatch: ${fixture.getString("name")}" }
        passed++
    }
    try { NativeChatRelease.assertEnabled(); error("Release gate enabled") }
    catch (e: NativeChatFailure) { check(e.code == "release_pending"); passed++ }
    println("Kotlin native policy: $passed checks passed; release blocked; no SDK/provider calls.")
}
