package app.clauseguard.ai

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * Keeps the privacy vault's AES-256 key on the device.
 *
 * Android Keystore can't hand out the bytes of a key it holds, so the vault key is 32 random bytes that are
 * sealed with a Keystore key (which never leaves secure hardware) and stored in private app storage.
 */
object VaultKeystore {
    private const val WRAP_ALIAS = "clauseguard_vault_wrap"
    private const val PREFS = "clauseguard_vault"
    private const val PREF_KEY = "sealed_key"

    /** The vault key as base64, created on first use. */
    @Synchronized
    fun keyBase64(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val sealed = prefs.getString(PREF_KEY, null)
        if (sealed != null) {
            return Base64.encodeToString(open(Base64.decode(sealed, Base64.NO_WRAP)), Base64.NO_WRAP)
        }
        val raw = ByteArray(32).also { SecureRandom().nextBytes(it) }
        prefs.edit().putString(PREF_KEY, Base64.encodeToString(seal(raw), Base64.NO_WRAP)).apply()
        return Base64.encodeToString(raw, Base64.NO_WRAP)
    }

    private fun wrapKey(): SecretKey {
        val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (store.getKey(WRAP_ALIAS, null) as? SecretKey)?.let { return it }
        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        generator.init(
            KeyGenParameterSpec.Builder(WRAP_ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .build(),
        )
        return generator.generateKey()
    }

    // Stored as: 12-byte IV followed by the ciphertext.
    private fun seal(raw: ByteArray): ByteArray {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding").apply { init(Cipher.ENCRYPT_MODE, wrapKey()) }
        return cipher.iv + cipher.doFinal(raw)
    }

    private fun open(sealed: ByteArray): ByteArray {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding").apply {
            init(Cipher.DECRYPT_MODE, wrapKey(), GCMParameterSpec(128, sealed.copyOfRange(0, 12)))
        }
        return cipher.doFinal(sealed, 12, sealed.size - 12)
    }
}
