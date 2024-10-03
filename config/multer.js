import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the directories for observer IDs and profile images
const observerIdDir = path.join(__dirname, "../observerId");
const profileImageDir = path.join(__dirname, "../profileImage");

// Ensure the directories exist, create if they don't
const ensureDirectoryExist = (dir) =>{
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`${dir} directory created`);
} else {
  console.log(`${dir} directory exists`);
}
}

ensureDirectoryExist(observerIdDir);
ensureDirectoryExist(profileImageDir);

// Configure multer storage to save files in the correct directory based on the field name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if(file.fieldname === "observerId"){
      cb(null, observerIdDir);
    } else if (file.fieldname === "profileImage"){
      cb(null, profileImageDir);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedTypes = [".png", ".jpg", ".jpeg", "pdf", "svg"];
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Please upload a jpg, jpeg, pdf, png, or svg file."));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter,
});

export default upload;
