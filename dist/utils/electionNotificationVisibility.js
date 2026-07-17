import ActiveElection from "../models/Election/ActiveElection.js";
export const ELECTION_UPDATE_NOTIFICATION_TYPES = [
    "election-day-alert",
    "result-aggregated",
    "result-upload",
    "incident-upload",
    "report-confirmed",
    "report-flagged",
    "security-alert",
];
export const isActiveElectionConcluded = (endDate) => {
    if (!endDate)
        return false;
    return new Date(endDate).getTime() < Date.now();
};
export const isActiveElectionConcludedById = async (activeElectionId) => {
    if (!activeElectionId)
        return false;
    const row = await ActiveElection.findById(activeElectionId).select("endDate").lean();
    return isActiveElectionConcluded(row?.endDate);
};
/** Hide election-update notifications once their active election has ended. */
export const buildHideConcludedElectionNotificationsFilter = async () => {
    const concludedIds = await ActiveElection.find({
        endDate: { $lt: new Date() },
    }).distinct("_id");
    return {
        $or: [
            { type: { $nin: [...ELECTION_UPDATE_NOTIFICATION_TYPES] } },
            { activeElectionId: { $exists: false } },
            { activeElectionId: null },
            { activeElectionId: { $nin: concludedIds } },
        ],
    };
};
//# sourceMappingURL=electionNotificationVisibility.js.map