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

const MAX_NAME = 100;
const MAX_MESSAGE = 2000;
const MAX_PHONE = 30;
const MAX_CATEGORY = 50;

export const createSupportValidation = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ max: MAX_NAME })
    .withMessage(`First name must be at most ${MAX_NAME} characters`),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ max: MAX_NAME })
    .withMessage(`Last name must be at most ${MAX_NAME} characters`),
  body("email").isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage("Valid email is required"),
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isLength({ max: MAX_PHONE })
    .withMessage(`Phone number must be at most ${MAX_PHONE} characters`),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isLength({ max: MAX_CATEGORY })
    .withMessage(`Category must be at most ${MAX_CATEGORY} characters`),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: MAX_MESSAGE })
    .withMessage(`Message must be at most ${MAX_MESSAGE} characters`),
];
