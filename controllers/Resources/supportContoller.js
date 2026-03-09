import * as SupportService from "../../services/Resources/supportService.js";
import { isValidObjectId } from "../../utils/validators.js";

export const createSupport = async (req, res) => {
  try {
    const supportRequest = await SupportService.createSupportRequest(req.body);
    res.status(201).json(supportRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllSupports = async (req, res) => {
    try {
      const supportRequests = await SupportService.getAllSupportRequests(req.user);
      res.json(supportRequests);
    } catch (error) {
      res.status(error.message === "Unauthorized access" ? 403 : 500).json({ message: error.message });
    }
  };


  export const getSupportById = async (req, res) => {
    try {
      const id = req.params.id;
      if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const supportRequest = await SupportService.getSupportRequestById(req.user, id);
      res.json(supportRequest);
    } catch (error) {
      res.status(error.message === "Unauthorized access" ? 403 : error.message === "Support request not found" ? 404 : 500).json({ message: error.message });
    }
  };
  
  
  export const deleteSupport = async (req, res) => {
    try {
      const id = req.params.id;
      if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const response = await SupportService.deleteSupportRequest(req.user, id);
      res.json(response);
    } catch (error) {
      res.status(error.message === "Unauthorized access" ? 403 : error.message === "Support request not found" ? 404 : 500).json({ message: error.message });
    }
  };  