import Foundation
import Security

/// Keeps the privacy vault's AES-256 key in the Keychain.
enum VaultKeychain {
    struct Failure: Error { let status: OSStatus }

    private static let service = "app.clauseguard.vault"
    private static let account = "vault-key"

    private static var query: [String: Any] {
        [kSecClass as String: kSecClassGenericPassword,
         kSecAttrService as String: service,
         kSecAttrAccount as String: account]
    }

    /// Returns the existing key, or creates and stores 32 random bytes.
    static func key() throws -> Data {
        var read = query
        read[kSecReturnData as String] = true
        read[kSecMatchLimit as String] = kSecMatchLimitOne
        var item: CFTypeRef?
        let status = SecItemCopyMatching(read as CFDictionary, &item)
        if status == errSecSuccess, let data = item as? Data, data.count == 32 { return data }
        if status != errSecSuccess && status != errSecItemNotFound { throw Failure(status: status) }

        var bytes = [UInt8](repeating: 0, count: 32)
        let random = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        guard random == errSecSuccess else { throw Failure(status: random) }
        let data = Data(bytes)

        var add = query
        add[kSecValueData as String] = data
        // Only readable while the phone is unlocked, and never moved to another device or backup.
        add[kSecAttrAccessible as String] = kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        let added = SecItemAdd(add as CFDictionary, nil)
        guard added == errSecSuccess else { throw Failure(status: added) }
        return data
    }
}
