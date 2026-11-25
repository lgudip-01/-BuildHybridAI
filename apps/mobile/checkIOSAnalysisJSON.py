#!/usr/bin/env python3
"""Execute the actual analysis generation-options/dispatch snippet with SDK stand-ins.

No Firebase SDK, session, model, network or private config is used. This verifies
source branching/forwarding, not native SDK linkage or real JSON enforcement.
"""
import subprocess
import sys
import tempfile
from pathlib import Path

mobile = Path(__file__).resolve().parent
support = Path(sys.argv[1]) if len(sys.argv) > 1 else mobile / 'plugins/clause-guard-ai/ios/Sources/ClauseGuardAIPlugin/AnalysisSupport.swift'
method = support.read_text().split('static func run(source: String,', 1)[1]
start = 'let options: any GenerationOptionsRepresentable'
end = '// Do not trust the request: confirm which model really answered.'
if method.count(start) != 1 or method.count(end) != 1:
    raise SystemExit('Expected cloud/device generation-options dispatch in actual analysis source; no SDK stand-in was run.')
snippet = method.split(start, 1)[1].split(end, 1)[0]
snippet = start + snippet
harness = r'''import Foundation
protocol GenerationOptionsRepresentable {}
struct GenerationConfig: GenerationOptionsRepresentable { let responseMIMEType: String }
enum ResponseGenerationOptions: GenerationOptionsRepresentable { case `default` }
struct Response { let content: String }
enum SyntheticError: Error { case expected }
@MainActor final class Session {
    var calls = 0
    var received: (any GenerationOptionsRepresentable)?
    var shouldThrow = false
    var reply = "{\"risk\":\"low\"}"
    func respond(to prompt: String, options: any GenerationOptionsRepresentable = ResponseGenerationOptions.default) async throws -> Response {
        precondition(prompt == "SYNTHETIC_MASKED_PROMPT")
        calls += 1
        received = options
        if shouldThrow { throw SyntheticError.expected }
        return Response(content: reply)
    }
}
@MainActor func dispatch(source: String, session: Session) async throws -> String {
    let prompt = "SYNTHETIC_MASKED_PROMPT"
__SNIPPET__
    return response.content
}
@main struct Check {
    @MainActor static func main() async throws {
        let cloud = Session()
        let cloudReply = try await dispatch(source: "cloud", session: cloud)
        precondition(cloudReply == cloud.reply && cloud.calls == 1)
        precondition((cloud.received as? GenerationConfig)?.responseMIMEType == "application/json")
        print("PASS: cloud requests JSON MIME through actual respond options; one dispatch")
        let device = Session()
        let deviceReply = try await dispatch(source: "device", session: device)
        precondition(deviceReply == device.reply && device.calls == 1)
        precondition(device.received is ResponseGenerationOptions)
        print("PASS: device retains default options and unchanged response")
        for source in ["cloud", "device"] {
            let failing = Session(); failing.shouldThrow = true
            do { _ = try await dispatch(source: source, session: failing); fatalError("Expected failure") }
            catch SyntheticError.expected {}
            precondition(failing.calls == 1)
            print("PASS: \(source) error propagates without retry or fallback")
        }
        let fenced = Session(); fenced.reply = "```json\n{}\n```"
        let unchanged = try await dispatch(source: "cloud", session: fenced)
        precondition(unchanged == fenced.reply)
        print("PASS: response is not stripped or rewritten; strict downstream validation remains responsible")
    }
}
'''.replace('__SNIPPET__', snippet)
with tempfile.TemporaryDirectory(prefix='clauseguard-json-options-') as temp:
    work = Path(temp)
    (work / 'main.swift').write_text(harness)
    subprocess.run(['swiftc', '-parse-as-library', '-swift-version', '6', '-strict-concurrency=complete',
                    '-module-cache-path', str(work / 'module-cache'), str(work / 'main.swift'), '-o', str(work / 'check')], check=True)
    subprocess.run([str(work / 'check')], check=True)
