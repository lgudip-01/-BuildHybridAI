#!/usr/bin/env python3
"""Exercise the real Xcode config-copy phase in an isolated synthetic build tree.

No real Firebase config is opened, no app is launched, and no SDK/provider call
is made. Xcode build sandboxing, signing and app runtime remain separate checks.
"""
import json
import plistlib
import subprocess
import sys
import tempfile
from pathlib import Path

mobile = Path(__file__).resolve().parent
project = Path(sys.argv[1]) if len(sys.argv) > 1 else mobile / "ios/App/App.xcodeproj/project.pbxproj"
parsed = subprocess.run(
    ["/usr/bin/plutil", "-convert", "json", "-o", "-", str(project)],
    check=True, capture_output=True, text=True,
)
objects = json.loads(parsed.stdout)["objects"]
phases = [(key, value) for key, value in objects.items()
          if value.get("isa") == "PBXShellScriptBuildPhase"
          and value.get("name") == "Copy Firebase config if present"]
if len(phases) != 1:
    raise SystemExit("Expected exactly one Firebase config build phase; no synthetic script was run.")
phase_id, phase = phases[0]
targets = [obj for obj in objects.values()
           if obj.get("isa") == "PBXNativeTarget" and obj.get("name") == "App"]
assert len(targets) == 1
order = targets[0]["buildPhases"]
assert order.count(phase_id) == 1
resource_positions = [i for i, key in enumerate(order)
                      if objects[key].get("isa") == "PBXResourcesBuildPhase"]
assert resource_positions and order.index(phase_id) > max(resource_positions)
assert phase["shellPath"] == "/bin/sh"
assert str(phase["alwaysOutOfDate"]) == "1"
assert str(phase["runOnlyForDeploymentPostprocessing"]) == "0"
script = phase["shellScript"]
subprocess.run(["/bin/sh", "-n"], input=script, text=True, check=True)
print("PASS: parsed Xcode phase is scheduled once after Resources for every build; shell syntax valid")

with tempfile.TemporaryDirectory(prefix="clauseguard-config-bundle-") as scratch:
    root = Path(scratch)
    source_root = root / "project with spaces"
    (source_root / "App").mkdir(parents=True)
    build = root / "build with spaces"
    bundle = build / "App Bundle.app"
    bundle.mkdir(parents=True)
    source = source_root / "App/GoogleService-Info.plist"
    destination = bundle / "GoogleService-Info.plist"
    neighbor = bundle / "Info.plist"
    other_app = build / "Other.app/GoogleService-Info.plist"
    other_app.parent.mkdir()
    neighbor.write_bytes(b"KEEP_APP_INFO")
    other_app.write_bytes(b"KEEP_OTHER_APP_CONFIG")
    env = {"PATH": "/usr/bin:/bin", "SRCROOT": str(source_root),
           "TARGET_BUILD_DIR": str(build), "UNLOCALIZED_RESOURCES_FOLDER_PATH": "App Bundle.app"}

    def run(expect_success=True):
        result = subprocess.run(["/bin/sh"], input=script, text=True, env=env,
                                capture_output=True)
        assert (result.returncode == 0) == expect_success
        assert neighbor.read_bytes() == b"KEEP_APP_INFO"
        assert other_app.read_bytes() == b"KEEP_OTHER_APP_CONFIG"

    run()
    assert not destination.exists()
    print("PASS: absent config builds without creating a bundled config")

    first = plistlib.dumps({"PROJECT_ID": "synthetic-first", "GOOGLE_APP_ID": "synthetic-app"})
    source.write_bytes(first)
    run()
    assert destination.read_bytes() == first
    assert source.read_bytes() == first
    print("PASS: present synthetic plist copied byte-for-byte through paths with spaces; input preserved")

    second = plistlib.dumps({"PROJECT_ID": "synthetic-second", "GOOGLE_APP_ID": "another-synthetic-app"})
    source.write_bytes(second)
    run()
    assert destination.read_bytes() == second
    print("PASS: changed config replaces the previous bundled version")

    source.unlink()
    run()
    assert not destination.exists()
    print("PASS: removing config removes its stale bundled copy")

    destination.write_bytes(first)
    run()
    assert not destination.exists()
    run()
    print("PASS: cleanup is repeatable and preserves app metadata and neighboring bundles")

    source.write_bytes(first)
    env["UNLOCALIZED_RESOURCES_FOLDER_PATH"] = "Missing Bundle.app"
    run(expect_success=False)
    assert not (build / "Missing Bundle.app/GoogleService-Info.plist").exists()
    print("PASS: copy failure fails the build phase instead of reporting success")

repo = mobile.parents[1]
for relative in ["apps/mobile/ios/App/App/GoogleService-Info.plist", "apps/mobile/android/app/google-services.json"]:
    subprocess.run(["git", "check-ignore", "-q", "--", relative], cwd=repo, check=True)
    tracked = subprocess.run(["git", "ls-files", "--error-unmatch", "--", relative],
                             cwd=repo, capture_output=True)
    assert tracked.returncode != 0
print("PASS: Android/iOS config paths remain ignored and untracked; no private config read")
print("iOS config bundling: 8 checks passed. No Xcode, Firebase or provider execution.")
