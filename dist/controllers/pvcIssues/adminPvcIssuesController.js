import { getPvcIssueReportById, listPvcIssueReports, } from "../../services/pvcIssues/pvcIssuesService.js";
import { asParamString, isValidObjectId } from "../../utils/validators.js";
const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);
export const listReports = async (_req, res) => {
    try {
        const data = await listPvcIssueReports();
        return res.json(data);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};
export const getReportById = async (req, res) => {
    try {
        const id = asParamString(req.params.id);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid report ID" });
        }
        const report = await getPvcIssueReportById(id);
        if (!report)
            return res.status(404).json({ message: "Report not found" });
        return res.json(report);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};
//# sourceMappingURL=adminPvcIssuesController.js.map