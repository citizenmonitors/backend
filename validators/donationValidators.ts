import { body, param } from "express-validator";
import { handleValidationErrors } from "./speakerSlotsValidators.ts";

export { handleValidationErrors };

export const createDonationCheckoutValidation = [
  body("amount")
    .notEmpty()
    .withMessage("amount is required")
    .isFloat({ gt: 0 })
    .withMessage("amount must be a positive number"),
  body("currency")
    .notEmpty()
    .withMessage("currency is required")
    .isString()
    .trim()
    .isIn(["ngn", "usd", "gbp", "eur", "NGN", "USD", "GBP", "EUR"])
    .withMessage("currency must be ngn, usd, gbp, or eur"),
];

export const donationSessionValidation = [
  param("sessionId").trim().notEmpty().withMessage("sessionId is required"),
];
