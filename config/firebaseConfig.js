import admin from "firebase-admin";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../config/firebaseServiceAccountKey.json"))
  );

// Initialize Firebase Admin with storage bucket name
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://citizen-monitors", 
});

// Get a reference to the bucket
const bucket = admin.storage().bucket();

export default bucket;
