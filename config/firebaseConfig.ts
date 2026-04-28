import admin from "firebase-admin";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount: admin.ServiceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) as admin.ServiceAccount;
} else {
  const keyPath = path.join(__dirname, "firebaseServiceAccountKey.json");
  if (!fs.existsSync(keyPath)) {
    throw new Error("Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT_JSON or add firebaseServiceAccountKey.json to config/");
  }
  serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8")) as admin.ServiceAccount;
}

const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || "gs://citizen-monitors";
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket,
});

type FirebaseFileRef = {
  name: string;
  save: (
    buffer: Buffer,
    options: {
      metadata: {
        contentType: string;
        metadata: { firebaseStorageDownloadTokens: string };
      };
    }
  ) => Promise<void>;
  exists: () => Promise<[boolean]>;
  delete: () => Promise<void>;
};

type FirebaseBucket = {
  name: string;
  file: (filePath: string) => FirebaseFileRef;
};

const bucket = admin.storage().bucket() as unknown as FirebaseBucket;

export default bucket;
