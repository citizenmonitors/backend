import { getMobileDashboard } from "../../services/mobile/dashboardService.js";
const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);
export const getDashboardMobile = async (req, res) => {
    try {
        const r = req;
        if (!r.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const data = await getMobileDashboard(r.user);
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};
//# sourceMappingURL=dashboardController.js.map