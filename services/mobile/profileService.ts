import path from "path";
import type { Types } from "mongoose";
import CompletedUser from "../../models/CompletedUser.ts";
import ElectionData from "../../models/Election/ElectionData.ts";
import IncidentReport from "../../models/Election/IncidentReport.ts";
import MobileFeedback from "../../models/Feedback/mobileFeedback.ts";
import observerIdModel from "../../models/observerIds/observerIdModel.ts";
import {
  updateUserService,
  volunteerToObserverService,
} from "../UserDashboard/userService.ts";
import {
  buildPollingUnitDetails,
  buildWards,
  findDirectoryWithPrefix,
  resolveNestedDirectories,
} from "../Location/locationService.ts";
import { slugifyForLocationMatch } from "../../utils/locationNormalize.ts";
import { projectPath } from "../../utils/projectRoot.ts";
import { sendEmail } from "../../config/email.ts";
import { uploadFileToFirebase } from "../../config/firebaseUploader.ts";
import { mobileFeedbackTemplate } from "../../config/emailTemplates.ts";
import { dispatchMobileNotification } from "./notificationDispatchService.ts";

type Id = Types.ObjectId | string;

type ProfileUpdateFile = {
  profileImage?: {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
    size: number;
  };
};

type ObserverUpgradePayload = {
  email: string;
  details: Record<string, unknown>;
  files: {
    "observerId[]"?: Array<{
      buffer: Buffer;
      mimetype: string;
      originalname: string;
      size: number;
    }>;
  };
};

type ObserverDataFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

type MobileNotificationSettings = {
  pollingUnitActivity?: boolean;
  electionDayAlert?: boolean;
  discussionReplies?: boolean;
  resultAggregated?: boolean;
  reportConfirmed?: boolean;
  reportFlagged?: boolean;
  securityAlerts?: boolean;
  newsletter?: boolean;
  newsAndInsights?: boolean;
  pressCoverage?: boolean;
};

type PollingUnitDetail = {
  id?: string;
  name?: string;
  [key: string]: unknown;
};

const ANON_ADJECTIVES = [
  "Iron",
  "Silent",
  "Swift",
  "Vigilant",
  "Calm",
  "Brave",
  "Noble",
  "Wise",
];
const ANON_NOUNS = [
  "Eagle",
  "Falcon",
  "Panther",
  "Guardian",
  "Beacon",
  "Observer",
  "Voyager",
  "Sentinel",
];

const locationsBaseDir = projectPath("data", "states");

const getUserOrThrow = async (userId: Id) => {
  const user = await CompletedUser.findById(userId);
  if (!user) throw new Error("User not found");
  return user;
};

const sanitizeUser = (doc: { toObject: () => Record<string, unknown> }) => {
  const payload = doc.toObject();
  delete payload.password;
  delete payload.resetPasswordToken;
  delete payload.resetPasswordExpires;
  delete payload.resetPasswordOTP;
  delete payload.resetPasswordOTPExpires;
  return payload;
};


const withNotificationDefaults = (
  role: string | undefined,
  current: MobileNotificationSettings | undefined
) => ({
  pollingUnitActivity: current?.pollingUnitActivity ?? true,
  electionDayAlert: current?.electionDayAlert ?? true,
  discussionReplies: current?.discussionReplies ?? true,
  resultAggregated: current?.resultAggregated ?? true,
  reportConfirmed: current?.reportConfirmed ?? true,
  reportFlagged: current?.reportFlagged ?? role === "observer",
  securityAlerts: current?.securityAlerts ?? true,
  newsletter: current?.newsletter ?? true,
  newsAndInsights: current?.newsAndInsights ?? true,
  pressCoverage: current?.pressCoverage ?? true,
});

export const getMobileProfile = async (userId: Id) => {
  const user = await getUserOrThrow(userId);
  const sanitized = sanitizeUser(user);
  const notifications = withNotificationDefaults(
    user.role ?? undefined,
    (user.notifications as { mobile?: MobileNotificationSettings } | undefined)
      ?.mobile
  );

  return {
    ...sanitized,
    notifications: {
      ...(sanitized.notifications as Record<string, unknown> | undefined),
      mobile: notifications,
    },
  };
};

