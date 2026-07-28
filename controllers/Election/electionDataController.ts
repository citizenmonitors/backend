import type { Request, Response } from "express";
import type { Types } from "mongoose";
import type { AuthenticatedRequest } from "../../types/authenticatedRequest.ts";
import {
  uploadResultDataService,
  getUserElectionData,
  updateResultDataService,
  deleteElectionResultDataService,
  createElectionService,
  getAllElectionResults,
  getElectionResultById,
  getElectionById,
  updateElectionService,
  uploadIncidentReportDataService,
  updateIncidentReportDataService,
  getAllActiveElectionsService,
  deleteIncidentReportDataService,
  getLiveElectionById,
  getUserElectionResultsAndReports,
  getResultsAndPerformAction,
  checkUserSubmissionStatusForFlag,
  activeElections,
  updateActiveElections,
  getAllElectionTypesService,
  deleteElectionService,
  deleteActiveElectionService,
} from "../../services/Election/electionService.ts";
import { asParamString, isValidObjectId } from "../../utils/validators.ts";

const requireUserId = (req: AuthenticatedRequest): Types.ObjectId | string => {
  const userId = req.user?._id;
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
};

export const createElection = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = requireUserId(req);
    const election = await createElectionService(req.body, adminId);
    res.status(201).json(election);
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({ message: "Error creating election", error: error.message });
    }
  }
};

export const updateElection = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const electionId = asParamString(req.params.electionId);
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    const adminId = requireUserId(req);
    const updatedElection = await updateElectionService(electionId, req.body, adminId);
    res.status(200).json(updatedElection);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating election", error: error.message });
  }
};

export const createActiveElectionsCon = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = requireUserId(req);
    const activeElection = await activeElections(req.body, adminId );
    res.status(201).json(activeElection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateActiveElectionCon = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const electionId = asParamString(req.params.electionId);
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    const adminId = requireUserId(req);
    const updatedElection = await updateActiveElections(electionId, req.body, adminId,
    );
    res.status(200).json(updatedElection);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating election", error: error.message });
  }
};

export const deleteElection = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const electionId = asParamString(req.params.electionId);
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    const adminId = requireUserId(req);

    const result = await deleteElectionService(electionId, adminId);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting election", error: error.message });
  }
};

export const deleteActiveElection = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const activeElectionId = asParamString(req.params.activeElectionId);
    if (!isValidObjectId(activeElectionId)) {
      return res.status(400).json({ message: "Invalid active election ID" });
    }
    const adminId = requireUserId(req);

    const result = await deleteActiveElectionService(activeElectionId, adminId);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error deleting active election",
        error: error.message,
      });
  }
};

export const getAllActiveElections = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = requireUserId(req);
    // console.log("Fetching elections for user:", userId);

    const elections = await getAllActiveElectionsService(userId);

    res.status(200).json(elections);
  } catch (error) {
    console.error("Error fetching elections:", error);
    res
      .status(500)
      .json({ message: "Error fetching elections", error: error.message });
  }
};
export const getAllElectionTypes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = requireUserId(req);
    // console.log("Fetching elections for user:", userId);

    const elections = await getAllElectionTypesService(userId);

    res.status(200).json(elections);
  } catch (error) {
    console.error("Error fetching elections:", error);
    res
      .status(500)
      .json({ message: "Error fetching elections", error: error.message });
  }
};

export const getElectionResultByIdCont = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const electionId = asParamString(req.params.electionId);
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    const userId = requireUserId(req);
    const result = await getElectionResultById(electionId, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching election", error });
  }
};

export const getElectionByIdCont = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const electionId = asParamString(req.params.electionId);
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    const userId = requireUserId(req);
    const election = await getElectionById(electionId, userId);
    res.status(200).json(election);
  } catch (error) {
    res.status(500).json({ message: "Error fetching election details", error });
  }
};

export const getLiveElectionByIdCont = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const electionId = asParamString(req.params.electionId);
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    const election = await getLiveElectionById(electionId);
    res.status(200).json(election);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching live election details", error: error.message, });
  }
};

export const uploadResultData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const electionId = asParamString(req.params.electionId);
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    const userId = requireUserId(req);
    const resultData = await uploadResultDataService(
      electionId,
      userId,
      req.body,
      req.files as Parameters<typeof uploadResultDataService>[3]
    );
    res.status(201).json(resultData);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error uploading result data",
      error: error.message,
    });
  }
};

