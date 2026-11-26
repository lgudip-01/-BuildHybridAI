// Static privacy checks for camera scanning (#62). Reads source files only: no device, camera, SDK or network.
// Scanned text is raw contract text, so the native scanner code must not log it, keep page images, or put
// anything but fixed strings in its errors. Run: node apps/mobile/checkScanPrivacy.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const mobile = new URL('./', import.meta.url);
const read = (path) => readFile(new URL(path, mobile), 'utf8');
const code = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''); // comments may name what is banned

const swift = code(await read('plugins/clause-guard-ai/ios/Sources/ClauseGuardAIPlugin/DocumentScanner.swift'));
const kotlin = code(await read('plugins/clause-guard-ai/android/src/main/java/app/clauseguard/ai/DocumentScanner.kt'));
const swiftPlugin = code(await read('plugins/clause-guard-ai/ios/Sources/ClauseGuardAIPlugin/ClauseGuardAIPlugin.swift'));
const kotlinPlugin = code(await read('plugins/clause-guard-ai/android/src/main/java/app/clauseguard/ai/ClauseGuardAIPlugin.kt'));

// 1. No logging in either scanner.
for (const [name, source, banned] of [
  ['iOS scanner', swift, /\b(NSLog|print|debugPrint|dump|os_log|Logger)\s*\(/],
  ['Android scanner', kotlin, /\b(Log\.[a-z]+|println|print|printStackTrace)\s*\(/],
]) {
  assert.doesNotMatch(source, banned, `${name} must not log`);
}
console.log('PASS: neither native scanner logs');

// 2. iOS keeps page images in memory only.
assert.doesNotMatch(swift, /UIImageWriteToSavedPhotosAlbum|PHPhotoLibrary|PHAsset|FileManager|\.write\(to:|jpegData|pngData|heicData/,
  'iOS scanner must not save page images');
assert.match(swift, /autoreleasepool/, 'iOS scanner must release each page image before the next');
console.log('PASS: iOS scanner never writes page images to disk or the photo library');

// 3. Android asks for images only, camera only, and deletes them on every path.
assert.doesNotMatch(kotlin, /RESULT_FORMAT_PDF/, 'Android scanner must not request a PDF copy');
assert.match(kotlin, /setGalleryImportAllowed\(false\)/, 'Android scanner is camera only');
assert.match(kotlin, /finally\s*\{[^}]*delete\(context, pages\)/, 'Android read() must delete pages in finally');
const callback = kotlin.split('activityResultRegistry.register', 2)[1]?.split('try {', 1)[0] ?? '';
assert.equal((callback.match(/delete\(activity, pages\)/g) ?? []).length, 2, 'Android must delete pages on cancel and on failure');
assert.match(kotlin, /TextRecognizerOptions\.DEFAULT_OPTIONS/, 'Android uses the bundled Latin recognizer');
console.log('PASS: Android scanner keeps JPEGs only until read and deletes them on success, cancel and failure');

// 4. Rejections are fixed strings: no interpolation that could carry recognized text or an error message.
for (const [name, source, method] of [
  ['iOS', swiftPlugin, /func scanDocument[\s\S]*?\n {4}\}\n/],
  ['Android', kotlinPlugin, /fun scanDocument[\s\S]*?\n {4}\}\n/],
]) {
  const body = source.match(method)?.[0];
  assert.ok(body, `${name} scanDocument method must exist`);
  const rejects = [...body.matchAll(/call\.reject\(([^)]*)\)/g)].map((m) => m[1]);
  assert.ok(rejects.length >= 4, `${name} scanDocument should reject each failure with its own code`);
  for (const args of rejects) {
    assert.match(args, /^"[^"\\$]*", "(CANCELED|UNAVAILABLE|PERMISSION_DENIED|SCAN_FAILED)"$/, `${name} rejection must be a fixed string and code: ${args}`);
  }
}
console.log('PASS: scanDocument rejects with fixed messages and codes only');

// 5. Permissions: iOS explains camera use; Android needs no camera permission (the scanner runs in Play services).
const plist = await read('ios/App/App/Info.plist');
assert.match(plist, /<key>NSCameraUsageDescription<\/key>\s*<string>[^<]{20,}<\/string>/, 'iOS needs a camera usage description');
for (const manifest of ['android/app/src/main/AndroidManifest.xml', 'plugins/clause-guard-ai/android/src/main/AndroidManifest.xml']) {
  assert.doesNotMatch(await read(manifest), /android\.permission\.CAMERA/, `${manifest} must not request the camera permission`);
}
console.log('PASS: iOS camera purpose string present; Android requests no camera permission');
