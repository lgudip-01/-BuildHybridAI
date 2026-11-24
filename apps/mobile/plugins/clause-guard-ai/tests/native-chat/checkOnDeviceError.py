#!/usr/bin/env python3
"""Exercise the actual iOS onDevice catch body without requiring Firebase/Capacitor.

Only NSLog's sink is substituted to capture its exact format/arguments. The catch
body, debug conditional and JavaScript rejection expression come from the plugin.
This is an error-boundary regression, not a full native SDK build or model call.
"""
import re
import subprocess
import sys
import tempfile
from pathlib import Path

plugin = Path(sys.argv[1]) if len(sys.argv) > 1 else (
    Path(__file__).resolve().parents[2] / "ios/Sources/ClauseGuardAIPlugin/ClauseGuardAIPlugin.swift"
)
source = plugin.read_text()
start = source.index("    @objc func onDevice(")
end = source.index("    // MARK: - chat", start)
method = source[start:end]
matches = re.findall(r"\} catch \{\n(.*?)\n                \}\n            \}\n            return", method, re.S)
if len(matches) != 1:
    raise SystemExit("Expected exactly one onDevice error handler; review the harness after source changes.")
body = matches[0].replace("NSLog(", "captureLog(")
harness = r'''import Foundation

struct EchoError: LocalizedError {
    let secret: String
    var errorDescription: String? { secret }
}

@MainActor func exercise(_ error: any Error) {
    final class MockCall {
        var rejections: [String] = []
        func reject(_ message: String) { rejections.append(message) }
    }
    let call = MockCall()
    var logs: [String] = []
    func captureLog(_ format: String, _ arguments: CVarArg...) {
        logs.append(String(format: format, arguments: arguments))
    }
    // Exact plugin catch body begins here, with only the NSLog sink renamed.
__CATCH_BODY__
    // Exact plugin catch body ends here.
    guard call.rejections == ["On-device generation failed."] else {
        print("Unsafe or unexpected JavaScript rejection"); exit(1)
    }
    guard logs.allSatisfy({ !$0.contains("SYNTHETIC_PRIVATE") }) else {
        print("Provider error text escaped into logging"); exit(1)
    }
    #if DEBUG
    guard logs.count == 1, logs[0].hasPrefix("ClauseGuardAI onDevice failed: ") else {
        print("Debug logging must contain only its fixed prefix and error type"); exit(1)
    }
    #else
    guard logs.isEmpty else { print("Release handler logged an error"); exit(1) }
    #endif
}

let secret = "SYNTHETIC_PRIVATE contract party, account and question"
let errors: [any Error] = [
    NSError(domain: "SYNTHETIC_PRIVATE_PROVIDER", code: 7,
            userInfo: [NSLocalizedDescriptionKey: secret]),
    EchoError(secret: secret),
]
for error in errors {
    guard error.localizedDescription.contains("SYNTHETIC_PRIVATE") else {
        print("Fixture does not exercise a provider error that echoes input"); exit(1)
    }
    exercise(error)
}
print("2 echoing-error fixtures passed; no provider/Capacitor calls.")
'''.replace("__CATCH_BODY__", body)
with tempfile.TemporaryDirectory(prefix="clauseguard-error-check-") as temporary:
    root = Path(temporary)
    swift = root / "main.swift"
    swift.write_text(harness)
    for configuration in ("release", "debug"):
        executable = root / configuration
        command = ["swiftc", "-swift-version", "6", "-strict-concurrency=complete",
                   "-module-cache-path", str(root / "module-cache")]
        if configuration == "debug":
            command += ["-D", "DEBUG"]
        subprocess.run(command + [str(swift), "-o", str(executable)], check=True)
        subprocess.run([str(executable)], check=True)
        print(f"{configuration}: actual onDevice catch passed", flush=True)
print("4 error-boundary checks passed. This does not establish SDK/device acceptance.")
