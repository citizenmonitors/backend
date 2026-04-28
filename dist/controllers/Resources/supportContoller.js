import * as SupportService from "../../services/Resources/supportService.js";
import { asParamString, isValidObjectId } from "../../utils/validators.js";
export const createSupport = async (req, res) => {
    try {
        const supportRequest = await SupportService.createSupportRequest(req.body);
        return res.status(201).json(supportRequest);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ message });
    }
};
export const getAllSupports = async (req, res) => {
    const r = req;
    try {
        const supportRequests = await SupportService.getAllSupportRequests(r.user);
        return res.json(supportRequests);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return res
            .status(message === "Unauthorized access" ? 403 : 500)
            .json({ message });
    }
};
export const getSupportById = async (req, res) => {
    const r = req;
    try {
        const id = asParamString(req.params.id);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }
        const supportRequest = await SupportService.getSupportRequestById(r.user, id);
        return res.json(supportRequest);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const status = message === "Unauthorized access" ? 403 : message === "Support request not found" ? 404 : 500;
        return res.status(status).json({ message });
    }
};
export const deleteSupport = async (req, res) => {
    const r = req;
    try {
        const id = asParamString(req.params.id);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }
        const response = await SupportService.deleteSupportRequest(r.user, id);
        return res.json(response);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const status = message === "Unauthorized access" ? 403 : message === "Support request not found" ? 404 : 500;
        return res.status(status).json({ message });
    }
};
//# sourceMappingURL=supportContoller.js.map