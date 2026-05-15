/**
 * Citizen Academy — curated educational articles for the mobile app.
 * Content is informational only and not legal advice.
 */
export const CITIZEN_ACADEMY_ARTICLES = [
    {
        slug: "pvc-registration-guide",
        title: "PVC Registration Guide",
        category: "Essential",
        readMinutes: 5,
        summary: "Step-by-step process on how to register and collect your Permanent Voter Card.",
        sections: [
            {
                heading: "Why your PVC matters",
                paragraphs: [
                    "The Permanent Voter Card (PVC) is the primary identity document for every voter in Nigeria. Without it, you cannot cast your ballot.",
                ],
            },
            {
                heading: "Step 1 — Check your status",
                paragraphs: [
                    "Check your registration status on the official INEC portal. If you are not registered, wait for the Continuous Voter Registration (CVR) window to open and follow INEC announcements for dates and centres.",
                ],
            },
            {
                heading: "Step 2 — Visit a registration centre",
                paragraphs: [
                    "Visit your local government headquarters or a designated registration centre with a valid ID (National ID, Driver's Licence, or International Passport).",
                ],
            },
            {
                heading: "Step 3 — Complete biometrics",
                paragraphs: [
                    "Provide your biometric data (fingerprints and facial capture) to the registration officer. Ensure your details are spelled correctly before you confirm.",
                ],
            },
            {
                heading: "Step 4 — TVC and PVC collection",
                paragraphs: [
                    "Collect your Temporary Voter Card (TVC) where issued. You will be notified via SMS or email (or official INEC channels) when your PVC is ready for collection. Collect in person and verify that the card matches your details.",
                ],
            },
        ],
    },
    {
        slug: "know-voters-right",
        title: "Know Voters' Rights",
        category: "Essential",
        readMinutes: 5,
        summary: "Understand what you can and cannot do at the polling unit as a citizen.",
        sections: [
            {
                heading: "Your rights on election day",
                paragraphs: [
                    "As a registered voter, you have the right to vote in secret, to receive assistance if you need it (as provided by law and INEC guidelines), and to have your ballot handled fairly according to procedure.",
                ],
            },
            {
                heading: "Inside the polling unit",
                paragraphs: [
                    "You can present your PVC, join the queue, and follow the presiding officer's lawful instructions. You may ask for clarification on voting steps. You should not intimidate others, carry weapons, or attempt to buy or sell votes.",
                ],
            },
            {
                heading: "Photography and phones",
                paragraphs: [
                    "Follow INEC and security directives for your election. Do not take photographs or film in ways that compromise ballot secrecy or safety, or that violate published rules for that election.",
                ],
            },
            {
                heading: "If something is wrong",
                paragraphs: [
                    "If you witness irregularities, note the polling unit name and code, time, and what you observed. Report through official channels (INEC situation room, security, or accredited observer protocols). Citizen Monitors may help you document incidents where the app is available.",
                ],
            },
        ],
    },
    {
        slug: "incident-reporting",
        title: "Incident Reporting",
        category: "Essential",
        readMinutes: 5,
        summary: "How to accurately document and report irregularities during elections.",
        sections: [
            {
                heading: "What counts as an incident",
                paragraphs: [
                    "Incidents can include violence or intimidation, ballot tampering, late opening, missing materials, underage voting, or misconduct by officials. Accurate reporting helps authorities respond and protects other voters.",
                ],
            },
            {
                heading: "Document safely first",
                paragraphs: [
                    "Your safety comes first. Do not put yourself in harm's way to capture evidence. If you can, record date and time, polling unit code, names or descriptions (without escalating conflict), and photographs or video only where it is safe and lawful.",
                ],
            },
            {
                heading: "What to include in a report",
                paragraphs: [
                    "Include: election context, location (state, LGA, ward, PU where known), category of incident, short factual description, and any media attachments allowed by the reporting tool. Avoid hearsay where possible; state what you directly saw or heard.",
                ],
            },
            {
                heading: "After you submit",
                paragraphs: [
                    "Keep a copy of your submission reference if provided. Reports may be reviewed by admins or security partners. False reports can have legal consequences—be truthful and proportionate.",
                ],
            },
        ],
    },
    {
        slug: "electoral-act-2022",
        title: "Electoral Act 2022",
        category: "LAW",
        readMinutes: 8,
        summary: "Overview of the legal framework governing the conduct of federal and state elections in Nigeria (not a substitute for the full Act).",
        sections: [
            {
                heading: "Disclaimer",
                paragraphs: [
                    "This summary is for civic education only. It is not legal advice. For court filings, disputes, or interpretation, consult a qualified lawyer and read the official Electoral Act 2022 as published by the Federal Government.",
                ],
            },
            {
                heading: "What the Electoral Act covers",
                paragraphs: [
                    "The Act governs how elections are run: voter registration, party primaries, nomination of candidates, campaign finance rules, polling and collation procedures, and offences and penalties for violations.",
                ],
            },
            {
                heading: "Notable themes for voters",
                paragraphs: [
                    "The Act reinforces the use of technology where prescribed by INEC, strengthens provisions around election offences, and sets expectations for transparency in collation. Specific procedures can change with INEC regulations and guidelines—always check the latest INEC documents for your election cycle.",
                ],
            },
            {
                heading: "Where to read the full text",
                paragraphs: [
                    "Obtain the official gazetted Electoral Act 2022 from government or INEC sources. Your library, legal practitioner, or civil society organisation may also provide verified copies.",
                ],
            },
        ],
    },
    {
        slug: "voters-handbook-2027",
        title: "Voter's Handbook 2027 Edition",
        category: "Security",
        readMinutes: 6,
        summary: "Practical security and preparation tips for election day—staying safe while participating fully.",
        sections: [
            {
                heading: "Before you leave home",
                paragraphs: [
                    "Charge your phone, carry your PVC, plan your route, and share your expected location with someone you trust. Dress comfortably and carry water if allowed. Check INEC and local security advisories.",
                ],
            },
            {
                heading: "At the polling unit",
                paragraphs: [
                    "Stay calm in queues. Avoid arguments over politics. Keep your ballot secret. If tension rises, move to a safer distance and alert security or INEC officials rather than filming in a way that provokes others.",
                ],
            },
            {
                heading: "Digital and personal security",
                paragraphs: [
                    "Be cautious with sharing live locations publicly. Verify information before forwarding messages that could incite panic. Report coordinated harassment or misinformation through official channels where available.",
                ],
            },
            {
                heading: "After voting",
                paragraphs: [
                    "Leave the PU peacefully unless you are an accredited observer with permission to remain. Encourage others to vote safely without crowding the ballot area.",
                ],
            },
        ],
    },
];
const bySlug = new Map(CITIZEN_ACADEMY_ARTICLES.map((a) => [a.slug, a]));
export const getAcademyArticleBySlug = (slug) => bySlug.get(slug);
//# sourceMappingURL=articles.js.map