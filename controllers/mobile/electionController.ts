import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/authenticatedRequest.ts";
import {
  getMobileActiveElections,
  getMobileElectionSubmissionByActiveElection,
  getMobileLiveElectionsCarousel,
  mobileElectionUserAction,
} from "../../services/mobile/electionService.ts";
import {
  deleteElectionResultDataService,
  deleteIncidentReportDataService,
  updateIncidentReportDataService,
  updateResultDataService,
  uploadIncidentReportDataService,
  uploadResultDataService,
} from "../../services/Election/electionService.ts";
import { isValidObjectId } from "../../utils/validators.ts";
import { invalidateCacheByPrefixes } from "../../utils/cache.ts";

type ElectionStatus = "all" | "live" | "upcoming" | "concluded";
type ElectionScope = "all" | "polling-unit";

type FlagUploadFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

type UserActionRequest = AuthenticatedRequest & {
  files?: {
    flagImage?: FlagUploadFile[];
    flagVideo?: FlagUploadFile[];
  };
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const asParam = (value: unknown): string =>
  Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");

const requireUserId = (req: AuthenticatedRequest): string => {
  const userId = req.user?._id;
  if (!userId) {
    throw new Error("Authentication required");
  }
  return String(userId);
};

const invalidateMobileReadCaches = async (req: AuthenticatedRequest): Promise<void> => {
  const userId = String(req.user?._id ?? "");
  if (!userId) return;
  await invalidateCacheByPrefixes([`mobile:elections:${userId}:`, `mobile:dashboard:${userId}:`]);
};

export const getActiveElectionsMobile = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    if (!r.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const rawStatus = asParam(req.query.status).toLowerCase();

    const status: ElectionStatus =
      rawStatus === "live" || rawStatus === "upcoming" || rawStatus === "concluded"
        ? rawStatus
        : "all";
    const scope: ElectionScope = "polling-unit";

    const elections = await getMobileActiveElections({
      status,
      scope,
      user: r.user,
    });

    return res.status(200).json({
      status,
      scope,
      total: elections.length,
      elections,
    });
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getLiveElectionsCarouselMobile = async (
  req: Request,
  res: Response
) => {
  try {
    const r = req as AuthenticatedRequest;
    if (!r.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const elections = await getMobileLiveElectionsCarousel(r.user);
    return res.status(200).json({
      status: "live",
      scope: "polling-unit",
      total: elections.length,
      elections,
    });
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getMyElectionSubmissionMobile = async (
  req: Request,
  res: Response
) => {
  try {
    const r = req as AuthenticatedRequest;
    const electionId = asParam(req.params.activeElectionId);
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    const data = await getMobileElectionSubmissionByActiveElection(
      electionId,
      requireUserId(r)
    );
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching election submission data",
      error: getErrorMessage(error),
    });
  }
};

export const submitElectionResultMobile = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    const electionId = asParam(req.params.activeElectionId);
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    const result = await uploadResultDataService(
      electionId,
      requireUserId(r),
      r.body,
      r.files as Parameters<typeof uploadResultDataService>[3]
    );
    await invalidateMobileReadCaches(r);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      message: "Error submitting result data",
      error: getErrorMessage(error),
    });
  }
};

export const updateElectionResultMobile = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    const electionId = asParam(req.params.activeElectionId);
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    const result = await updateResultDataService(
      electionId,
      requireUserId(r),
      r.body,
      r.files as Parameters<typeof updateResultDataService>[3]
    );
    await invalidateMobileReadCaches(r);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: "Error updating result data",
      error: getErrorMessage(error),
    });
  }
};

export const deleteElectionResultMobile = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    const electionId = asParam(req.params.activeElectionId);
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    const response = await deleteElectionResultDataService(
      electionId,
      requireUserId(r)
    );
    await invalidateMobileReadCaches(r);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({
      message: "Error deleting result data",
      error: getErrorMessage(error),
    });
  }
};

export const submitIncidentReportMobile = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    const electionId = asParam(req.params.activeElectionId);
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    const report = await uploadIncidentReportDataService(
      electionId,
      requireUserId(r),
      r.body,
      r.files as Parameters<typeof uploadIncidentReportDataService>[3]
    );
    await invalidateMobileReadCaches(r);
    return res.status(201).json(report);
  } catch (error) {
    return res.status(500).json({
      message: "Error submitting incident report",
      error: getErrorMessage(error),
    });
  }
};

export const updateIncidentReportMobile = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    const electionId = asParam(req.params.activeElectionId);
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    const report = await updateIncidentReportDataService(
      electionId,
      requireUserId(r),
      r.body,
      r.files as Parameters<typeof updateIncidentReportDataService>[3]
    );
    await invalidateMobileReadCaches(r);
    return res.status(200).json(report);
  } catch (error) {
    return res.status(500).json({
      message: "Error updating incident report",
      error: getErrorMessage(error),
    });
  }
};

export const deleteIncidentReportMobile = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    const electionId = asParam(req.params.activeElectionId);
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    const response = await deleteIncidentReportDataService(
      electionId,
      requireUserId(r)
    );
    await invalidateMobileReadCaches(r);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({
      message: "Error deleting incident report",
      error: getErrorMessage(error),
    });
  }
};

/**
 * Mobile: PU-scoped agree/flag for one ActiveElection.
 * Same rules as web POST /api/elections/user-action; path includes activeElectionId
 * because the mobile UI opens an election first.
 */
export const postMobileElectionUserAction = async (req: Request, res: Response) => {
  try {
    const r = req as UserActionRequest;
    const activeElectionId = asParam(req.params.activeElectionId);
    if (!isValidObjectId(activeElectionId)) {
      return res.status(400).json({ message: "Invalid election id" });
    }
    const userId = requireUserId(r);
    const { electionId, action, dataType, flagReason } = req.body as Record<
      string,
      string | undefined
    >;

    const actionData =
      electionId && action && dataType
        ? {
            electionId,
            action: action as "agree" | "flag" | "unagree" | "unflag",
            dataType: dataType as "election" | "incident",
            flagReason,
          }
        : null;

    if (actionData && !isValidObjectId(actionData.electionId)) {
      return res.status(400).json({ message: "Invalid target id" });
    }

    const flagMediaFiles =
      r.files?.flagImage?.length || r.files?.flagVideo?.length
        ? { flagImage: r.files.flagImage, flagVideo: r.files.flagVideo }
        : undefined;

    const results = await mobileElectionUserAction(
      activeElectionId,
      userId,
      actionData,
      flagMediaFiles
    );

    return res.status(200).json({
      message: actionData
        ? "Updated successfully"
        : "Fetched polling-unit verification feed for this election",
      results,
    });
  } catch (error) {
    const message = getErrorMessage(error);
    if (
      message.includes("not available for your location") ||
      message.includes("only allowed while the election is live") ||
      message.includes("Public viewers cannot") ||
      message.includes("polling unit")
    ) {
      return res.status(403).json({ message });
    }
    return res.status(400).json({ message });
  }
};

