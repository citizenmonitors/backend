import { submitPvcIssueReport } from "../../services/pvcIssues/pvcIssuesService.js";
const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);
export const submitReport = async (req, res) => {
    try {
        const files = req.files;
        const result = await submitPvcIssueReport(req.body, files);
        return res.status(201).json(result);
    }
    catch (error) {
        console.error("PVC issue submission failed:", error);
        const message = getErrorMessage(error);
        const status = message.includes("Invalid file") || message.includes("5MB") ? 400 : 500;
        return res.status(status).json({ message });
    }
};
//# sourceMappingURL=pvcIssuesController.js.map