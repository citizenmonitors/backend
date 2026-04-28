import { body, validationResult } from "express-validator";
import type { NextFunction, Request, Response } from "express";

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

export const bookSlotValidation = [
  body("inviteToken").trim().notEmpty().withMessage("Invite token is required"),
  body("slotId").trim().notEmpty().withMessage("Slot is required"),
  body("fullName").trim().notEmpty().withMessage("Full name is required").isLength({ max: 200 }),
  body("email").isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage("Valid email is required"),
  body("xHandle").trim().notEmpty().withMessage("X handle is required").isLength({ max: 100 }),
  body("bioLink").optional({ values: "falsy" }).trim().isLength({ max: 500 }),
  body("topicAngle").optional({ values: "falsy" }).trim().isLength({ max: 500 }),
  body("phone").optional({ values: "falsy" }).trim().isLength({ max: 30 }),
];
