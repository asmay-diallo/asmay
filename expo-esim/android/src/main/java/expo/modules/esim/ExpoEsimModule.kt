package expo.modules.esim

import android.content.Context
import android.os.Build
import android.telephony.euicc.DownloadableSubscription
import android.telephony.euicc.EuiccManager
import androidx.annotation.RequiresApi
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoEsimModule : Module() {

    override fun definition() = ModuleDefinition {
        Name("ExpoEsim")

        // Vérifier la compatibilité eSIM
        AsyncFunction("checkCompatibility") {
            try {
                val euiccManager = appContext.reactContext
                    ?.getSystemService(Context.EUICC_SERVICE) as? EuiccManager

                if (euiccManager != null && euiccManager.isEnabled) {
                    mapOf(
                        "isCompatible" to true,
                        "platform" to "android",
                        "eid" to (euiccManager.eid ?: "non disponible")
                    )
                } else {
                    mapOf(
                        "isCompatible" to false,
                        "platform" to "android",
                        "reason" to "eSIM non supportée sur cet appareil"
                    )
                }
            } catch (e: Exception) {
                mapOf(
                    "isCompatible" to false,
                    "platform" to "android",
                    "reason" to (e.message ?: "Erreur inconnue")
                )
            }
        }

        // Récupérer l'EID
        AsyncFunction("getEID") {
            val euiccManager = appContext.reactContext
                ?.getSystemService(Context.EUICC_SERVICE) as? EuiccManager
            euiccManager?.eid ?: throw Exception("EID non disponible")
        }

        // Installer une eSIM
        AsyncFunction("installESIM") { lpaString: String, iccid: String ->
            try {
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                    return@AsyncFunction mapOf(
                        "success" to false,
                        "iccid" to iccid,
                        "error" to "Android 10+ requis pour l'eSIM",
                        "errorCode" to "VERSION_TOO_OLD"
                    )
                }

                val euiccManager = appContext.reactContext
                    ?.getSystemService(Context.EUICC_SERVICE) as? EuiccManager
                    ?: return@AsyncFunction mapOf(
                        "success" to false,
                        "iccid" to iccid,
                        "error" to "EuiccManager non disponible",
                        "errorCode" to "NO_EUICC"
                    )

                // Parser la LPA string
                val parts = lpaString.replace("LPA:1$", "").split("$")
                if (parts.size < 2) {
                    return@AsyncFunction mapOf(
                        "success" to false,
                        "iccid" to iccid,
                        "error" to "Format LPA string invalide",
                        "errorCode" to "INVALID_LPA"
                    )
                }

                val smdpAddress = parts[0]
                val matchingId = parts[1]

                val subscription = DownloadableSubscription
                    .forActivationCode(matchingId)
                    .setSmdpAddress(smdpAddress)
                    .build()

                val intent = euiccManager.downloadSubscriptionIntent(subscription, true)
                appContext.currentActivity?.startActivityForResult(intent, 100)

                mapOf(
                    "success" to true,
                    "iccid" to iccid,
                    "message" to "Installation démarrée"
                )
            } catch (e: Exception) {
                mapOf(
                    "success" to false,
                    "iccid" to iccid,
                    "error" to (e.message ?: "Erreur inconnue"),
                    "errorCode" to "INSTALL_FAILED"
                )
            }
        }

        // Récupérer les eSIM installées
        AsyncFunction("getInstalledESIMs") {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                return@AsyncFunction emptyList<String>()
            }
            val euiccManager = appContext.reactContext
                ?.getSystemService(Context.EUICC_SERVICE) as? EuiccManager
            euiccManager?.enabledProfiles?.map { it.iccid } ?: emptyList()
        }

        // Supprimer une eSIM
        AsyncFunction("deleteESIM") { iccid: String ->
            try {
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                    return@AsyncFunction false
                }
                val euiccManager = appContext.reactContext
                    ?.getSystemService(Context.EUICC_SERVICE) as? EuiccManager
                euiccManager.deleteSubscription(iccid, appContext.currentActivity?.intent)
                true
            } catch (e: Exception) {
                false
            }
        }
    }
}