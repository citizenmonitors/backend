import type { Request, Response } from "express";
import * as SupportService from "../../services/Resources/supportService.ts";
import type { AuthenticatedRequest } from "../../types/authenticatedRequest.ts";
import { asParamString, isValidObjectId } from "../../utils/validators.ts";

export const createSupport = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const supportRequest = await SupportService.createSupportRequest(req.body);
    return res.status(201).json(supportRequest);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ message });
  }
};


export const getAllSupports = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const r = req as AuthenticatedRequest;
  try {
    const supportRequests = await SupportService.getAllSupportRequests(r.user);
    return res.json(supportRequests);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res
      .status(message === "Unauthorized access" ? 403 : 500)
      .json({ message });
  }
};


export const getSupportById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const r = req as AuthenticatedRequest;
  try {
    const id = asParamString(req.params.id);
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const supportRequest = await SupportService.getSupportRequestById(r.user, id);
    return res.json(supportRequest);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status =
      message === "Unauthorized access" ? 403 : message === "Support request not found" ? 404 : 500;
    return res.status(status).json({ message });
  }
};
  
  
export const deleteSupport = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const r = req as AuthenticatedRequest;
  try {
    const id = asParamString(req.params.id);
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const response = await SupportService.deleteSupportRequest(r.user, id);
    return res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status =
      message === "Unauthorized access" ? 403 : message === "Support request not found" ? 404 : 500;
    return res.status(status).json({ message });
  }
};