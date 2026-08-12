import Stripe from "stripe";
const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
if (!secretKey) {
    console.warn("[stripe] STRIPE_SECRET_KEY is not set — donation endpoints will fail until configured");
}
const stripe = new Stripe(secretKey || "sk_test_placeholder", {
    apiVersion: "2026-07-29.dahlia",
});
export default stripe;
//# sourceMappingURL=stripe.js.map