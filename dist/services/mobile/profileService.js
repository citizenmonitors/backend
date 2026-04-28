import path from "path";
import { fileURLToPath } from "url";
import CompletedUser from "../../models/CompletedUser.js";
import ElectionData from "../../models/Election/ElectionData.js";
import IncidentReport from "../../models/Election/IncidentReport.js";
import MobileFeedback from "../../models/Feedback/mobileFeedback.js";
import observerIdModel from "../../models/observerIds/observerIdModel.js";
import { updateUserService, volunteerToObserverService, } from "../UserDashboard/userService.js";
import { buildPollingUnitDetails, findDirectoryWithPrefix, resolveNestedDirectories, } from "../Location/locationService.js";
import { slugifyForLocationMatch } from "../../utils/locationNormalize.js";
import { sendEmail } from "../../config/email.js";
import { uploadFileToFirebase } from "../../config/firebaseUploader.js";
import { mobileFeedbackTemplate } from "../../config/emailTemplates.js";
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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const locationsBaseDir = path.join(__dirname, "../../data/states");
const getUserOrThrow = async (userId) => {
    const user = await CompletedUser.findById(userId);
    if (!user)
        throw new Error("User not found");
    return user;
};
const sanitizeUser = (doc) => {
    const payload = doc.toObject();
    delete payload.password;
    delete payload.resetPasswordToken;
    delete payload.resetPasswordExpires;
    delete payload.resetPasswordOTP;
    delete payload.resetPasswordOTPExpires;
    return payload;
};
const withNotificationDefaults = (role, current) => ({
    pollingUnitActivity: current?.pollingUnitActivity ?? true,
    electionDayAlert: current?.electionDayAlert ?? false,
    discussionReplies: current?.discussionReplies ?? false,
    resultAggregated: current?.resultAggregated ?? false,
    reportConfirmed: current?.reportConfirmed ?? false,
    reportFlagged: current?.reportFlagged ?? role === "observer",
    securityAlerts: current?.securityAlerts ?? false,
    newsletter: current?.newsletter ?? true,
});
export const getMobileProfile = async (userId) => {
    const user = await getUserOrThrow(userId);
    const sanitized = sanitizeUser(user);
    const notifications = withNotificationDefaults(user.role ?? undefined, user.notifications
        ?.mobile);
    return {
        ...sanitized,
        notifications: {
            ...sanitized.notifications,
            mobile: notifications,
        },
    };
};
export const updateMobileProfile = async (userId, updateData, file) => {
    const result = await updateUserService(userId, updateData, "", file);
    return result;
};
export const updateMobilePassword = async (userId, currentPassword, newPassword, confirmPassword) => {
    if (!currentPassword)
        throw new Error("Current password is required");
    return updateUserService(userId, { password: newPassword, confirmPassword }, currentPassword, null);
};
export const upgradeVolunteerToObserver = async ({ email, details, files, }) => {
    return volunteerToObserverService({ email, details, files });
};
export const upgradePublicViewerToVolunteer = async (userId) => {
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
export const upsertObserverProfileData = async (input) => {
    const user = await getUserOrThrow(input.userId);
    if (user.role !== "observer") {
        throw new Error("Only observers can update observer data.");
    }
    if (input.phoneNumber !== undefined)
        user.phoneNumber = input.phoneNumber;
    if (input.bankName !== undefined)
        user.bankName = input.bankName;
    if (input.bankAccountNumber !== undefined)
        user.bankAccountNumber = input.bankAccountNumber;
    if (input.bankAccountName !== undefined)
        user.bankAccountName = input.bankAccountName;
    const incomingFiles = input.observerIdFiles ?? [];
    if (incomingFiles.length > 0) {
        const uploadedObserverIds = await Promise.all(incomingFiles.map(async (file) => {
            const { publicUrl, filePath } = await uploadFileToFirebase(file, "observer_ids");
            return observerIdModel.create({
                location: filePath,
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                url: publicUrl,
            });
        }));
        if (input.replaceObserverIds) {
            user.set("observerId", uploadedObserverIds.map((doc) => doc.toObject()));
        }
        else {
            uploadedObserverIds.forEach((doc) => {
                user.observerId.push(doc.toObject());
            });
        }
    }
    const hasObserverIds = Array.isArray(user.observerId) && user.observerId.length > 0;
    if (!user.phoneNumber || !hasObserverIds) {
        throw new Error("Observer profile requires phone number and at least one observer ID file.");
    }
    user.pendingObserverVerification = true;
    await user.save();
    return sanitizeUser(user);
};
export const getElectionVault = async (userId) => {
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
export const updateMobileNotifications = async (userId, updates) => {
    const user = await getUserOrThrow(userId);
    const next = withNotificationDefaults(user.role ?? undefined, Object.assign({}, user.notifications
        ?.mobile, updates));
    user.notifications = {
        ...(user.notifications ?? {}),
        email: {
            ...(user.notifications
                ?.email ?? {}),
            newsletter: next.newsletter,
        },
        mobile: next,
    };
    await user.save();
    return next;
};
export const getMobileNotifications = async (userId) => {
    const user = await getUserOrThrow(userId);
    return withNotificationDefaults(user.role ?? undefined, user.notifications
        ?.mobile);
};
export const locatePollingUnit = async (input) => {
    const state = slugifyForLocationMatch(input.state);
    const lga = slugifyForLocationMatch(input.lga);
    const ward = slugifyForLocationMatch(input.ward);
    const pollingUnitQuery = input.pollingUnit
        ? slugifyForLocationMatch(input.pollingUnit)
        : undefined;
    const stateDirName = findDirectoryWithPrefix(locationsBaseDir, state);
    if (!stateDirName)
        throw new Error("State directory not found");
    const lgaDir = resolveNestedDirectories(path.join(locationsBaseDir, stateDirName, "lgas"), [lga]);
    if (!lgaDir)
        throw new Error("LGA directory not found");
    const units = buildPollingUnitDetails(lgaDir, [ward]);
    if (!pollingUnitQuery) {
        return { count: units.length, pollingUnits: units };
    }
    const exact = units.find((unit) => slugifyForLocationMatch(String(unit.name ?? "")) === pollingUnitQuery);
    if (!exact) {
        throw new Error("Polling unit not found");
    }
    return { count: 1, pollingUnits: [exact] };
};
export const submitMobileFeedback = async (input) => {
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
const randomItem = (items) => items[Math.floor(Math.random() * items.length)];
const makeAnonymousCandidate = () => `${randomItem(ANON_ADJECTIVES)}${randomItem(ANON_NOUNS)}${Math.floor(10 + Math.random() * 90)}`;
export const generateAnonymousUsername = async (userId) => {
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
export const setAnonymousIdentityToggle = async (userId, enabled) => {
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
//# sourceMappingURL=profileService.js.map