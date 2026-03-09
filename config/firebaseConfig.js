import admin from "firebase-admin";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} else {
  const keyPath = path.join(__dirname, "firebaseServiceAccountKey.json");
  if (!fs.existsSync(keyPath)) {
    throw new Error("Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT_JSON or add firebaseServiceAccountKey.json to config/");
  }
  serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
}

const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || "gs://citizen-monitors";
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket,
});

// Get a reference to the bucket
const bucket = admin.storage().bucket();

export default bucket;