export const updateResultData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const electionId = asParamString(req.params.electionId);
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    const userId = requireUserId(req);
    const updatedResultData = await updateResultDataService(
      electionId,
      userId,
      req.body,
      req.files as Parameters<typeof updateResultDataService>[3]
    );
    res.status(200).json(updatedResultData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating result data", error: error.message });
  }
};

export const getAllElectionResultsController = async (_req: Request, res: Response) => {
  try {
    const allResults = await getAllElectionResults();
    res.status(200).json(allResults);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching all election results",
      error: error.message,
    });
  }
};

export const uploadIncidentReportData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const electionId = asParamString(req.params.electionId);
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    const report = await uploadIncidentReportDataService(
      electionId,
      requireUserId(req),
      req.body,
      req.files as Parameters<typeof uploadIncidentReportDataService>[3]
    );
    res.status(201).json(report);
  } catch (error) {
    console.error("Error uploading incident report data", error);
    res.status(500).json({
      message: "Error uploading incident report data",
      error: error.message,
    });
  }
};

export const updateIncidentReportData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const electionId = asParamString(req.params.electionId);
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    const userId = requireUserId(req);

    const report = await updateIncidentReportDataService(
      electionId,
      userId,
      req.body,
      req.files as Parameters<typeof updateIncidentReportDataService>[3]
    );

    res.status(200).json(report);
  } catch (error) {
    console.error("Error updating incident report data", error);
    res.status(500).json({
      message: "Error updating incident report data",
      error: error.message,
    });
  }
};

export const getUserElectionDataController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = requireUserId(req);
    const electionData = await getUserElectionData(userId);
    res.status(200).json(electionData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching election data", error });
  }
};

export const deleteElectionResultData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const electionId = asParamString(req.params.electionId);
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    const userId = requireUserId(req);

    const response = await deleteElectionResultDataService(electionId, userId);
    res.status(200).json(response);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting result data", error: error.message });
  }
};

export const deleteIncidentReportData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const electionId = asParamString(req.params.electionId);
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    const userId = requireUserId(req);
    const response = await deleteIncidentReportDataService(electionId, userId);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({
      message: "Error deleting incident report data",
      error: error.message,
    });
  }
};

export const getUserElectionResultsAndReportsCon = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = requireUserId(req);

    const { data } = await getUserElectionResultsAndReports(userId);

    res.status(200).json({
      message: "Election results and incident reports fetched successfully",
      data,
    });
  } catch (error) {
    console.error(`Error fetching user election data: ${error.message}`);
    res.status(500).json({
      message: "Failed to fetch election results and incident reports",
      error: error.message,
    });
  }
};

type WebFlagUploadFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

type UserActionRequest = AuthenticatedRequest & {
  files?: {
    flagImage?: WebFlagUploadFile[];
    flagVideo?: WebFlagUploadFile[];
  };
};

export const getResultsAndPerformActionController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = requireUserId(req);
    const r = req as UserActionRequest;
    const { electionId, action, dataType, flagReason } = r.body;
    if (electionId && !isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }

    
    const actionData = action
      ? { electionId, action, dataType, flagReason }
      : null;

    const flagMediaFiles =
      r.files?.flagImage?.length || r.files?.flagVideo?.length
        ? { flagImage: r.files.flagImage, flagVideo: r.files.flagVideo }
        : undefined;

    const results = await getResultsAndPerformAction(userId, actionData, flagMediaFiles);

    return res.status(200).json({
      message: action
        ? "Election results and incident reports updated successfully"
        : "Fetched election results and incident reports",
      results,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch election results or perform action";
    console.error(
      "Error fetching election results and performing action:",
      error
    );
    if (
      message.includes("only allowed while the election is live") ||
      message.includes("not available for your location") ||
      message.includes("Public viewers cannot") ||
      message.includes("polling unit")
    ) {
      return res.status(403).json({ message });
    }
    return res.status(400).json({ message });
  }
};

export const checkUserStatusForFlagController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = requireUserId(req);
    const { electionId, action, dataType } = req.body;

    if (!electionId || !action || !dataType) {
      return res.status(400).json({
        message: "Election ID, action, and data type are required.",
      });
    }
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }

    // Call the service to check submission status
    const isUploaded = await checkUserSubmissionStatusForFlag(userId, {
      electionId,
      action,
      dataType,
    });

    // Respond with the submission status
    return res.status(200).json({ isUploaded });
  } catch (error) {
    console.error("Error checking user submission status for flag:", error);
    const message =
      error instanceof Error ? error.message : "Failed to check submission status";
    return res.status(500).json({
      message: "Failed to check submission status",
      error: message,
    });
  }
};
