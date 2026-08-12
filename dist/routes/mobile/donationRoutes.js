import express from "express";
import { createMobileDonationCheckoutController, getDonationSessionController, } from "../../controllers/donationController.js";
import { createDonationCheckoutValidation, donationSessionValidation, handleValidationErrors, } from "../../validators/donationValidators.js";
const router = express.Router();
/** Mobile: create anonymous Stripe Checkout Session (amount + currency only) */
router.post("/checkout", createDonationCheckoutValidation, handleValidationErrors, createMobileDonationCheckoutController);
/** Mobile: verify payment status from Stripe after redirect (nothing stored locally) */
router.get("/session/:sessionId", donationSessionValidation, handleValidationErrors, getDonationSessionController);
export default router;
//# sourceMappingURL=donationRoutes.js.map