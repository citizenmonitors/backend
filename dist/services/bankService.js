import fs from "fs";
import { projectPath } from "../utils/projectRoot.js";
const getBanks = async () => {
    const filePath = projectPath("bank-data", "banks.json");
    const data = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(data);
};
export default getBanks;
//# sourceMappingURL=bankService.js.map