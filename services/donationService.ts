import stripe from "../config/stripe.ts";
import DonationSession from "../models/DonationSession.ts";

export type DonationCurrency = "ngn" | "usd" | "gbp" | "eur";
export type DonationSource = "web" | "mobile";

const ALLOWED_CURRENCIES: DonationCurrency[] = ["ngn", "usd", "gbp", "eur"];

const MIN_AMOUNT_MAJOR: Record<DonationCurrency, number> = {
  usd: 1,
  gbp: 1,
  eur: 1,
  ngn: 500,
};

const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

const toMinorAmount = (amountMajor: number, currency: DonationCurrency): number => {
  if (ZERO_DECIMAL_CURRENCIES.has(currency)) {
    return Math.round(amountMajor);
  }
  return Math.round(amountMajor * 100);
};

const frontendBase = () =>
  (process.env.FRONTEND_URL || "https://www.citizenmonitors.com").replace(
    /\/$/,
    ""
  );

const redirectUrlsForSource = (source: DonationSource) => {
  if (source === "mobile") {
    return {
      successUrl:
        process.env.MOBILE_DONATION_SUCCESS_URL?.trim() ||
        "citizenmonitors://donate/success?session_id={CHECKOUT_SESSION_ID}",
      cancelUrl:
        process.env.MOBILE_DONATION_CANCEL_URL?.trim() ||
        "citizenmonitors://donate/cancel",
    };
  }

  return {
    successUrl: `${frontendBase()}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${frontendBase()}/donate/cancel`,
  };
};

const requireStripeConfigured = () => {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key || key.includes("your_secret_key") || key === "sk_test_placeholder") {
    throw Object.assign(new Error("Stripe is not configured"), { status: 503 });
  }
};

export type CreateDonationCheckoutInput = {
  amount: number;
  currency: string;
  source?: DonationSource;
};

/**
 * Anonymous donation: create Stripe Checkout Session and save session locally.
 * No donor personal data is stored.
 */
export const createDonationCheckout = async (
  input: CreateDonationCheckoutInput
) => {
  requireStripeConfigured();

  const source: DonationSource = input.source === "mobile" ? "mobile" : "web";
  const currency = input.currency?.trim().toLowerCase() as DonationCurrency;
  if (!ALLOWED_CURRENCIES.includes(currency)) {
    throw Object.assign(
      new Error(`Unsupported currency. Allowed: ${ALLOWED_CURRENCIES.join(", ")}`),
      { status: 400 }
    );
  }

  const amountMajor = Number(input.amount);
  if (!Number.isFinite(amountMajor) || amountMajor <= 0) {
    throw Object.assign(new Error("amount must be a positive number"), {
      status: 400,
    });
  }

  const minAmount = MIN_AMOUNT_MAJOR[currency];
  if (amountMajor < minAmount) {
    throw Object.assign(
      new Error(`Minimum donation is ${minAmount} ${currency.toUpperCase()}`),
      { status: 400 }
    );
  }

  const amountMinor = toMinorAmount(amountMajor, currency);
  const { successUrl, cancelUrl } = redirectUrlsForSource(source);

  if (!successUrl.includes("{CHECKOUT_SESSION_ID}")) {
    throw Object.assign(
      new Error("Donation success URL must include {CHECKOUT_SESSION_ID}"),
      { status: 500 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: amountMinor,
          product_data: {
            name: "Citizen Monitors Donation",
            description:
              "Support transparency, accountability and informed public discourse.",
          },
        },
      },
    ],
    metadata: {
      source: `${source}-donation`,
      anonymous: "true",
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  if (!session.url) {
    throw Object.assign(new Error("Failed to create Stripe checkout session"), {
      status: 502,
    });
  }

  const donationSession = await DonationSession.create({
    amount: amountMajor,
    amountMinor,
    currency,
    source,
    status: "pending",
    stripeCheckoutSessionId: session.id,
  });

  return {
    donationId: String(donationSession._id),
    checkoutUrl: session.url,
    sessionId: session.id,
  };
};

/** Sync local session status from Stripe (still no donor personal data). */
export const getDonationCheckoutSessionStatus = async (
  sessionId: string
): Promise<{
  donationId?: string;
  sessionId: string;
  status: string;
  paymentStatus: string;
  paid: boolean;
  amount?: number;
  currency?: string;
  source?: string;
}> => {
  requireStripeConfigured();

  const normalized = sessionId.trim();
  if (!normalized) {
    throw Object.assign(new Error("sessionId is required"), { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(normalized);
  const donation = await DonationSession.findOne({
    stripeCheckoutSessionId: normalized,
  });

  if (!donation) {
    return {
      sessionId: session.id,
      status: session.status ?? "pending",
      paymentStatus: session.payment_status,
      paid: session.payment_status === "paid",
    };
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (session.payment_status === "paid" && donation.status !== "paid") {
    donation.status = "paid";
    donation.paidAt = new Date();
    if (paymentIntentId) donation.stripePaymentIntentId = paymentIntentId;
    await donation.save();
  } else if (session.status === "expired" && donation.status === "pending") {
    donation.status = "expired";
    await donation.save();
  } else if (paymentIntentId && !donation.stripePaymentIntentId) {
    donation.stripePaymentIntentId = paymentIntentId;
    await donation.save();
  }

  return {
    donationId: String(donation._id),
    sessionId: session.id,
    status: donation.status,
    paymentStatus: session.payment_status,
    paid: donation.status === "paid" || session.payment_status === "paid",
    amount: donation.amount,
    currency: donation.currency,
    source: donation.source,
  };
};
