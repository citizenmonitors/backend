import type { Request, Response } from "express";
import type { Types } from "mongoose";
import upload from "../../config/multer.ts";
import type { AuthenticatedRequest } from "../../types/authenticatedRequest.ts";
import {
  getElectionVault,
  getMobileNotifications,
  getMobileProfile,
  generateAnonymousUsername,
  locatePollingUnit,
  setAnonymousIdentityToggle,
  submitMobileFeedback,
  updateMobileNotifications,
  updateMobilePassword,
  updateMobileProfile,
  upsertObserverProfileData,
  upgradePublicViewerToVolunteer,
  upgradeVolunteerToObserver,
} from "../../services/mobile/profileService.ts";

type RequestWithUploads = AuthenticatedRequest & {
  file?: {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
    size: number;
  };
  files?: Record<
    string,
    Array<{
      buffer: Buffer;
      mimetype: string;
      originalname: string;
      size: number;
    }>
  >;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const MOBILE_PROFILE_ALLOWED_FIELDS = new Set([
  "firstName",
  "lastName",
  "phoneNumber",
  "gender",
  "dateOfBirth",
  "state",
  "lga",
  "ward",
  "pollingUnit",
  "isRegisteredVoter",
  "isPoliticalPartyMember",
  "isElectionWitnessReady",
  "isOpenToSurvey",
  "nationality",
  "whyYouJoinUs",
]);

const toBooleanIfBooleanLike = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  const lowered = value.trim().toLowerCase();
  if (lowered === "true") return true;
  if (lowered === "false") return false;
  return value;
};

const buildSafeMobileProfileUpdatePayload = (
  body: Record<string, unknown>
): Record<string, unknown> => {
  const safe: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(body)) {
    if (!MOBILE_PROFILE_ALLOWED_FIELDS.has(key)) continue;
    if (key.includes(".") || key.includes("$")) continue;
    safe[key] = toBooleanIfBooleanLike(raw);
  }
  return safe;
};

const requireUser = (
  req: AuthenticatedRequest
): { _id: Types.ObjectId | string; email: string; role?: string } => {
  const user = req.user;
  if (!user?._id || !user.email) throw new Error("Authentication required");
  return { _id: user._id, email: user.email, role: user.role };
};

export const getMyProfileMobile = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req as AuthenticatedRequest);
    const profile = await getMobileProfile(user._id);
    return res.status(200).json(profile);
  } catch (error) {
    return res.status(401).json({ message: getErrorMessage(error) });
  }
};

export const updateMyProfileMobile = [
  upload.single("profileImage"),
  async (req: Request, res: Response) => {
    try {
      const r = req as RequestWithUploads;
      const user = requireUser(r);
      const safeUpdateData = buildSafeMobileProfileUpdatePayload(
        req.body as Record<string, unknown>
      );
      const result = await updateMobileProfile(
        user._id,
        safeUpdateData,
        r.file ? { profileImage: r.file } : null
      );
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: getErrorMessage(error) });
    }
  },
];

export const updateMyPasswordMobile = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req as AuthenticatedRequest);
    const result = await updateMobilePassword(
      user._id,
      req.body.currentPassword,
      req.body.newPassword,
      req.body.confirmPassword
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const volunteerToObserverMobile = [
  upload.fields([{ name: "observerId[]", maxCount: 2 }]),
  async (req: Request, res: Response) => {
    try {
      const r = req as RequestWithUploads;
      const user = requireUser(r);
      const result = await upgradeVolunteerToObserver({
        email: user.email,
        details: req.body,
        files: (r.files ?? {}) as {
          "observerId[]"?: Array<{
            buffer: Buffer;
            mimetype: string;
            originalname: string;
            size: number;
          }>;
        },
      });
      return res.status(200).json({
        message: "Volunteer updated to observer successfully.",
        user: result,
      });
    } catch (error) {
      return res.status(400).json({ message: getErrorMessage(error) });
    }
  },
];

export const upsertObserverDataMobile = [
  upload.fields([{ name: "observerId[]", maxCount: 4 }]),
  async (req: Request, res: Response) => {
    try {
      const r = req as RequestWithUploads;
      const user = requireUser(r);
      const result = await upsertObserverProfileData({
        userId: user._id,
        phoneNumber: req.body.phoneNumber,
        bankName: req.body.bankName,
        bankAccountNumber: req.body.bankAccountNumber,
        bankAccountName: req.body.bankAccountName,
        observerIdFiles: (r.files?.["observerId[]"] ?? []) as Array<{
          buffer: Buffer;
          mimetype: string;
          originalname: string;
          size: number;
        }>,
        replaceObserverIds:
          String(req.body.replaceObserverIds ?? "false").toLowerCase() === "true",
      });
      return res.status(200).json({
        message: "Observer data saved successfully.",
        user: result,
      });
    } catch (error) {
      return res.status(400).json({ message: getErrorMessage(error) });
    }
  },
];

export const publicViewerToVolunteerMobile = async (
  req: Request,
  res: Response
) => {
  try {
    const user = requireUser(req as AuthenticatedRequest);
    const result = await upgradePublicViewerToVolunteer(user._id);
    return res.status(200).json({
      message: "Public viewer upgraded to volunteer successfully.",
      user: result,
    });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const getElectionVaultMobile = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req as AuthenticatedRequest);
    const vault = await getElectionVault(user._id);
    return res.status(200).json(vault);
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const locatePollingUnitMobile = async (req: Request, res: Response) => {
  try {
    const result = await locatePollingUnit(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const getNotificationSettingsMobile = async (
  req: Request,
  res: Response
) => {
  try {
    const user = requireUser(req as AuthenticatedRequest);
    const settings = await getMobileNotifications(user._id);
    return res.status(200).json(settings);
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const updateNotificationSettingsMobile = async (
  req: Request,
  res: Response
) => {
  try {
    const user = requireUser(req as AuthenticatedRequest);
    const settings = await updateMobileNotifications(user._id, req.body);
    return res.status(200).json({
      message: "Notification settings updated successfully.",
      settings,
    });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const submitFeedbackMobile = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req as AuthenticatedRequest);
    const feedback = await submitMobileFeedback({
      userId: user._id,
      email: user.email,
      title: req.body.title,
      message: req.body.message,
    });
    return res.status(201).json({
      message: "Feedback submitted successfully.",
      feedbackId: feedback._id,
    });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const generateAnonymousUsernameMobile = async (
  req: Request,
  res: Response
) => {
  try {
    const user = requireUser(req as AuthenticatedRequest);
    const result = await generateAnonymousUsername(user._id);
    return res.status(200).json({
      message: "Anonymous username generated successfully.",
      ...result,
    });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const setAnonymousIdentityToggleMobile = async (
  req: Request,
  res: Response
) => {
  try {
    const user = requireUser(req as AuthenticatedRequest);
    const enabled = Boolean(req.body.enabled);
    const result = await setAnonymousIdentityToggle(user._id, enabled);
    return res.status(200).json({
      message: "Anonymous identity setting updated successfully.",
      ...result,
    });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};
