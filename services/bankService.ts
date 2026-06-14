import fs from "fs";
import { projectPath } from "../utils/projectRoot.ts";

type BankEntry = {
  name?: string;
  code?: string;
  [key: string]: unknown;
};

const getBanks = async (): Promise<BankEntry[]> => {
  const filePath = projectPath("bank-data", "banks.json");
  const data = await fs.promises.readFile(filePath, "utf-8");
  return JSON.parse(data) as BankEntry[];
};

export default getBanks;

