import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getBanks = async () => {
  const filePath = path.join(__dirname, "../bank-data/banks.json");
  const data = await fs.promises.readFile(filePath, "utf-8");
  return JSON.parse(data);
};



export default getBanks;
