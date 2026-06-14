/**
 * Citizen Academy — curated educational articles for the mobile app.
 * Content is informational only and not legal advice.
 */

export type AcademyCategory = "Essential" | "LAW" | "Security";

export type AcademySection = {
  heading: string;
  paragraphs: string[];
};

export type AcademyArticle = {
  slug: string;
  title: string;
  category: AcademyCategory;
  readMinutes: number;
  summary: string;
  sections: AcademySection[];
};

export const CITIZEN_ACADEMY_ARTICLES: AcademyArticle[] = [
  {
    slug: "registration-guide-101",
    title: "Registration Guide 101",
    category: "Essential",
    readMinutes: 4,
    summary:
      "A beginner's introduction to voter registration in Nigeria—what you need, where to go, and how to get started.",
    sections: [
      {
        heading: "What is voter registration?",
        paragraphs: [
          "Voter registration is the official process of enrolling your name on the national voters' register so you can vote in elections. In Nigeria, the Independent National Electoral Commission (INEC) manages registration through the Continuous Voter Registration (CVR) exercise.",
          "Registration is free. You do not need to pay anyone to register or collect your Permanent Voter Card (PVC).",
        ],
      },
      {
        heading: "Who can register?",
        paragraphs: [
          "You must be a Nigerian citizen, at least 18 years old, and ordinarily resident in the area where you wish to vote. You should not already be registered elsewhere unless you are transferring your registration to a new location.",
        ],
      },
      {
        heading: "What you need before you visit a centre",
        paragraphs: [
          "Bring a valid means of identification such as a National Identification Number (NIN) slip, National ID card, driver's licence, or international passport.",
          "Know your state, local government area (LGA), and ward. INEC will assign you to a polling unit based on where you live.",
          "Check INEC announcements for active CVR centres and dates in your area. Registration is not open year-round in every location—follow official notices.",
        ],
      },
      {
        heading: "The registration journey in four steps",
        paragraphs: [
          "1. Visit an INEC registration centre and present your ID.",
          "2. Provide your personal details and complete biometric capture (fingerprints and photograph).",
          "3. Review your information carefully before the officer submits it.",
          "4. Collect your Temporary Voter Card (TVC) where issued, then return later to collect your PVC when INEC notifies you.",
        ],
      },
      {
        heading: "Common mistakes to avoid",
        paragraphs: [
          "Do not register in a location where you do not live—you may be unable to vote there on election day.",
          "Do not give your phone number or details to unofficial agents promising faster PVC collection.",
          "Always verify your name, date of birth, and address on the screen before confirming.",
        ],
      },
    ],
  },
  {
    slug: "poll-station-conduct",
    title: "Poll Station Conduct",
    category: "Essential",
    readMinutes: 5,
    summary:
      "How to behave at a polling unit—queue rules, interacting with officials, and what conduct is expected of every voter.",
    sections: [
      {
        heading: "Arriving at the polling unit",
        paragraphs: [
          "Polling units open at the time announced by INEC for that election. Arrive early, join the queue calmly, and keep your PVC ready. Only voters on the register for that polling unit should expect to vote there.",
        ],
      },
      {
        heading: "Inside the queue",
        paragraphs: [
          "Wait your turn. Do not jump the queue, harass other voters, or campaign inside the polling unit perimeter. Political party agents may be present but must follow INEC rules on where they can stand and what they can do.",
          "Keep conversations respectful. Election day is not the time for arguments that could escalate into violence.",
        ],
      },
      {
        heading: "Interacting with election officials",
        paragraphs: [
          "The Presiding Officer (PO) and Assistant Presiding Officers (APOs) run the polling unit. Follow their lawful instructions on accreditation, ballot issuance, and voting.",
          "You may ask for clarification if you do not understand a step. If you need assistance voting (for example, due to disability), ask the PO—INEC guidelines provide for assisted voting where applicable.",
        ],
      },
      {
        heading: "What you must not do",
        paragraphs: [
          "Do not carry weapons, alcohol, or items that could intimidate others.",
          "Do not photograph or film voters in a way that reveals how they voted or compromises ballot secrecy, unless INEC explicitly permits it for that election.",
          "Do not attempt to vote more than once, buy or sell votes, or pressure others to vote a particular way.",
        ],
      },
      {
        heading: "If you witness misconduct",
        paragraphs: [
          "Note the time, what happened, and who was involved (without putting yourself at risk). Report to the PO, security agents, or accredited observers. You can also document incidents through Citizen Monitors where the feature is available.",
        ],
      },
    ],
  },
  {
    slug: "voter-registration",
    title: "Voter Registration",
    category: "Essential",
    readMinutes: 6,
    summary:
      "A detailed walkthrough of Continuous Voter Registration—documents, biometrics, PVC collection, and transfers.",
    sections: [
      {
        heading: "Continuous Voter Registration (CVR)",
        paragraphs: [
          "CVR allows eligible Nigerians to register as new voters or update existing records. INEC opens registration in phases across states and LGAs. Monitor INEC's website, social media, and local announcements for schedules.",
        ],
      },
      {
        heading: "New registration",
        paragraphs: [
          "At the registration centre, an INEC official will capture your biodata: full name, date of birth, gender, address, occupation, and NIN where available.",
          "Your fingerprints and facial image will be taken. This links you uniquely to your voter record and helps prevent duplicate registration.",
          "After successful registration, you receive a registration acknowledgement. Keep any reference number or TVC you are given safe.",
        ],
      },
      {
        heading: "PVC collection",
        paragraphs: [
          "Your Permanent Voter Card (PVC) is produced after your registration is processed. INEC announces collection timelines and locations—often at LGA offices or designated distribution points.",
          "Collect your PVC in person. Check that your name, photograph, voter identification number, and polling unit details are correct before leaving.",
          "If your PVC is lost or damaged, follow INEC's procedure for replacement—do not use unofficial middlemen.",
        ],
      },
      {
        heading: "Transfer of registration",
        paragraphs: [
          "If you move to a new state, LGA, or ward, you can apply to transfer your registration so you vote near your new home. Visit an INEC office or CVR centre with proof of your new address and complete the transfer process before the election cutoff date.",
        ],
      },
      {
        heading: "Checking your status",
        paragraphs: [
          "Use INEC's online voter verification tools to confirm that you are on the register and that your polling unit details are correct. Do this well before election day so you have time to fix any errors.",
        ],
      },
    ],
  },
  {
    slug: "election-day-procedure",
    title: "Election Day Procedure",
    category: "Essential",
    readMinutes: 7,
    summary:
      "What happens from accreditation to ballot casting on election day—the full process every voter should know.",
    sections: [
      {
        heading: "Before polls open",
        paragraphs: [
          "INEC officials and security arrive early to set up the polling unit. Party agents and accredited observers may also be present. Materials are checked and the Bimodal Voter Accreditation System (BVAS) or prescribed accreditation method is prepared.",
        ],
      },
      {
        heading: "Accreditation",
        paragraphs: [
          "When voting begins, you join the queue and present your PVC at the accreditation point. An official scans or verifies your card and confirms you are on the register for that polling unit.",
          "After successful accreditation, your finger may be marked with indelible ink to show you have been accredited. You then wait to receive a ballot paper (or proceed to the voting area, depending on the election type).",
        ],
      },
      {
        heading: "Casting your vote",
        paragraphs: [
          "You will be directed to a voting cubicle where you mark your choice in secret. Fold the ballot as instructed and drop it into the appropriate ballot box.",
          "Take your time to mark clearly. Do not let anyone watch you vote or tell you how to mark your ballot.",
        ],
      },
      {
        heading: "Counting and announcement",
        paragraphs: [
          "When voting closes, officials count ballots at the polling unit in the presence of party agents and observers. Results are entered on prescribed forms and announced at the unit before transmission to the collation centre.",
          "As a voter, you may observe the announcement of results at your polling unit. Leave peacefully once you have voted unless you are an accredited observer with permission to remain for the full process.",
        ],
      },
      {
        heading: "Your checklist for election day",
        paragraphs: [
          "Carry your PVC and arrive early.",
          "Know your polling unit name and code.",
          "Follow official instructions and keep your ballot secret.",
          "Report irregularities safely through official channels or Citizen Monitors.",
        ],
      },
    ],
  },
  {
    slug: "understanding-tiers",
    title: "Understanding Tiers",
    category: "LAW",
    readMinutes: 6,
    summary:
      "How Nigeria's elections are organised across federal, state, and local government levels—and what you vote for at each tier.",
    sections: [
      {
        heading: "Three tiers of government",
        paragraphs: [
          "Nigeria operates a federal system with three main tiers: federal (national), state, and local government. Elections at each tier choose different offices, and you may vote in more than one election during the same election cycle.",
        ],
      },
      {
        heading: "Federal tier",
        paragraphs: [
          "At the federal level, Nigerians elect the President and Vice-President, Senators (109 seats across the 36 states and FCT), and Members of the House of Representatives (360 federal constituencies).",
          "Federal elections determine national leadership and law-making at the centre. The President serves a four-year term and can serve a maximum of two terms.",
        ],
      },
      {
        heading: "State tier",
        paragraphs: [
          "At the state level, voters elect the Governor and Deputy Governor, and members of the State House of Assembly.",
          "Each of Nigeria's 36 states (and offices structured for the FCT) has its own executive and legislature responsible for state roads, education, health policy, and other matters within state jurisdiction.",
        ],
      },
      {
        heading: "Local government tier",
        paragraphs: [
          "Local government (LG) elections choose the Chairman and Councillors for your local council area. LGs handle grassroots services such as primary education support, local markets, and community infrastructure.",
          "LG election schedules are set by state electoral bodies or INEC depending on the legal framework in force—check official announcements for your state.",
        ],
      },
      {
        heading: "Why tiers matter for voters",
        paragraphs: [
          "Understanding tiers helps you know which ballot you are holding, which office a candidate seeks, and who is responsible for the issues you care about.",
          "Your PVC is tied to one polling unit, but the elections held there may include multiple ballots for different tiers on the same day. Read each ballot carefully before marking.",
        ],
      },
      {
        heading: "Citizen Monitors roles (app context)",
        paragraphs: [
          "On the Citizen Monitors app, public viewers follow election news and updates, volunteers support civic engagement, and observers are verified users who can submit field reports from polling units. Each role has different access—check your profile to see your current tier in the app.",
        ],
      },
    ],
  },
];

const bySlug = new Map(CITIZEN_ACADEMY_ARTICLES.map((a) => [a.slug, a]));

export const getAcademyArticleBySlug = (slug: string): AcademyArticle | undefined =>
  bySlug.get(slug);
