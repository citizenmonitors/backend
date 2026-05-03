import type { Request, Response } from "express";
import {
  mobileContinueWithGoogle,
  mobileForgotPassword,
  mobileRegister,
  mobileResendForgotPasswordOtp,
  mobileResendToken,
  mobileResetPassword,
  mobileSelectRole,
  mobileSetPassword,
  mobileSignIn,
  mobileSubmitDetails,
  mobileSubmitObserverDetails,
  mobileValidateSession,
  mobileVerifyEmail,
} from "../../services/mobile/authService.ts";
import { extractBearerToken } from "../../utils/authToken.ts";

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const getMobileMeta = (req: Request) => ({
  platform: req.body.platform,
  deviceId: req.body.deviceId,
  appVersion: req.body.appVersion,
  pushToken: req.body.pushToken,
});

type RequestWithUploads = Request & {
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

export const registerMobile = async (req: Request, res: Response) => {
  try {
    await mobileRegister(
      {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
      },
      getMobileMeta(req)
    );

    return res.status(201).json({
      message:
        "Registration successful! Please check your email for the verification code.",
    });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const verifyEmailMobile = async (req: Request, res: Response) => {
  try {
    await mobileVerifyEmail(req.body.email, req.body.verificationCode);
    return res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const resendTokenMobile = async (req: Request, res: Response) => {
  try {
    await mobileResendToken(req.body.email);
    return res.status(200).json({ message: "Verification code resent successfully" });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const signInMobile = async (req: Request, res: Response) => {
  try {
    const { token, user } = await mobileSignIn(
      {
        email: req.body.email,
        password: req.body.password,
      },
      getMobileMeta(req)
    );
    return res.status(200).json({ token, user, message: "Login successfully" });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const continueWithGoogleMobile = async (req: Request, res: Response) => {
  try {
    const result = await mobileContinueWithGoogle(req.body.idToken, getMobileMeta(req));
    return res.status(200).json({
      message: "Google authentication successful",
      ...result,
    });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const setPasswordMobile = async (req: Request, res: Response) => {
  try {
    const token = extractBearerToken(req.header("Authorization"));
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const result = await mobileSetPassword(token, req.body.password);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const validateSessionMobile = async (req: Request, res: Response) => {
  try {
    const token = extractBearerToken(req.header("Authorization"));
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const user = await mobileValidateSession(token);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(401).json({ message: getErrorMessage(error) });
  }
};

export const forgotPasswordMobile = async (req: Request, res: Response) => {
  try {
    await mobileForgotPassword(req.body.email);
    return res
      .status(200)
      .json({ message: "Password reset OTP sent to your email." });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const resendForgotPasswordOtpMobile = async (
  req: Request,
  res: Response
) => {
  try {
    await mobileResendForgotPasswordOtp(req.body.email);
    return res
      .status(200)
      .json({ message: "Password reset OTP resent to your email." });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const resetPasswordMobile = async (req: Request, res: Response) => {
  try {
    await mobileResetPassword(req.body.email, req.body.otp, req.body.password);
    return res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const selectRoleMobile = async (req: Request, res: Response) => {
  try {
    const result = await mobileSelectRole(req.body.email, req.body.role);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const submitDetailsMobile = async (req: Request, res: Response) => {
  try {
    const r = req as RequestWithUploads;
    const { email, ...details } = req.body;
    const result = await mobileSubmitDetails({
      email,
      details,
      file: r.file,
    });
    return res.status(200).json({
      message: "Details submitted successfully. You can now select your role.",
      ...result,
    });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const submitObserverDetailsMobile = async (
  req: Request,
  res: Response
) => {
  try {
    const r = req as RequestWithUploads;
    const observerIdFiles = r.files?.["observerId[]"] ?? [];
    const result = await mobileSubmitObserverDetails({
      email: req.body.email,
      observerIdFiles,
    });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error) });
  }
};

