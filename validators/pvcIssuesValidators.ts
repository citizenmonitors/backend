import { body, validationResult } from "express-validator";
import type { NextFunction, Request, Response } from "express";
import {
  PVC_ISSUE_TYPE_OTHER,
  PVC_ISSUE_TYPES,
} from "../models/PvcIssues/pvcIssuesReport.js";

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const firstError = errors.array({ onlyFirstError: true })[0];
  const message = firstError?.msg || "Validation failed";
  return res.status(400).json({ message, errors: errors.array() });
};

const MAX_NAME = 150;
const MAX_PHONE = 20;
const MAX_EMAIL = 254;
const MAX_STATE = 100;
const MAX_LGA = 150;
const MAX_POLLING_UNIT = 200;
const MAX_OTHER_DETAIL = 500;
const MAX_DESCRIPTION = 1000;
const MAX_CONSENT_TEXT = 2000;

export const isValidNigerianPhone = (value: string): boolean => {
  const digits = value.replace(/[\s\-().]/g, "");
  return /^(\+234|234|0)[789][01]\d{8}$/.test(digits);
};

export const normalizeNigerianPhone = (value: string): string => {
  const digits = value.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+234")) return digits;
  if (digits.startsWith("234")) return `+${digits}`;
  if (digits.startsWith("0")) return `+234${digits.slice(1)}`;
  return digits;
};

const parseConsent = (value: unknown): boolean => {
  if (value === true) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "on" || normalized === "yes";
  }
  return false;
};

export const submitPvcIssueValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ max: MAX_NAME })
    .withMessage(`Full name must be at most ${MAX_NAME} characters`),
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .custom((value) => {
      if (!isValidNigerianPhone(value)) {
        throw new Error("Enter a valid Nigerian phone number");
      }
      return true;
    }),
  body("email")
    .optional({ values: "falsy" })
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address")
    .isLength({ max: MAX_EMAIL })
    .withMessage(`Email must be at most ${MAX_EMAIL} characters`),
  body("state")
    .trim()
    .notEmpty()
    .withMessage("State is required")
    .isLength({ max: MAX_STATE })
    .withMessage(`State must be at most ${MAX_STATE} characters`),
  body("lga")
    .trim()
    .notEmpty()
    .withMessage("Local Government Area is required")
    .isLength({ max: MAX_LGA })
    .withMessage(`LGA must be at most ${MAX_LGA} characters`),
  body("pollingUnit")
    .trim()
    .notEmpty()
    .withMessage("Polling unit is required")
    .isLength({ max: MAX_POLLING_UNIT })
    .withMessage(`Polling unit must be at most ${MAX_POLLING_UNIT} characters`),
  body("issueType")
    .trim()
    .notEmpty()
    .withMessage("Issue type is required")
    .isIn([...PVC_ISSUE_TYPES])
    .withMessage("Select a valid issue type"),
  body("otherIssueDetail")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: MAX_OTHER_DETAIL })
    .withMessage(`Other issue detail must be at most ${MAX_OTHER_DETAIL} characters`)
    .custom((value, { req }) => {
      if (req.body.issueType === PVC_ISSUE_TYPE_OTHER && !String(value ?? "").trim()) {
        throw new Error("Please describe your issue when selecting Other");
      }
      return true;
    }),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: MAX_DESCRIPTION })
    .withMessage(`Description must be at most ${MAX_DESCRIPTION} characters`),
  body("consent")
    .custom((value) => {
      if (!parseConsent(value)) {
        throw new Error("You must consent before submitting your report");
      }
      return true;
    }),
  body("consentText")
    .trim()
    .notEmpty()
    .withMessage("Consent text is required")
    .isLength({ max: MAX_CONSENT_TEXT })
    .withMessage(`Consent text must be at most ${MAX_CONSENT_TEXT} characters`),
];

export { PVC_ISSUE_TYPES };
