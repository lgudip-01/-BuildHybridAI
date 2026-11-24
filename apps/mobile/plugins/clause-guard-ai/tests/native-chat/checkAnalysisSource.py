#!/usr/bin/env python3
"""Execute the actual iOS analysis response-source guard with synthetic metadata.

The response-source guard is extracted unchanged from AnalysisSupport.run.
SDK/session calls are not executed. This is source-policy coverage, not native
SDK linkage, actual inference-source evidence, attestation, or device acceptance.
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

root = Path(__file__).resolve().parents[2]
ios = root / "ios/Sources/ClauseGuardAIPlugin"
support = Path(sys.argv[1]) if len(sys.argv) > 1 else ios / "AnalysisSupport.swift"
policy = Path(sys.argv[2]) if len(sys.argv) > 2 else ios / "NativeChatPolicy.swift"
source = support.read_text()
policy_source = policy.read_text()
analysis_source = (ios / "NativeAnalysisSource.swift").read_text()
method = source.split("static func run(source: String,", 1)[1]
marker = "// Do not trust the request: confirm which model really answered."
if method.count(marker) != 1 or method.count("return response.content") != 1:
    raise SystemExit("Expected one analysis response-source guard; review harness after source changes.")
guard = method.split(marker, 1)[1].split("return response.content", 1)[0]
model = "gemini-3.5-flash-lite"
device = "apple-foundation-models-system-language-model"
cases = [
    ("cloud exact", "cloud", model, model, True),
    ("cloud revision", "cloud", model, model + "-001", True),
    ("cloud revision upper bound", "cloud", model, model + "-999", True),
    ("cloud blank", "cloud", model, "", False),
    ("cloud whitespace", "cloud", model, "   ", False),
    ("cloud unknown", "cloud", model, "unknown-cloud", False),
    ("cloud other model", "cloud", model, "gemini-other", False),
    ("cloud device", "cloud", model, device, False),
    ("cloud device suffix", "cloud", model, model + "-device", False),
    ("cloud short revision", "cloud", model, model + "-01", False),
    ("cloud long revision", "cloud", model, model + "-0001", False),
    ("cloud leading whitespace", "cloud", model, " " + model, False),
    ("cloud trailing whitespace", "cloud", model, model + " ", False),
    ("cloud newline", "cloud", model, model + "\n", False),
    ("cloud revision newline", "cloud", model, model + "-001\n", False),
    ("cloud revision carriage return", "cloud", model, model + "-001\r", False),
    ("cloud other request model", "cloud", "gemini-other", model, False),
    ("cloud blank request model", "cloud", "", model, False),
    ("device exact", "device", model, device, True),
    ("device cloud", "device", model, model, False),
    ("device blank", "device", model, "", False),
    ("device unknown", "device", model, "unknown-device", False),
    ("unknown requested source", "unknown", model, model, False),
    ("whitespace requested source", "device ", model, model, False),
]

# Swift JSON string decoding keeps fixture construction exact, including newlines.
fixtures = json.dumps([list(c) for c in cases], ensure_ascii=True)
harness = '''import Foundation
struct RawResponse { let modelVersion: String }
struct Response { let rawResponse: RawResponse }
enum AnalysisError: Error { case wrongSource }
enum AnalysisSupport {
    static let deviceModelVersion = NativeAnalysisSource.deviceModelVersion
    static func accepts(source: String, model: String, version: String) -> Bool {
        let response = Response(rawResponse: RawResponse(modelVersion: version))
        do {
__GUARD__
            return true
        } catch { return false }
    }
}
let input = try Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1]))
let cases = try JSONSerialization.jsonObject(with: input) as! [[Any]]
var failed: [String] = []
for row in cases {
    let actual = AnalysisSupport.accepts(source: row[1] as! String, model: row[2] as! String, version: row[3] as! String)
    if actual != (row[4] as! Bool) { failed.append(row[0] as! String) }
}
if !failed.isEmpty {
    print("Source guard rejected policy expectations: " + failed.joined(separator: ", "))
    exit(1)
}
print("iOS analysis source guard: \\(cases.count) checks passed; no SDK/provider calls.")
'''.replace("__GUARD__", guard)

with tempfile.TemporaryDirectory(prefix="clauseguard-analysis-source-") as temp:
    work = Path(temp)
    (work / "main.swift").write_text(harness)
    # Compile immutable copies so a later edit cannot change an in-flight check.
    (work / "NativeChatPolicy.swift").write_text(policy_source)
    (work / "NativeAnalysisSource.swift").write_text(analysis_source)
    (work / "fixtures.json").write_text(fixtures)
    subprocess.run([
        "swiftc", "-swift-version", "6", "-strict-concurrency=complete",
        "-module-cache-path", str(work / "module-cache"),
        str(work / "NativeChatPolicy.swift"), str(work / "NativeAnalysisSource.swift"),
        str(work / "main.swift"), "-o", str(work / "check"),
    ], check=True)
    subprocess.run([str(work / "check"), str(work / "fixtures.json")], check=True)