export const updateMobileProfile = async (
  userId: Id,
  updateData: Record<string, unknown>,
  file?: ProfileUpdateFile | null
) => {
  const result = await updateUserService(userId, updateData, "", file);
  return result;
};

export const updateMobilePassword = async (
  userId: Id,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  if (!currentPassword) throw new Error("Current password is required");
  return updateUserService(
    userId,
    { password: newPassword, confirmPassword },
    currentPassword,
    null
  );
};

export const upgradeVolunteerToObserver = async ({
  email,
  details,
  files,
}: ObserverUpgradePayload) => {
  return volunteerToObserverService({ email, details, files });
};

export const upgradePublicViewerToVolunteer = async (userId: Id) => {
  const user = await getUserOrThrow(userId);
  if (user.role !== "public-viewer") {
    throw new Error("Only public-viewer can upgrade to volunteer");
  }
  user.role = "volunteer";
  user.pendingObserverVerification = false;
  user.isObserverInPollingUnit = false;
  await user.save();
  return sanitizeUser(user);
};

export const upsertObserverProfileData = async (input: {
  userId: Id;
  phoneNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  observerIdFiles?: ObserverDataFile[];
  replaceObserverIds?: boolean;
}) => {
  const user = await getUserOrThrow(input.userId);
  if (user.role !== "observer") {
    throw new Error("Only observers can update observer data.");
  }

  if (input.phoneNumber !== undefined) user.phoneNumber = input.phoneNumber;
  if (input.bankName !== undefined) user.bankName = input.bankName;
  if (input.bankAccountNumber !== undefined)
    user.bankAccountNumber = input.bankAccountNumber;
  if (input.bankAccountName !== undefined)
    user.bankAccountName = input.bankAccountName;

  const incomingFiles = input.observerIdFiles ?? [];
  if (incomingFiles.length > 0) {
    const uploadedObserverIds = await Promise.all(
      incomingFiles.map(async (file) => {
        const { publicUrl, filePath } = await uploadFileToFirebase(
          file,
          "observer_ids"
        );
        return observerIdModel.create({
          location: filePath,
          name: file.originalname,
          type: file.mimetype,
          size: file.size,
          url: publicUrl,
        });
      })
    );

    if (input.replaceObserverIds) {
      user.set(
        "observerId",
        uploadedObserverIds.map((doc) => doc.toObject())
      );
    } else {
      uploadedObserverIds.forEach((doc) => {
        (user.observerId as unknown as Array<Record<string, unknown>>).push(
          doc.toObject()
        );
      });
    }
  }

  const hasObserverIds = Array.isArray(user.observerId) && user.observerId.length > 0;
  if (!user.phoneNumber || !hasObserverIds) {
    throw new Error(
      "Observer profile requires phone number and at least one observer ID file."
    );
  }

  user.pendingObserverVerification = true;
  await user.save();

  const applicantName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  await dispatchMobileNotification({
    type: "pending-approval",
    preferenceKey: "securityAlerts",
    body: "Observer application pending review",
    info: [applicantName, user.pollingUnit].filter(Boolean).join(" • "),
    recipients: ["admin", "super-admin"],
    respectPreferences: false,
  });

  return sanitizeUser(user);
};

export const getElectionVault = async (userId: Id) => {
  const [results, incidents] = await Promise.all([
    ElectionData.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "election",
        populate: { path: "election", select: "electionName electionType" },
      })
      .lean(),
    IncidentReport.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "election",
        populate: { path: "election", select: "electionName electionType" },
      })
      .lean(),
  ]);

  return {
    summary: {
      totalSubmissions: results.length + incidents.length,
      resultsUploaded: results.length,
      incidentsUploaded: incidents.length,
    },
    results,
    incidents,
  };
};

export const updateMobileNotifications = async (
  userId: Id,
  updates: MobileNotificationSettings
) => {
  const user = await getUserOrThrow(userId);
  const next = withNotificationDefaults(
    user.role ?? undefined,
    Object.assign(
      {},
      (user.notifications as { mobile?: MobileNotificationSettings } | undefined)
        ?.mobile,
      updates
    )
  );

  user.notifications = {
    ...(user.notifications ?? {}),
    email: {
      ...((user.notifications as { email?: Record<string, unknown> } | undefined)
        ?.email ?? {}),
      newsletter: next.newsletter,
    },
    mobile: next,
  } as typeof user.notifications;

  await user.save();
  return next;
};

