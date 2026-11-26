import Capacitor
import Foundation

#if os(iOS) && canImport(VisionKit) && canImport(Vision)
import AVFoundation
import UIKit
import Vision
import VisionKit

/// Camera scanning for paper contracts (#62). Apple's document camera captures and straightens the pages, and
/// Vision reads their text, both on this device. Page images stay in memory and are released as soon as each
/// page is read: nothing is written to disk or the photo library, and nothing here logs recognized text.
final class DocumentScanner: NSObject, VNDocumentCameraViewControllerDelegate {
    enum Failure: Error { case canceled, unavailable, permissionDenied, failed }
    typealias Completion = (Result<JSArray, Failure>) -> Void

    private let completion: Completion
    /// The camera's delegate is weak, so the scanner keeps itself alive until it has answered.
    private var retainedSelf: DocumentScanner?

    private init(completion: @escaping Completion) {
        self.completion = completion
    }

    /// Call on the main thread.
    static func scan(from presenter: UIViewController, completion: @escaping Completion) {
        // False in the simulator and on devices without a camera.
        guard VNDocumentCameraViewController.isSupported else { return completion(.failure(.unavailable)) }
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            start(from: presenter, completion: completion)
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                DispatchQueue.main.async {
                    if granted { start(from: presenter, completion: completion) }
                    else { completion(.failure(.permissionDenied)) }
                }
            }
        default:
            completion(.failure(.permissionDenied))
        }
    }

    private static func start(from presenter: UIViewController, completion: @escaping Completion) {
        let scanner = DocumentScanner(completion: completion)
        scanner.retainedSelf = scanner
        let camera = VNDocumentCameraViewController()
        camera.delegate = scanner
        presenter.present(camera, animated: true)
    }

    private func finish(_ controller: VNDocumentCameraViewController, _ result: Result<JSArray, Failure>) {
        controller.dismiss(animated: true)
        completion(result)
        retainedSelf = nil
    }

    func documentCameraViewControllerDidCancel(_ controller: VNDocumentCameraViewController) {
        finish(controller, .failure(.canceled))
    }

    func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFailWithError error: Error) {
        // The error is not passed on or logged.
        finish(controller, .failure(.failed))
    }

    func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFinishWith scan: VNDocumentCameraScan) {
        controller.dismiss(animated: true)
        DispatchQueue.global(qos: .userInitiated).async {
            var pages: JSArray = []
            var failed = false
            for index in 0..<scan.pageCount {
                // Each page's image is released before the next one is made.
                autoreleasepool {
                    guard !failed else { return }
                    do { pages.append(["lines": try Self.lines(in: scan.imageOfPage(at: index))]) }
                    catch { failed = true }
                }
            }
            DispatchQueue.main.async {
                self.completion(failed ? .failure(.failed) : .success(pages))
                self.retainedSelf = nil
            }
        }
    }

    /// Each recognized line with its box as fractions of the page, measured from the top-left corner.
    static func lines(in image: UIImage) throws -> JSArray {
        guard let cgImage = image.cgImage else { throw Failure.failed }
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = true
        let handler = VNImageRequestHandler(cgImage: cgImage, orientation: orientation(of: image), options: [:])
        try handler.perform([request])
        return (request.results ?? []).compactMap { observation -> JSValue? in
            guard let text = observation.topCandidates(1).first?.string else { return nil }
            // Vision's boxes start at the bottom-left corner.
            let box = observation.boundingBox
            let line: JSObject = [
                "text": text,
                "x": Double(box.minX),
                "y": Double(1 - box.maxY),
                "w": Double(box.width),
                "h": Double(box.height),
            ]
            return line
        }
    }

    private static func orientation(of image: UIImage) -> CGImagePropertyOrientation {
        switch image.imageOrientation {
        case .up: return .up
        case .down: return .down
        case .left: return .left
        case .right: return .right
        case .upMirrored: return .upMirrored
        case .downMirrored: return .downMirrored
        case .leftMirrored: return .leftMirrored
        case .rightMirrored: return .rightMirrored
        @unknown default: return .up
        }
    }
}
#endif
