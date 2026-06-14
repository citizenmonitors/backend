/**
 * Citizen FAQ — frequently asked questions for the mobile app.
 * Content is informational only and not legal advice.
 */

export type FAQCategory = "general" | "observer";

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export type FAQCategoryBundle = {
  category: FAQCategory;
  title: string;
  items: FAQItem[];
};

export const CITIZEN_FAQ_CATEGORIES: FAQCategoryBundle[] = [
  {
    category: "general",
    title: "General FAQ",
    items: [
      {
        id: "what-is-citizen-monitors",
        question: "What is Citizen Monitors?",
        answer:
          "Citizen Monitors is a civic platform that helps Nigerians stay informed about elections, follow credible updates, and participate in election accountability. The mobile app provides news, educational content, polling unit tools, and ways to engage with election-related discussions.",
      },
      {
        id: "is-the-app-free",
        question: "Is the app free to use?",
        answer:
          "Yes. Downloading and using Citizen Monitors is free. Some features require you to create an account and verify your email.",
      },
      {
        id: "how-do-i-create-an-account",
        question: "How do I create an account?",
        answer:
          "Register with your email and password, or continue with Google where supported. After registration, verify your email using the code sent to you before signing in.",
      },
      {
        id: "do-i-need-pvc-to-use-the-app",
        question: "Do I need a PVC to use the app?",
        answer:
          "No. You can browse news, Citizen Academy, and many features without a PVC. Adding your polling unit to your profile helps personalise content and is useful for election-day tools.",
      },
      {
        id: "what-is-a-polling-unit",
        question: "What is a polling unit?",
        answer:
          "A polling unit (PU) is the specific location where you vote on election day. It is assigned when you register as a voter and is printed on your PVC. Each PU has a unique name and code.",
      },
      {
        id: "how-do-i-find-my-polling-unit",
        question: "How do I find my polling unit?",
        answer:
          "Check your PVC for your polling unit name and code. In the app, use the polling unit lookup under Profile after selecting your state and LGA. You can also verify your details on INEC's official voter verification channels.",
      },
      {
        id: "what-is-citizen-academy",
        question: "What is Citizen Academy?",
        answer:
          "Citizen Academy is the in-app learning section with short guides on voter registration, polling unit conduct, election day procedures, and other civic topics. Articles are for education only—not legal advice.",
      },
      {
        id: "what-is-the-pulse",
        question: "What is Pulse?",
        answer:
          "Pulse is the app's social feed where registered users can share posts and comments about civic and election topics. You can like and comment on posts from other users.",
      },
      {
        id: "what-are-news-and-press-coverage",
        question: "What are News & Insight and Press Coverage?",
        answer:
          "News & Insight features articles published by the Citizen Monitors team. Press Coverage highlights media reports and press-related content. Both sections support likes and comments from signed-in users.",
      },
      {
        id: "can-i-use-anonymous-name",
        question: "Can I post with an anonymous username?",
        answer:
          "Yes, if you enable anonymous identity in your profile settings and generate an anonymous username. When enabled, your Pulse and comment activity can display that username instead of your real name.",
      },
      {
        id: "how-do-i-reset-password",
        question: "How do I reset my password?",
        answer:
          "Use Forgot Password on the sign-in screen. Enter your email, receive a one-time code, and set a new password. If you signed up with Google and have not set a password yet, use Set Password in the app after signing in.",
      },
      {
        id: "how-do-i-update-profile",
        question: "How do I update my profile?",
        answer:
          "Go to Profile in the app to update your name, location (state, LGA, ward, polling unit), profile image, and notification preferences. Some changes may require saving separately from observer-specific data.",
      },
      {
        id: "what-notifications-will-i-receive",
        question: "What notifications will I receive?",
        answer:
          "You can control notification categories in Profile → Notifications, including election updates, news, observer alerts, and inbox messages. Push notifications require you to allow alerts on your device.",
      },
      {
        id: "is-my-data-safe",
        question: "Is my personal data safe?",
        answer:
          "Citizen Monitors stores account and profile data securely. Do not share your password or verification codes. Report suspicious messages claiming to be from Citizen Monitors through official support channels.",
      },
      {
        id: "who-can-i-contact-for-help",
        question: "Who can I contact for help?",
        answer:
          "Use the in-app feedback option under Profile, or contact Citizen Monitors through official email and social media listed on the website. For INEC registration or PVC issues, contact INEC directly.",
      },
    ],
  },
  {
    category: "observer",
    title: "Observer FAQ",
    items: [
      {
        id: "what-is-an-observer",
        question: "What is an observer on Citizen Monitors?",
        answer:
          "An observer is a verified app user who can submit field reports and access observer-specific tools during elections. Observers help document what happens at polling units and support election transparency.",
      },
      {
        id: "observer-vs-volunteer-vs-public-viewer",
        question: "What is the difference between observer, volunteer, and public viewer?",
        answer:
          "Public viewers can follow content and basic features. Volunteers have expanded engagement access. Observers are volunteers who complete observer registration, submit ID documents, and are approved by Citizen Monitors admins before gaining observer privileges.",
      },
      {
        id: "how-do-i-become-an-observer",
        question: "How do I become an observer?",
        answer:
          "Start as a public viewer, upgrade to volunteer if needed, then apply for the observer role. Submit your observer details including phone number and upload your observer identification documents. An admin will review your application.",
      },
      {
        id: "what-documents-are-required",
        question: "What documents are required for observer registration?",
        answer:
          "You must upload your PVC (Permanent Voter's Card). You also need a valid phone number on your profile.",
      },
      {
        id: "what-is-pending-approval",
        question: "What does pending approval mean?",
        answer:
          "After you submit observer documents, your account status is pending until an admin reviews and approves or rejects your application. You will receive a notification when a decision is made.",
      },
      {
        id: "how-long-does-approval-take",
        question: "How long does observer approval take?",
        answer:
          "Review times vary depending on submission volume. Ensure your documents are clear and your phone number is correct to avoid delays. Contact support through feedback if your application has been pending unusually long.",
      },
      {
        id: "can-i-observe-without-inec-accreditation",
        question: "Can I observe without INEC accreditation?",
        answer:
          "Citizen Monitors observer status is separate from INEC official accreditation. To enter restricted areas or remain at a polling unit after voting closes, you may still need valid INEC or organisation accreditation under Nigerian law. Always follow lawful instructions from election officials and security.",
      },
      {
        id: "what-can-i-report-as-observer",
        question: "What can I report as an observer?",
        answer:
          "Observers can document incidents such as late opening, intimidation, missing materials, accreditation problems, and result-sheet issues—depending on which reporting features are active for that election. Report only what you directly witness; be factual and avoid exaggeration.",
      },
      {
        id: "do-i-need-bank-details",
        question: "Do I need to add bank details?",
        answer:
          "Bank name, account number, and account name may be required on your observer profile for stipends or reimbursements when Citizen Monitors runs funded observer programmes. Add accurate details in Profile → Observer data.",
      },
      {
        id: "can-i-update-observer-documents",
        question: "Can I update my observer documents after submission?",
        answer:
          "Yes. Upload new observer ID files through the observer data section in your profile. Replacing documents may reset your status to pending approval until an admin reviews the update.",
      },
      {
        id: "what-if-my-application-is-rejected",
        question: "What if my observer application is rejected?",
        answer:
          "You will receive a notification if your application is not approved. Review the reason if provided, correct your documents or details, and resubmit. You can still use the app as a volunteer or public viewer.",
      },
      {
        id: "observer-election-day-conduct",
        question: "How should I conduct myself on election day?",
        answer:
          "Wear identification where appropriate, stay non-partisan, do not interfere with voting, and follow INEC and security instructions. Prioritise personal safety. Photograph or film only where it is safe and permitted.",
      },
      {
        id: "can-i-change-polling-unit-as-observer",
        question: "Can I change my polling unit as an observer?",
        answer:
          "Update your state, LGA, ward, and polling unit in your profile if your assigned location changes. For election deployment, follow any specific instructions from Citizen Monitors about where you are expected to report.",
      },
      {
        id: "observer-notifications",
        question: "What observer notifications will I receive?",
        answer:
          "Observers can receive alerts for approval status, election-day briefings, assignment updates, and inbox messages. Manage these under Profile → Notifications.",
      },
      {
        id: "who-approves-observers",
        question: "Who approves observer applications?",
        answer:
          "Citizen Monitors administrators review submitted documents and approve or reject applications. Approval on the app does not replace accreditation by INEC or other election management bodies where the law requires it.",
      },
    ],
  },
];

const categoryBySlug = new Map(
  CITIZEN_FAQ_CATEGORIES.map((bundle) => [bundle.category, bundle])
);

export const getFAQCategory = (
  category: FAQCategory
): FAQCategoryBundle | undefined => categoryBySlug.get(category);