export const getMobileNotifications = async (userId: Id) => {
  const user = await getUserOrThrow(userId);
  return withNotificationDefaults(
    user.role ?? undefined,
    (user.notifications as { mobile?: MobileNotificationSettings } | undefined)
      ?.mobile
  );
};

export const locatePollingUnit = async (input: {
  state: string;
  lga: string;
  ward?: string;
  pollingUnit?: string;
}) => {
  const state = slugifyForLocationMatch(input.state);
  const lga = slugifyForLocationMatch(input.lga);
  const wardRaw = String(input.ward ?? "").trim();
  const ward = wardRaw ? slugifyForLocationMatch(wardRaw) : undefined;
  const pollingUnitQuery = input.pollingUnit
    ? slugifyForLocationMatch(input.pollingUnit)
    : undefined;

  const stateDirName = findDirectoryWithPrefix(locationsBaseDir, state);
  if (!stateDirName) throw new Error("State directory not found");

  const lgaDir = resolveNestedDirectories(
    path.join(locationsBaseDir, stateDirName, "lgas"),
    [lga]
  );
  if (!lgaDir) throw new Error("LGA directory not found");

  if (!ward) {
    const wardNames = buildWards(lgaDir);
    const wards = wardNames.map((name) => {
      const pollingUnits = buildPollingUnitDetails(lgaDir, [name]) as PollingUnitDetail[];
      return { name, count: pollingUnits.length, pollingUnits };
    });
    const count = wards.reduce((sum, row) => sum + row.pollingUnits.length, 0);
    return { count, wards };
  }

  const units = buildPollingUnitDetails(lgaDir, [ward]) as PollingUnitDetail[];
  if (!pollingUnitQuery) {
    return { count: units.length, pollingUnits: units };
  }

  const exact = units.find((unit) =>
    slugifyForLocationMatch(String(unit.name ?? "")) === pollingUnitQuery
  );
  if (!exact) {
    throw new Error("Polling unit not found");
  }
  return { count: 1, pollingUnits: [exact] };
};

export const submitMobileFeedback = async (input: {
  userId: Id;
  email: string;
  title: string;
  message: string;
}) => {
  const feedback = await MobileFeedback.create({
    user: input.userId,
    email: input.email,
    title: input.title,
    message: input.message,
  });

  const supportEmail = process.env.SUPPORT_EMAIL || "support@citizenmonitors.com";
  await sendEmail({
    to: supportEmail,
    subject: `Mobile Feedback: ${input.title}`,
    htmlbody: mobileFeedbackTemplate(input.email, input.title, input.message),
  });

  return feedback;
};

const randomItem = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)] as T;

const makeAnonymousCandidate = (): string =>
  `${randomItem(ANON_ADJECTIVES)}${randomItem(ANON_NOUNS)}${Math.floor(
    10 + Math.random() * 90
  )}`;

export const generateAnonymousUsername = async (userId: Id) => {
  const user = await getUserOrThrow(userId);
  for (let i = 0; i < 25; i += 1) {
    const candidate = makeAnonymousCandidate();
    const exists = await CompletedUser.exists({ anonymousUsername: candidate });
    if (!exists) {
      user.anonymousUsername = candidate;
      await user.save();
      return { anonymousUsername: candidate };
    }
  }
  throw new Error("Unable to generate anonymous username. Please retry.");
};

export const setAnonymousIdentityToggle = async (userId: Id, enabled: boolean) => {
  const user = await getUserOrThrow(userId);
  if (enabled && !user.anonymousUsername) {
    const generated = await generateAnonymousUsername(userId);
    user.anonymousUsername = generated.anonymousUsername;
  }
  user.useAnonymousIdentity = enabled;
  await user.save();
  return {
    useAnonymousIdentity: user.useAnonymousIdentity ?? false,
    anonymousUsername: user.anonymousUsername,
  };
};
