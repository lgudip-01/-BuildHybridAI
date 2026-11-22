// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ClauseGuardClauseGuardAi",
    platforms: [.iOS("15.0")],
    products: [.library(name: "ClauseGuardClauseGuardAi", targets: ["ClauseGuardAIPlugin"])],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.6.0"),
        // Hybrid inference in Firebase AI Logic needs 12.13.0 or later, and only works through Swift Package Manager.
        .package(url: "https://github.com/firebase/firebase-ios-sdk.git", from: "12.13.0"),
    ],
    targets: [
        .target(
            name: "ClauseGuardAIPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "FirebaseCore", package: "firebase-ios-sdk"),
                .product(name: "FirebaseAILogic", package: "firebase-ios-sdk"),
                .product(name: "FirebaseAppCheck", package: "firebase-ios-sdk"),
            ],
            path: "ios/Sources/ClauseGuardAIPlugin"),
    ]
)
