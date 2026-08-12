export type DonationCurrency = "ngn" | "usd" | "gbp" | "eur";
export type DonationSource = "web" | "mobile";
export type CreateDonationCheckoutInput = {
    amount: number;
    currency: string;
    source?: DonationSource;
};
/**
 * Anonymous donation: create Stripe Checkout Session and save session locally.
 * No donor personal data is stored.
 */
export declare const createDonationCheckout: (input: CreateDonationCheckoutInput) => Promise<{
    donationId: string;
    checkoutUrl: string;
    sessionId: string;
}>;
/** Sync local session status from Stripe (still no donor personal data). */
export declare const getDonationCheckoutSessionStatus: (sessionId: string) => Promise<{
    donationId?: string;
    sessionId: string;
    status: string;
    paymentStatus: string;
    paid: boolean;
    amount?: number;
    currency?: string;
    source?: string;
}>;
//# sourceMappingURL=donationService.d.ts.map