import { getMobileActiveElections, getMobileElectionSubmissionByActiveElection, getMobileLiveElectionsCarousel, mobileElectionUserAction, } from "../../services/mobile/electionService.js";
import { deleteElectionResultDataService, deleteIncidentReportDataService, updateIncidentReportDataService, updateResultDataService, uploadIncidentReportDataService, uploadResultDataService, } from "../../services/Election/electionService.js";
import { isValidObjectId } from "../../utils/validators.js";
import { invalidateCacheByPrefixes } from "../../utils/cache.js";
const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);
const asParam = (value) => Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");
const requireUserId = (req) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new Error("Authentication required");
    }
    return String(userId);
};
const invalidateMobileReadCaches = async (req) => {
    const userId = String(req.user?._id ?? "");
    if (!userId)
        return;
    await invalidateCacheByPrefixes([`mobile:elections:${userId}:`, `mobile:dashboard:${userId}:`]);
};
export const getActiveElectionsMobile = async (req, res) => {
    try {
        const r = req;
        if (!r.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const rawStatus = asParam(req.query.status).toLowerCase();
        const status = rawStatus === "live" || rawStatus === "upcoming" || rawStatus === "concluded"
            ? rawStatus
            : "all";
        const scope = "polling-unit";
        const elections = await getMobileActiveElections({
            status,
            scope,
            user: r.user,
        });
        return res.status(200).json({
            status,
            scope,
            total: elections.length,
            elections,
        });
    }
    catch (error) {
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};
export const getLiveElectionsCarouselMobile = async (req, res) => {
    try {
        const r = req;
        if (!r.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const elections = await getMobileLiveElectionsCarousel(r.user);
        return res.status(200).json({
            status: "live",
            scope: "polling-unit",
            total: elections.length,
            elections,
        });
    }
    catch (error) {
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};
export const getMyElectionSubmissionMobile = async (req, res) => {
    try {
        const r = req;
        const electionId = asParam(req.params.activeElectionId);
        if (!isValidObjectId(electionId)) {
            return res.status(400).json({ message: "Invalid election ID" });
        }
        const data = await getMobileElectionSubmissionByActiveElection(electionId, requireUserId(r));
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(500).json({
            message: "Error fetching election submission data",
            error: getErrorMessage(error),
        });
    }
};
export const submitElectionResultMobile = async (req, res) => {
    try {
        const r = req;
        const electionId = asParam(req.params.activeElectionId);
        if (!isValidObjectId(electionId)) {
            return res.status(400).json({ message: "Invalid election ID" });
        }
        const result = await uploadResultDataService(electionId, requireUserId(r), r.body, r.files);
        await invalidateMobileReadCaches(r);
        return res.status(201).json(result);
    }
    catch (error) {
        return res.status(500).json({
            message: "Error submitting result data",
            error: getErrorMessage(error),
        });
    }
};
export const updateElectionResultMobile = async (req, res) => {
    try {
        const r = req;
        const electionId = asParam(req.params.activeElectionId);
        if (!isValidObjectId(electionId)) {
            return res.status(400).json({ message: "Invalid election ID" });
        }
        const result = await updateResultDataService(electionId, requireUserId(r), r.body, r.files);
        await invalidateMobileReadCaches(r);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({
            message: "Error updating result data",
            error: getErrorMessage(error),
        });
    }
};
export const deleteElectionResultMobile = async (req, res) => {
    try {
        const r = req;
        const electionId = asParam(req.params.activeElectionId);
        if (!isValidObjectId(electionId)) {
            return res.status(400).json({ message: "Invalid election ID" });
        }
        const response = await deleteElectionResultDataService(electionId, requireUserId(r));
        await invalidateMobileReadCaches(r);
        return res.status(200).json(response);
    }
    catch (error) {
        return res.status(400).json({
            message: "Error deleting result data",
            error: getErrorMessage(error),
        });
    }
};
export const submitIncidentReportMobile = async (req, res) => {
    try {
        const r = req;
        const electionId = asParam(req.params.activeElectionId);
        if (!isValidObjectId(electionId)) {
            return res.status(400).json({ message: "Invalid election ID" });
        }
        const report = await uploadIncidentReportDataService(electionId, requireUserId(r), r.body, r.files);
        await invalidateMobileReadCaches(r);
        return res.status(201).json(report);
    }
    catch (error) {
        return res.status(500).json({
            message: "Error submitting incident report",
            error: getErrorMessage(error),
        });
    }
};
export const updateIncidentReportMobile = async (req, res) => {
    try {
        const r = req;
        const electionId = asParam(req.params.activeElectionId);
        if (!isValidObjectId(electionId)) {
            return res.status(400).json({ message: "Invalid election ID" });
        }
        const report = await updateIncidentReportDataService(electionId, requireUserId(r), r.body, r.files);
        await invalidateMobileReadCaches(r);
        return res.status(200).json(report);
    }
    catch (error) {
        return res.status(500).json({
            message: "Error updating incident report",
            error: getErrorMessage(error),
        });
    }
};
export const deleteIncidentReportMobile = async (req, res) => {
    try {
        const r = req;
        const electionId = asParam(req.params.activeElectionId);
        if (!isValidObjectId(electionId)) {
            return res.status(400).json({ message: "Invalid election ID" });
        }
        const response = await deleteIncidentReportDataService(electionId, requireUserId(r));
        await invalidateMobileReadCaches(r);
        return res.status(200).json(response);
    }
    catch (error) {
        return res.status(400).json({
            message: "Error deleting incident report",
            error: getErrorMessage(error),
        });
    }
};
const handleMobileElectionUserAction = async (req, res, options) => {
    const r = req;
    const activeElectionId = asParam(req.params.activeElectionId);
    if (!isValidObjectId(activeElectionId)) {
        return res.status(400).json({ message: "Invalid election id" });
    }
    const userId = requireUserId(r);
    let actionData = null;
    if (options.allowMutate) {
        const { electionId, action, dataType, flagReason } = req.body;
        actionData =
            electionId && action && dataType
                ? {
                    electionId,
                    action: action,
                    dataType: dataType,
                    flagReason,
                }
                : null;
        if (actionData && !isValidObjectId(actionData.electionId)) {
            return res.status(400).json({ message: "Invalid target id" });
        }
    }
    const flagMediaFiles = options.allowMutate &&
        (r.files?.flagImage?.length || r.files?.flagVideo?.length)
        ? { flagImage: r.files.flagImage, flagVideo: r.files.flagVideo }
        : undefined;
    const results = await mobileElectionUserAction(activeElectionId, userId, actionData, flagMediaFiles);
    return res.status(200).json({
        message: actionData
            ? "Updated successfully"
            : "Fetched polling-unit verification feed for this election",
        results,
    });
};
/**
 * GET — polling-unit verification feed for one ActiveElection (results + incidents).
 */
export const getMobileElectionUserAction = async (req, res) => {
    try {
        return await handleMobileElectionUserAction(req, res, { allowMutate: false });
    }
    catch (error) {
        const message = getErrorMessage(error);
        if (message.includes("not available for your location") ||
            message.includes("only allowed while the election is live") ||
            message.includes("Public viewers cannot") ||
            message.includes("polling unit")) {
            return res.status(403).json({ message });
        }
        return res.status(400).json({ message });
    }
};
/**
 * POST — PU-scoped agree/flag for one ActiveElection.
 * Same rules as web POST /api/elections/user-action; path includes activeElectionId
 * because the mobile UI opens an election first.
 * With empty body, returns the same feed as GET.
 */
export const postMobileElectionUserAction = async (req, res) => {
    try {
        return await handleMobileElectionUserAction(req, res, { allowMutate: true });
    }
    catch (error) {
        const message = getErrorMessage(error);
        if (message.includes("not available for your location") ||
            message.includes("only allowed while the election is live") ||
            message.includes("Public viewers cannot") ||
            message.includes("polling unit")) {
            return res.status(403).json({ message });
        }
        return res.status(400).json({ message });
    }
};
//# sourceMappingURL=electionController.js.map