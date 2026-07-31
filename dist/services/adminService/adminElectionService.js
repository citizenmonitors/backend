import mongoose from "mongoose";
import CompletedUser from "../../models/CompletedUser.js";
import ElectionData from "../../models/Election/ElectionData.js";
import DailyTraffic from "../../models/DailyTraffic/dailyTraffic.js";
import MontlyActiveUsers from "../../models/ActiveMontlyUsers/activeMontlyUsers.js";
import IncidentReport from "../../models/Election/IncidentReport.js";
import ActiveElection from "../../models/Election/ActiveElection.js";
import AdminLog from "../../models/admin/AdminLog.js";
import Notification from "../../models/DailyTraffic/Notification.js";
import { detachIncidentFromActiveElection, detachResultFromActiveElection, } from "../Election/electionService.js";
function toObjectId(id) {
    return id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(String(id));
}
const errMsg = (error) => error instanceof Error ? error.message : String(error);
/** Labels from ActiveElection lean row with populated `election`. */
export function getPopulatedElectionLabels(active) {
    const e = active?.election;
    if (e &&
        typeof e === "object" &&
        !Array.isArray(e) &&
        ("electionType" in e || "electionName" in e)) {
        const doc = e;
        return {
            type: doc.electionType ?? "N/A",
            name: doc.electionName ?? "N/A",
        };
    }
    return { type: "N/A", name: "N/A" };
}
export function userSummaryFromLean(user) {
    if (user && typeof user === "object" && !Array.isArray(user)) {
        return user;
    }
    return undefined;
}
const logAdminAction = async (adminId, action, details) => {
    await AdminLog.create({
        admin: adminId,
        action,
        details,
        timestamp: new Date(),
    });
};
export const getDashboardDataService = async () => {
    try {
        const [totalRegisteresUSers, totalObserverUsers, totalActiveUsers, totalResultsUploaded, dailyTraffic,] = await Promise.all([
            CompletedUser.countDocuments(),
            CompletedUser.countDocuments({ role: "observer" }),
            MontlyActiveUsers.find(),
            ElectionData.countDocuments(),
            DailyTraffic.find(),
        ]);
        // Get user info
        const maleCount = await CompletedUser.countDocuments({ gender: 'male' });
        const femaleCount = await CompletedUser.countDocuments({ gender: 'female' });
        const observerCount = await CompletedUser.countDocuments({ role: 'observer' });
        const volunteerCount = await CompletedUser.countDocuments({ role: 'volunteer' });
        const userInfo = {
            gender: {
                male: maleCount,
                female: femaleCount,
            },
            role: {
                observer: observerCount,
                volunteer: volunteerCount,
            },
        };
        return {
            totalRegisteresUSers,
            totalObserverUsers,
            totalActiveUsers,
            totalResultsUploaded,
            userInfo,
            dailyTraffic,
        };
    }
    catch (error) {
        console.error("Error fetching dashboard data", error);
        throw new Error("Failed to fetch dashboard data");
    }
};
export const getAllAdminService = async () => {
    return await CompletedUser.find({ role: 'admin' }).select('firstName lastName email image');
};
export const getAllResultService = async () => {
    try {
        const activeElections = await ActiveElection.find()
            .populate("election", "electionType electionName")
            .lean();
        if (!activeElections || activeElections.length === 0) {
            throw new Error("No election found");
        }
        const allResults = [];
        for (const election of activeElections) {
            const { type: electionTypeLabel, name: electionNameLabel } = getPopulatedElectionLabels(election);
            if (!election.election) {
                console.log(`Skipping election ${election._id} due to missing election details.`);
                continue;
            }
            const electionResults = await ElectionData.find({
                election: election._id,
            })
                .populate("user", "firstName lastName email role")
                .lean();
            const electionIncidents = await IncidentReport.find({
                election: election._id,
            })
                .populate("user", "firstName lastName email role")
                .lean();
            // Consolidate results
            for (const result of electionResults) {
                const resultUser = userSummaryFromLean(result.user);
                if (result.user) {
                    allResults.push({
                        id: result._id,
                        firstName: resultUser?.firstName || "N/A",
                        lastName: resultUser?.lastName || "N/A",
                        email: resultUser?.email || "N/A",
                        role: resultUser?.role || "N/A",
                        election: electionTypeLabel,
                        electionName: electionNameLabel,
                        state: result.state,
                        lga: result.lga,
                        pictures: Array.isArray(result.resultPicture)
                            ? result.resultPicture
                            : result.resultPicture
                                ? [result.resultPicture]
                                : [],
                        videos: Array.isArray(result.resultVideo)
                            ? result.resultVideo
                            : result.resultVideo
                                ? [result.resultVideo]
                                : [],
                        createdAt: result.createdAt,
                        resultUploaded: "Election Result",
                    });
                }
                else {
                    console.warn(`Result without user reference: ${result._id}`);
                }
            }
            // Consolidate incidents
            for (const incident of electionIncidents) {
                const incidentUser = userSummaryFromLean(incident.user);
                if (incident.user) {
                    allResults.push({
                        id: incident._id,
                        firstName: incidentUser?.firstName || "N/A",
                        lastName: incidentUser?.lastName || "N/A",
                        email: incidentUser?.email || "N/A",
                        role: incidentUser?.role || "N/A",
                        election: electionTypeLabel,
                        electionName: electionNameLabel,
                        state: incident.state,
                        lga: incident.lga,
                        pictures: incident.incidentPictures || [],
                        videos: incident.incidentVideos || [],
                        createdAt: incident.createdAt,
                        resultUploaded: "Incident Report",
                    });
                }
                else {
                    console.warn(`Incident without user reference: ${incident._id}`);
                }
            }
        }
        return allResults;
    }
    catch (error) {
        console.error(`Error fetching results and incidents: ${errMsg(error)}`);
        throw new Error(`Error fetching results and incidents: ${errMsg(error)}`);
    }
};
// Fetch individual results or incident
export const getResultOrIncidentByIdService = async (id) => {
    try {
        // Find the election result by ID
        const result = await ElectionData.findById(id).lean();
        if (result) {
            const activeElection = await ActiveElection.findById(result.election)
                .populate("election", "electionType electionName")
                .lean();
            if (!activeElection) {
                throw new Error("Election details not found for the result");
            }
            const { flagged, actions, agreed, ...filteredResult } = result;
            const labels = getPopulatedElectionLabels(activeElection);
            return {
                result: {
                    electionDetails: {
                        election: labels.type,
                        electionName: labels.name,
                        startDate: activeElection?.startDate || null,
                        endDate: activeElection?.endDate || null,
                        mockElection: activeElection?.mockElection,
                        electionLocation: activeElection?.electionLocation,
                    },
                    ...filteredResult,
                },
            };
        }
        // Find the incident by ID
        const incident = await IncidentReport.findById(id).lean();
        if (incident) {
            const activeElectionIncident = await ActiveElection.findById(incident.election)
                .populate("election", "electionType electionName")
                .lean();
            if (!activeElectionIncident) {
                throw new Error("Election details not found for the incident.");
            }
            const { flagged, actions, agreed, ...filteredIncident } = incident;
            const incidentLabels = getPopulatedElectionLabels(activeElectionIncident);
            return {
                incident: {
                    electionDetails: {
                        election: incidentLabels.type,
                        electionName: incidentLabels.name,
                        startDate: activeElectionIncident?.startDate || null,
                        endDate: activeElectionIncident?.endDate || null,
                        mockElection: activeElectionIncident?.mockElection,
                        electionLocation: activeElectionIncident?.electionLocation,
                    },
                    ...filteredIncident,
                },
            };
        }
        throw new Error("No result or incident found with the given ID");
    }
    catch (error) {
        throw new Error(`Error fetching results and incidents: ${errMsg(error)}`);
    }
};
// Delete result or incident
export const deleteResultOrIncidentService = async (id, adminId) => {
    try {
        let deletedType = "";
        const result = await ElectionData.findByIdAndDelete(id);
        if (result) {
            deletedType = "Election Result";
            await detachResultFromActiveElection(result.election, result._id);
        }
        else {
            const incident = await IncidentReport.findByIdAndDelete(id);
            if (incident) {
                deletedType = "Incident Report";
                await detachIncidentFromActiveElection(incident.election, incident._id);
            }
        }
        if (!deletedType) {
            throw new Error("No result or incident found with the given ID");
        }
        // Log admin action
        await AdminLog.create({
            admin: adminId,
            action: `Deleted ${deletedType}`,
            timestamp: new Date(),
        });
        return { message: `${deletedType} deleted successfully` };
    }
    catch (error) {
        throw new Error(`Error deleting result or incident: ${errMsg(error)}`);
    }
};
export const getFlaggedResultsService = async () => {
    try {
        return await fetchUpdatedFlaggedResults();
    }
    catch (error) {
        console.error(`Error fetching results and incidents: ${errMsg(error)}`);
        throw new Error(`Error fetching results and incidents: ${errMsg(error)}`);
    }
};
export const deleteFlaggedResults = async (id, adminId) => {
    try {
        let deletedType = "";
        const result = await ElectionData.findOne({ _id: id, flagged: true });
        const incident = await IncidentReport.findOne({ _id: id, flagged: true });
        if (!result && !incident) {
            throw new Error("No flagged result found for deletion");
        }
        if (result) {
            await ElectionData.findByIdAndDelete(id);
            deletedType = "Flagged Election Result";
            await detachResultFromActiveElection(result.election, result._id);
        }
        if (incident) {
            await IncidentReport.findByIdAndDelete(id);
            deletedType = "Flagged Incident Report";
            await detachIncidentFromActiveElection(incident.election, incident._id);
        }
        const results = await fetchUpdatedFlaggedResults();
        // Log admin action
        await AdminLog.create({
            admin: adminId,
            action: `Deleted ${deletedType}`,
            timestamp: new Date(),
        });
        return { message: `${deletedType} deleted successfully`, results };
    }
    catch (error) {
        throw new Error(`Error deleting flagged result: ${errMsg(error)}`);
    }
};
export const restoreFlaggedResult = async (id, adminId) => {
    try {
        let updated = false;
        let restoredType = "";
        const result = await ElectionData.findById(id);
        if (result) {
            result.hidden = false;
            result.flagged = false;
            result.set("actions", []);
            result.priorityLevel = 0;
            await result.save();
            updated = true;
            restoredType = "Election Result";
        }
        const incident = await IncidentReport.findById(id);
        if (incident) {
            incident.hidden = false;
            incident.flagged = false;
            incident.set("actions", []);
            incident.priorityLevel = 0;
            await incident.save();
            updated = true;
            restoredType = "Incident Report";
        }
        if (!updated) {
            throw new Error("No flagged result or incident found.");
        }
        const results = await fetchUpdatedFlaggedResults();
        // Log the restoration
        await logAdminAction(adminId, `Restored flagged ${restoredType}`, {
            flaggedId: id,
        });
        await AdminLog.create({
            admin: adminId,
            action: `Restored flagged ${restoredType}`,
            timestamp: new Date(),
        });
        return { message: `${restoredType} restored successfully`, results };
    }
    catch (error) {
        throw new Error(`Error restoring flagged result: ${errMsg(error)}`);
    }
};
export const getSingleFlaggedElectionService = async (id) => {
    try {
        // Check if it's an election result
        const result = await ElectionData.findById(id).lean();
        if (result) {
            if (!result.flagged) {
                throw new Error("This election result is not flagged");
            }
            const activeElectionResult = await ActiveElection.findById(result.election)
                .populate("election", "electionType electionName")
                .lean();
            if (!activeElectionResult) {
                throw new Error("Election details not found for the result");
            }
            // Extract counter evidence IDs from actions
            const evidenceIds = result.actions
                ?.filter((action) => action.evidenceId)
                .map((action) => action.evidenceId) || [];
            // Fetch counter evidence results
            const counterEvidence = await ElectionData.find({
                _id: { $in: evidenceIds },
            }).lean();
            // Remove unnecessary fields
            const { actions, agreed, ...filteredResult } = result;
            const flaggedResultLabels = getPopulatedElectionLabels(activeElectionResult);
            return {
                result: {
                    electionDetails: {
                        election: flaggedResultLabels.type,
                        electionName: flaggedResultLabels.name,
                        startDate: activeElectionResult?.startDate || null,
                        endDate: activeElectionResult?.endDate || null,
                        mockElection: activeElectionResult?.mockElection,
                        electionLocation: activeElectionResult?.electionLocation,
                    },
                    ...filteredResult,
                },
                counterEvidence: counterEvidence.map((evidence) => ({
                    id: evidence._id,
                    state: evidence.state,
                    lga: evidence.lga,
                    ward: evidence.ward,
                    pollingUnit: evidence.pollingUnit,
                    partiesVotes: evidence.partiesVotes,
                    accreditedVoters: evidence.accreditedVoters,
                    rejectedPapers: evidence.rejectedPapers,
                    spoiledBallotPapers: evidence.spoiledBallotPapers,
                    usedBallotPapers: evidence.usedBallotPapers,
                    resultPicture: evidence.resultPicture,
                    resultVideo: evidence.resultVideo,
                    flagged: evidence.flagged,
                    hidden: evidence.hidden,
                    priorityLevel: evidence.priorityLevel,
                })),
            };
        }
        // Check if it's an incident report
        const incident = await IncidentReport.findById(id).lean();
        if (incident) {
            if (!incident.flagged) {
                throw new Error("This incident report is not flagged");
            }
            const activeElectionIncident = await ActiveElection.findById(incident.election)
                .populate("election", "electionType electionName")
                .lean();
            if (!activeElectionIncident) {
                throw new Error("Election details not found for the incident.");
            }
            // Extract counter evidence IDs from actions
            const evidenceIds = incident.actions
                ?.filter((action) => action.evidenceId)
                .map((action) => action.evidenceId) || [];
            // Fetch counter evidence incidents
            const counterEvidence = await IncidentReport.find({
                _id: { $in: evidenceIds },
            }).lean();
            // Remove unnecessary fields
            const { actions, agreed, ...filteredIncident } = incident;
            const flaggedIncidentLabels = getPopulatedElectionLabels(activeElectionIncident);
            return {
                incident: {
                    electionDetails: {
                        election: flaggedIncidentLabels.type,
                        electionName: flaggedIncidentLabels.name,
                        startDate: activeElectionIncident?.startDate || null,
                        endDate: activeElectionIncident?.endDate || null,
                        mockElection: activeElectionIncident?.mockElection,
                        electionLocation: activeElectionIncident?.electionLocation,
                    },
                    ...filteredIncident,
                },
                counterEvidence: counterEvidence.map((evidence) => ({
                    id: evidence._id,
                    state: evidence.state,
                    lga: evidence.lga,
                    ward: evidence.ward,
                    pollingUnit: evidence.pollingUnit,
                    selectIncident: evidence.selectIncident,
                    incidentNote: evidence.incidentNote,
                    electionRating: evidence.electionRating,
                    incidentPictures: evidence.incidentPictures,
                    incidentVideos: evidence.incidentVideos,
                    flagged: evidence.flagged,
                    hidden: evidence.hidden,
                    priorityLevel: evidence.priorityLevel,
                })),
            };
        }
        throw new Error("No result or incident found with the given ID");
    }
    catch (error) {
        throw new Error(`Error fetching flagged result/incident: ${errMsg(error)}`);
    }
};
// Helper function to fetch updated flagged results
const fetchUpdatedFlaggedResults = async () => {
    const activeElections = await ActiveElection.find()
        .populate("election", "electionType electionName")
        .lean();
    if (!activeElections || activeElections.length === 0) {
        throw new Error("No election found");
    }
    const allResults = [];
    for (const election of activeElections) {
        const { type: electionTypeLabel, name: electionNameLabel } = getPopulatedElectionLabels(election);
        const electionResults = await ElectionData.find({
            election: election._id,
            flagged: true,
        })
            .populate("user", "firstName lastName email role")
            .lean();
        const electionIncidents = await IncidentReport.find({
            election: election._id,
            flagged: true,
        })
            .populate("user", "firstName lastName email role")
            .lean();
        // Consolidate flagged results
        for (const result of electionResults) {
            const resultUser = userSummaryFromLean(result.user);
            allResults.push({
                id: result._id,
                firstName: resultUser?.firstName || "N/A",
                lastName: resultUser?.lastName || "N/A",
                email: resultUser?.email || "N/A",
                role: resultUser?.role || "N/A",
                election: electionTypeLabel === "N/A" ? "Unknown" : electionTypeLabel,
                electionName: electionNameLabel === "N/A" ? "Unknown" : electionNameLabel,
                state: result.state,
                lga: result.lga,
                pollingUnit: result.pollingUnit,
                flagged: result.flagged,
                priorityLevel: result.priorityLevel,
                pictures: Array.isArray(result.resultPicture)
                    ? result.resultPicture
                    : result.resultPicture
                        ? [result.resultPicture]
                        : [],
                videos: Array.isArray(result.resultVideo)
                    ? result.resultVideo
                    : result.resultVideo
                        ? [result.resultVideo]
                        : [],
                createdAt: result.createdAt,
                resultUploaded: "Election Result",
            });
        }
        // Consolidate flagged incidents
        for (const incident of electionIncidents) {
            const incidentUser = userSummaryFromLean(incident.user);
            allResults.push({
                id: incident._id,
                firstName: incidentUser?.firstName || "N/A",
                lastName: incidentUser?.lastName || "N/A",
                email: incidentUser?.email || "N/A",
                role: incidentUser?.role || "N/A",
                election: electionTypeLabel === "N/A" ? "Unknown" : electionTypeLabel,
                electionName: electionNameLabel === "N/A" ? "Unknown" : electionNameLabel,
                state: incident.state,
                lga: incident.lga,
                pollingUnit: incident.pollingUnit,
                flagged: incident.flagged,
                hidden: incident.hidden,
                priorityLevel: incident.priorityLevel,
                pictures: Array.isArray(incident.incidentPictures)
                    ? incident.incidentPictures
                    : incident.incidentPictures
                        ? [incident.incidentPictures]
                        : [],
                videos: Array.isArray(incident.incidentVideos)
                    ? incident.incidentVideos
                    : incident.incidentVideos
                        ? [incident.incidentVideos]
                        : [],
                createdAt: incident.createdAt,
                resultUploaded: "Incident Report",
            });
        }
    }
    return allResults;
};
export const adminNotificationService = async (userId) => {
    try {
        const notifications = await Notification.find({
            $and: [
                { deletedBy: { $ne: userId } },
                {
                    $or: [
                        { recipients: { $exists: false } },
                        { recipients: { $in: ["admin", "super-admin"] } },
                    ],
                },
            ],
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
            .select("-deletedBy");
        const notification = notifications.map((notificationReadStatus) => {
            const read = notificationReadStatus.readBy
                ? notificationReadStatus.readBy.some((readerId) => readerId.toString() === userId.toString())
                : false;
            const { readBy, ...notificationWithoutReadBy } = notificationReadStatus;
            return { ...notificationWithoutReadBy, read };
        });
        return notification;
    }
    catch (error) {
        console.error("Error fetching admin notifications:", error);
        throw new Error("Failed to fetch admin notifications");
    }
};
export const markNotificationAsReadService = async (notificationId, userId) => {
    const notification = await Notification.findById(notificationId);
    if (!notification)
        throw new Error("NotificationId not found");
    const alreadyRead = notification.readBy.some((readerId) => readerId.toString() === userId.toString());
    if (!alreadyRead) {
        notification.readBy.push(toObjectId(userId));
        await notification.save();
    }
    return { message: "Notification marked as read" };
};
export const deleteNotificationForUserService = async (notificationId, userId) => {
    const notification = await Notification.findById(notificationId);
    if (!notification)
        throw new Error("Notification not found");
    const userOid = toObjectId(userId);
    // If already deleted by user, no action
    if (notification.deletedBy.some((id) => id.equals(userOid))) {
        throw new Error("Notification already removed from your inbox.");
    }
    notification.deletedBy.push(userOid);
    await notification.save();
    return { message: "Notification removed for user only." };
};
//# sourceMappingURL=adminElectionService.js.map