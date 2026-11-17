// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ClauseGuardAI",
    platforms: [.iOS(.v26)],
    products: [.library(name: "ClauseGuardAI", targets: ["ClauseGuardAIPlugin"])],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.4.0"),
        .package(url: "https://github.com/firebase/firebase-ios-sdk.git", from: "12.0.0"),
    ],
    targets: [
        .target(
            name: "ClauseGuardAIPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "FirebaseAI", package: "firebase-ios-sdk"),
                .product(name: "FirebaseAppCheck", package: "firebase-ios-sdk"),
            ],
            path: "ios/Sources/ClauseGuardAIPlugin"),
    ]
)
