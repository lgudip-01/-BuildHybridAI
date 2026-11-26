package app.clauseguard.ai

import android.app.Activity
import android.content.Context
import android.net.Uri
import androidx.activity.result.IntentSenderRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.google.android.gms.tasks.Task
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions
import com.google.mlkit.vision.documentscanner.GmsDocumentScanning
import com.google.mlkit.vision.documentscanner.GmsDocumentScanningResult
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import kotlinx.coroutines.suspendCancellableCoroutine
import java.io.File
import java.util.concurrent.atomic.AtomicInteger
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

/**
 * Camera scanning for paper contracts (#62). Google's ML Kit document scanner runs its own capture screen through
 * Google Play services (so this app needs no camera permission), and the bundled ML Kit text recognizer reads each
 * page on this phone. The scanner writes page JPEGs to this app's cache; they are deleted as soon as they are read,
 * on success, failure and cancel. Nothing here logs recognized text or an error message.
 */
object DocumentScanner {
    class Failure(val code: String) : Exception(code)

    private val launches = AtomicInteger()

    private val options = GmsDocumentScannerOptions.Builder()
        .setGalleryImportAllowed(false) // camera only, as the button says
        .setResultFormats(GmsDocumentScannerOptions.RESULT_FORMAT_JPEG) // no PDF copy to clean up
        .setScannerMode(GmsDocumentScannerOptions.SCANNER_MODE_FULL)
        .build()

    /** Opens the scanner and calls back on the main thread with the page images, or a Failure code. */
    fun capture(activity: AppCompatActivity, done: (Result<List<Uri>>) -> Unit) {
        GmsDocumentScanning.getClient(options).getStartScanIntent(activity)
            .addOnFailureListener { done(Result.failure(Failure("UNAVAILABLE"))) } // no Play services or module
            .addOnSuccessListener { sender ->
                // Registered without a lifecycle so a plugin can use it after the activity started; removed after one use.
                val key = "clauseguard-scan-${launches.incrementAndGet()}"
                var launcher: androidx.activity.result.ActivityResultLauncher<IntentSenderRequest>? = null
                launcher = activity.activityResultRegistry.register(key, ActivityResultContracts.StartIntentSenderForResult()) { result ->
                    launcher?.unregister()
                    val pages = GmsDocumentScanningResult.fromActivityResultIntent(result.data)?.pages?.map { it.imageUri }.orEmpty()
                    when {
                        result.resultCode == Activity.RESULT_OK -> done(Result.success(pages))
                        result.resultCode == Activity.RESULT_CANCELED -> { delete(activity, pages); done(Result.failure(Failure("CANCELED"))) }
                        else -> { delete(activity, pages); done(Result.failure(Failure("SCAN_FAILED"))) }
                    }
                }
                try {
                    launcher.launch(IntentSenderRequest.Builder(sender).build())
                } catch (e: Exception) {
                    launcher.unregister()
                    done(Result.failure(Failure("SCAN_FAILED")))
                }
            }
    }

    /** Reads every page, deleting each image whatever happens. Lines are fractions of the page from its top-left corner. */
    suspend fun read(context: Context, pages: List<Uri>): JSArray {
        val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
        try {
            val result = JSArray()
            for (uri in pages) {
                val image = InputImage.fromFilePath(context, uri)
                val text = recognizer.process(image).awaitResult()
                // Box coordinates follow the image as recognized, which is rotated when rotationDegrees is 90 or 270.
                val turned = image.rotationDegrees % 180 != 0
                val width = (if (turned) image.height else image.width).toDouble()
                val height = (if (turned) image.width else image.height).toDouble()
                val lines = JSArray()
                for (block in text.textBlocks) {
                    for (line in block.lines) {
                        val box = line.boundingBox ?: continue
                        if (width <= 0 || height <= 0) continue
                        lines.put(JSObject()
                            .put("text", line.text)
                            .put("x", box.left / width)
                            .put("y", box.top / height)
                            .put("w", box.width() / width)
                            .put("h", box.height() / height))
                    }
                }
                result.put(JSObject().put("lines", lines))
            }
            return result
        } finally {
            recognizer.close()
            delete(context, pages)
        }
    }

    /** Deletes the scanner's page files, and its folder in this app's cache once that is empty. */
    fun delete(context: Context, pages: List<Uri>) {
        val cache = context.cacheDir.canonicalFile
        for (uri in pages) {
            try {
                if (uri.scheme == "file") {
                    val file = File(uri.path ?: continue).canonicalFile
                    file.delete()
                    val folder = file.parentFile
                    if (folder != null && folder != cache && folder.startsWith(cache) && folder.list()?.isEmpty() == true) folder.delete()
                } else {
                    context.contentResolver.delete(uri, null, null)
                }
            } catch (e: Exception) {
                // Nothing to report: the file is gone or was never ours.
            }
        }
    }

    private suspend fun <T> Task<T>.awaitResult(): T = suspendCancellableCoroutine { continuation ->
        addOnSuccessListener { continuation.resume(it) }
        addOnFailureListener { continuation.resumeWithException(Failure("SCAN_FAILED")) }
        addOnCanceledListener { continuation.resumeWithException(Failure("SCAN_FAILED")) }
    }
}
