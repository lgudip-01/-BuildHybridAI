// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ClauseGuardClauseGuardAi",
    platforms: [.iOS("15.0")],
    products: [.library(name: "ClauseGuardClauseGuardAi", targets: ["ClauseGuardAIPlugin"])],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.6.0"),
        // TODO: add firebase-ios-sdk (FirebaseAI, FirebaseAppCheck) when the native methods are implemented.
    ],
    targets: [
        .target(
            name: "ClauseGuardAIPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
            ],
            path: "ios/Sources/ClauseGuardAIPlugin"),
    ]
)
