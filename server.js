require("dotenv").config();

const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Frontend React construit (npm run build dans client/)
const distPath = path.join(__dirname, "client", "dist");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(distPath));

// Vérifier que le serveur fonctionne
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "PayDemo fonctionne !",
  });
});

// Initier un paiement OPENPAY
app.post("/api/payments", async (req, res) => {
  try {
    const { amount, phone, provider } = req.body;

    // 1. Vérifier les données reçues
    if (
      !Number.isInteger(Number(amount)) ||
      Number(amount) <= 0 ||
      !/^242\d{9}$/.test(String(phone || "")) ||
      !["MTN", "AIRTEL"].includes(provider)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Données invalides. Vérifie le montant, le numéro et l'opérateur.",
      });
    }

    // 2. Vérifier la clé API
    if (!process.env.OPENPAY_API_KEY) {
      return res.status(500).json({
        success: false,
        message:
          "La clé API OPENPAY n'est pas configurée dans le fichier .env.",
      });
    }

    // 3. Préparer la demande de paiement
    const paymentData = {
      amount: Number(amount),
      payment_phone_number: String(phone),
      provider,
      customer_external_id: "paydemo-client-001",
      customer: {
        name: "Client PayDemo",
        phone: String(phone),
      },
      metadata: {
        source: "PayDemo",
      },
    };

    // 4. Envoyer la demande à OPENPAY
    const response = await axios.post(
      "https://api.openpay-cg.com/v1/transaction/payment",
      paymentData,
      {
        headers: {
          "XO-API-KEY": process.env.OPENPAY_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 60000,
      },
    );

    // 5. Retourner la réponse d'OPENPAY
    return res.status(200).json({
      success: true,
      message: "Réponse reçue de OPENPAY.",
      payment: response.data,
    });
  } catch (error) {
    // Erreur renvoyée par OPENPAY
    if (error.response) {
      console.error(
        "Erreur OPENPAY :",
        error.response.status,
        error.response.data,
      );

      return res.status(502).json({
        success: false,
        message: "OPENPAY a refusé ou n'a pas pu traiter la demande.",
        details: error.response.data,
      });
    }

    // Erreur réseau ou délai dépassé

console.error("Erreur de connexion OPENPAY :", {
  message: error.message,
  code: error.code,
  url: error.config?.url
});

return res.status(502).json({
  success: false,
  message: "Impossible de contacter OPENPAY.",
  code: error.code || "ERREUR_INCONNUE"
});

  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`PayDemo disponible sur http://localhost:${PORT}`);
});
