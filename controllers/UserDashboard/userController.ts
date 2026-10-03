import type { Request, Response } from "express";
import type { Types } from "mongoose";
import {
  volunteerToObserverService,
  updateUserService,
  verifyUserEmail,
  resendTokenService,
  deleteUserService,
  updateUserEmail,
  AccountDeletionBlockedError,
} from "../../services/UserDashboard/userService.ts";
import upload from "../../config/multer.ts";

type AuthenticatedRequest = Request & {
  user?: { _id?: Types.ObjectId | string; email?: string };
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
const hasMessage = (value: unknown): value is { message: string } =>
  typeof value === "object" &&
  value !== null &&
  "message" in value &&
  typeof (value as { message?: unknown }).message === "string";
const requireUser = (
  req: AuthenticatedRequest
): { _id: Types.ObjectId | string; email?: string } => {
  const user = req.user;
  if (!user || !user._id) {
    throw new Error("Authentication required");
  }
  return { _id: user._id, email: user.email };
};




export const volunteerToObserver = [
  upload.fields([{ name: "observerId[]", maxCount: 2 }]), 
  async (req: Request, res: Response) => {
    
    try {
      const r = req as AuthenticatedRequest;
      const user = requireUser(r);
      const { ...details } = req.body;
      const files = r.files ?? {};
      if (!user.email) {
        throw new Error("Authentication required");
      }

// console.log(files)



      // Call the service to update the volunteer to observer
      const updatedUser = await volunteerToObserverService({
        email: user.email,
        details,
        files,
      });

      // Return success response
      res.status(200).json({
        message: "Volunteer updated to Observer successfully",
        user: updatedUser,
      });
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Error updating user to Observer:", message);
      return res.status(500).json({
        message: "An error occurred while updating user to Observer",
        error: message,
      });
    }
  },
];

// Update user details
export const updateUser = [
  upload.single("profileImage"),
  async (req: Request, res: Response) => {
    try {
      const r = req as AuthenticatedRequest;
      const userId = requireUser(r)._id;
      const { currentPassword, ...updateData } = req.body;

      // Validate new password confirmation if provided
      if (updateData.password && !updateData.confirmPassword) {
        return res
          .status(400)
          .json({ message: "Please confirm your new password" });
      }

      // Pass the file to the service if there's an uploaded profile image
      const file = r.file ? { profileImage: r.file } : null;

      const result = await updateUserService(
        userId,
        updateData,
        currentPassword,
        file
      );

      if (hasMessage(result)) {
        return res.status(200).json(result);
      }

      
      return res.status(200).json(result);
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Error updating user details:", message);
      return res.status(500).json({
        message: "Error updating user details",
        error: message,
      });
    }
  },
];

export const updateUserEmailCon = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    const userId = requireUser(r)._id;
    const { newEmail } = req.body;

    if (!newEmail) {
      return res
        .status(400)
        .json({ message: "New email address is required." });
    }

    const result = await updateUserEmail(userId, newEmail);

    return res.status(200).json(result);
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Error updating email:", message);
    return res.status(500).json({
      message:
        "There was an error while attempting to update your email. Please try again later.",
      error: message,
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    const userId = requireUser(r)._id;
    const { verificationCode } = req.body; // No need for newEmail since it's stored in the user's pendingEmail field

    if (!verificationCode) {
      return res.status(400).json({
        message:
          "Verification code is required to verify your new email address.",
      });
    }

    const result = await verifyUserEmail(userId, verificationCode);

    return res.status(200).json(result);
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Error verifying email:", message);
    return res.status(500).json({
      message:
        "There was an error while attempting to verify your email. Please try again later.",
      error: message,
    });
  }
};

export const resendToken = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    const userId = requireUser(r)._id; // Get user ID from the authenticated session

    await resendTokenService(userId);

    return res
      .status(200)
      .json({
        message:
          "Verification code has been resent to your new email address successfully.",
      });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Error resending verification code:", message);
    return res.status(500).json({
      message:
        "There was an error while attempting to resend the verification code. Please try again later.",
      error: message,
    });
  }
};

// Delete user account (role-aware: observers with uploads are blocked)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const r = req as AuthenticatedRequest;
    const userId = requireUser(r)._id;
    const result = await deleteUserService(userId);
    return res.status(200).json(result);
  } catch (error) {
    const message = getErrorMessage(error);
    if (error instanceof AccountDeletionBlockedError) {
      return res.status(403).json({ message, error: message });
    }
    return res
      .status(500)
      .json({ message: "Error deleting user account", error: message });
  }
};

