import upload from "../../config/multer.js";
import { getElectionVault, getMobileNotifications, getMobileProfile, generateAnonymousUsername, locatePollingUnit, setAnonymousIdentityToggle, submitMobileFeedback, updateMobileNotifications, updateMobilePassword, updateMobileProfile, upsertObserverProfileData, upgradePublicViewerToVolunteer, upgradeVolunteerToObserver, } from "../../services/mobile/profileService.js";
const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);
const MOBILE_PROFILE_ALLOWED_FIELDS = new Set([
    "firstName",
    "lastName",
    "phoneNumber",
    "gender",
    "dateOfBirth",
    "state",
    "lga",
    "ward",
    "pollingUnit",
    "isRegisteredVoter",
    "isPoliticalPartyMember",
    "isElectionWitnessReady",
    "isOpenToSurvey",
    "nationality",
    "whyYouJoinUs",
]);
const toBooleanIfBooleanLike = (value) => {
    if (typeof value !== "string")
        return value;
    const lowered = value.trim().toLowerCase();
    if (lowered === "true")
        return true;
    if (lowered === "false")
        return false;
    return value;
};
const buildSafeMobileProfileUpdatePayload = (body) => {
    const safe = {};
    for (const [key, raw] of Object.entries(body)) {
        if (!MOBILE_PROFILE_ALLOWED_FIELDS.has(key))
            continue;
        if (key.includes(".") || key.includes("$"))
            continue;
        safe[key] = toBooleanIfBooleanLike(raw);
    }
    return safe;
};
const requireUser = (req) => {
    const user = req.user;
    if (!user?._id || !user.email)
        throw new Error("Authentication required");
    return { _id: user._id, email: user.email, role: user.role };
};
export const getMyProfileMobile = async (req, res) => {
    try {
        const user = requireUser(req);
        const profile = await getMobileProfile(user._id);
        return res.status(200).json(profile);
    }
    catch (error) {
        return res.status(401).json({ message: getErrorMessage(error) });
    }
};
export const updateMyProfileMobile = [
    upload.single("profileImage"),
    async (req, res) => {
        try {
            const r = req;
            const user = requireUser(r);
            const safeUpdateData = buildSafeMobileProfileUpdatePayload(req.body);
            const result = await updateMobileProfile(user._id, safeUpdateData, r.file ? { profileImage: r.file } : null);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({ message: getErrorMessage(error) });
        }
    },
];
export const updateMyPasswordMobile = async (req, res) => {
    try {
        const user = requireUser(req);
        const result = await updateMobilePassword(user._id, req.body.currentPassword, req.body.newPassword, req.body.confirmPassword);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(400).json({ message: getErrorMessage(error) });
    }
};
export const volunteerToObserverMobile = [
    upload.fields([{ name: "observerId[]", maxCount: 2 }]),
    async (req, res) => {
        try {
            const r = req;
            const user = requireUser(r);
            const result = await upgradeVolunteerToObserver({
                email: user.email,
                details: req.body,
                files: (r.files ?? {}),
            });
            return res.status(200).json({
                message: "Volunteer updated to observer successfully.",
                user: result,
            });
        }
        catch (error) {
            return res.status(400).json({ message: getErrorMessage(error) });
        }
    },
];
export const upsertObserverDataMobile = [
    upload.fields([{ name: "observerId[]", maxCount: 4 }]),
    async (req, res) => {
        try {
            const r = req;
            const user = requireUser(r);
            const result = await upsertObserverProfileData({
                userId: user._id,
                phoneNumber: req.body.phoneNumber,
                bankName: req.body.bankName,
                bankAccountNumber: req.body.bankAccountNumber,
                bankAccountName: req.body.bankAccountName,
                observerIdFiles: (r.files?.["observerId[]"] ?? []),
                replaceObserverIds: String(req.body.replaceObserverIds ?? "false").toLowerCase() === "true",
            });
            return res.status(200).json({
                message: "Observer data saved successfully.",
                user: result,
            });
        }
        catch (error) {
            return res.status(400).json({ message: getErrorMessage(error) });
        }
    },
];
export const publicViewerToVolunteerMobile = async (req, res) => {
    try {
        const user = requireUser(req);
        const result = await upgradePublicViewerToVolunteer(user._id);
        return res.status(200).json({
            message: "Public viewer upgraded to volunteer successfully.",
            user: result,
        });
    }
    catch (error) {
        return res.status(400).json({ message: getErrorMessage(error) });
    }
};
export const getElectionVaultMobile = async (req, res) => {
    try {
        const user = requireUser(req);
        const vault = await getElectionVault(user._id);
        return res.status(200).json(vault);
    }
    catch (error) {
        return res.status(400).json({ message: getErrorMessage(error) });
    }
};
export const locatePollingUnitMobile = async (req, res) => {
    try {
        const result = await locatePollingUnit(req.body);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(400).json({ message: getErrorMessage(error) });
    }
};
export const getNotificationSettingsMobile = async (req, res) => {
    try {
        const user = requireUser(req);
        const settings = await getMobileNotifications(user._id);
        return res.status(200).json(settings);
    }
    catch (error) {
        return res.status(400).json({ message: getErrorMessage(error) });
    }
};
export const updateNotificationSettingsMobile = async (req, res) => {
    try {
        const user = requireUser(req);
        const settings = await updateMobileNotifications(user._id, req.body);
        return res.status(200).json({
            message: "Notification settings updated successfully.",
            settings,
        });
    }
    catch (error) {
        return res.status(400).json({ message: getErrorMessage(error) });
    }
};
export const submitFeedbackMobile = async (req, res) => {
    try {
        const user = requireUser(req);
        const feedback = await submitMobileFeedback({
            userId: user._id,
            email: user.email,
            title: req.body.title,
            message: req.body.message,
        });
        return res.status(201).json({
            message: "Feedback submitted successfully.",
            feedbackId: feedback._id,
        });
    }
    catch (error) {
        return res.status(400).json({ message: getErrorMessage(error) });
    }
};
export const generateAnonymousUsernameMobile = async (req, res) => {
    try {
        const user = requireUser(req);
        const result = await generateAnonymousUsername(user._id);
        return res.status(200).json({
            message: "Anonymous username generated successfully.",
            ...result,
        });
    }
    catch (error) {
        return res.status(400).json({ message: getErrorMessage(error) });
    }
};
export const setAnonymousIdentityToggleMobile = async (req, res) => {
    try {
        const user = requireUser(req);
        const enabled = Boolean(req.body.enabled);
        const result = await setAnonymousIdentityToggle(user._id, enabled);
        return res.status(200).json({
            message: "Anonymous identity setting updated successfully.",
            ...result,
        });
    }
    catch (error) {
        return res.status(400).json({ message: getErrorMessage(error) });
    }
};
//# sourceMappingURL=profileController.js.map