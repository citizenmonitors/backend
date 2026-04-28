import getBanks from "../services/bankService.js";
import { getOrSetCache } from "../utils/cache.js";
export const getAllBanks = async (_req, res) => {
    try {
        const banks = await getOrSetCache("banks:all", 3600, getBanks);
        return res.status(200).json({ banks });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ message: "Failed to fetch banks", error: message });
    }
};
//# sourceMappingURL=bankController.js.map