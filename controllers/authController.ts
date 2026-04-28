import type { Request, Response } from "express";
import {
  registerUser,
  verifyUserEmail,
  resendTokenService,
  selectUserRole,
  submitRoleFormDetails,
  authenticateUser,
  generateResetToken,
  resetUserPassword,
  validateTokenService,
  submitObserverDetails,
} from "../services/authService.ts";
import type { Types } from "mongoose";
type MulterLikeFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

type RequestWithUploads = Request & {
  file?: MulterLikeFile;
  files?: Record<string, MulterLikeFile[]>;
};
type AuthResponseUser = {
  _id?: Types.ObjectId | string;
  email?: string;
  role?: string | null;
  [key: string]: unknown;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const register = async (req: Request, res: Response) => {
  try {
    await registerUser(req.body);
    res.status(201).json({
      message:
        "Registration successful! Please check your email for the verification code."
    });
  } catch (err) {
    return res.status(400).json({ message: getErrorMessage(err) });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    await verifyUserEmail(req.body.email, req.body.verificationCode);
    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (err) {
    return res.status(400).json({ message: getErrorMessage(err) });
  }
};

export const resendToken = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    await resendTokenService(email);
    res.status(200).json({ message: "Verification code resent successfully" });
  } catch (error) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

export const pickRole = async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;

    const result = await selectUserRole(email, role);

    const respone: {
      message: string;
      token?: string;
      user?: AuthResponseUser;
    } = {
      message: result.message,
    };

    if (result.token){
      respone.token = result.token
    }

    if (result.user){
      respone.user = result.user;
    }

    res.status(200).json(respone);
  } catch (err) {
    return res.status(400).json({ message: getErrorMessage(err) });
  }
};

export const submitRoleForm = async (req: Request, res: Response) => {
  try {
    const r = req as RequestWithUploads;
    const { email, ...details } = req.body;
    const file = r.file;

    const { user, isObserverInPollingUnit } =
      await submitRoleFormDetails({
        email,
        details,
        file,
      });

    res.status(200).json({
      message:
        "Details submitted successfully. You can now select your role.",
      user,
      isObserverInPollingUnit,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: getErrorMessage(err) });
  }
};



export const submitObserverDetailsController = async (
  req: Request,
  res: Response
) => {
  try {
    const r = req as RequestWithUploads;
    const {
      email,
      phoneNumber,
      bankName,
      bankAccountNumber,
      bankAccountName,
    } = req.body;

    const observerIdFiles = r.files?.["observerId[]"] ?? [];

    const result = await submitObserverDetails({
      email,
      observerIdFiles,
      phoneNumber,
      bankName,
      bankAccountNumber,
      bankAccountName,
    });

    return res.status(200).json({
      message: result.message,
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: getErrorMessage(err) });
  }
};


export const signIn = async (req: Request, res: Response) => {
  try {
    const { token, user } = await authenticateUser(req.body);
    res.status(200).json({
      token,
      user,
      message: "Login successfully",
    });
  } catch (err) {
    return res.status(400).json({ message: getErrorMessage(err) });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    await generateResetToken(req.body.email);
    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    return res.status(400).json({ message: getErrorMessage(err) });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    await resetUserPassword(req.body.token, req.body.password);
    res.status(200).json({ message: 'Password reset successful.' });
  } catch (err) {
    return res.status(400).json({ message: getErrorMessage(err) });
  }
};

export const validateUserSession = async (req: Request, res: Response) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided, authorization denied" });
    }

    const user = await validateTokenService(token);
    res.status(200).json({ user });
  } catch (err) {
    return res.status(401).json({ message: getErrorMessage(err) });
  }
};




