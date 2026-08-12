import { createDonationCheckout, getDonationCheckoutSessionStatus, } from "../services/donationService.js";
const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);
const getErrorStatus = (error) => {
    if (error && typeof error === "object" && "status" in error) {
        const status = Number(error.status);
        if (Number.isFinite(status) && status >= 400 && status < 600)
            return status;
    }
    return 500;
};
const createCheckout = (source) => async (req, res) => {
    try {
        const result = await createDonationCheckout({
            amount: Number(req.body.amount),
            currency: String(req.body.currency ?? ""),
            source,
        });
        return res.status(201).json(result);
    }
    catch (error) {
        return res
            .status(getErrorStatus(error))
            .json({ message: getErrorMessage(error) });
    }
};
export const createDonationCheckoutController = createCheckout("web");
export const createMobileDonationCheckoutController = createCheckout("mobile");
export const getDonationSessionController = async (req, res) => {
    try {
        const sessionId = String(req.params.sessionId ?? "").trim();
        const result = await getDonationCheckoutSessionStatus(sessionId);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
};
//# sourceMappingURL=donationController.js.map