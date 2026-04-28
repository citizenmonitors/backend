import { getActivityBoardAndNotificationsService, getAllOngoingElectionResults, getLiveElectionService, } from "../../services/Election/electionLive.js";
import { asParamString, isValidObjectId } from "../../utils/validators.js";
/**
 * Unified live results for one election. **Authenticated only** — the route
 * mounts `authMiddleware` before this handler; the `userId` check is a safety net.
 */
export const getLiveElectionDetails = async (req, res) => {
    const electionId = asParamString(req.params.electionId);
    if (!electionId || !isValidObjectId(electionId)) {
        return res.status(400).json({ message: "Invalid election ID" });
    }
    const userId = req.user?._id;
    if (userId == null) {
        return res.status(401).json({ message: "Authentication required" });
    }
    try {
        // Call the service to fetch unified election details
        const electionDetails = await getLiveElectionService(electionId, userId);
        // Return the election details as response
        return res.status(200).json(electionDetails);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({
            message: "Error fetching election details",
            error: message,
        });
    }
};
// Controller to handle fetching all ongoing election results
export const getOngoingElections = async (req, res) => {
    const userId = req.user?._id;
    if (userId == null) {
        return res.status(401).json({ message: "Authentication required" });
    }
    try {
        // Call the service to fetch the prioritized ongoing election result
        const electionResult = await getAllOngoingElectionResults(String(userId));
        // Check if there's no ongoing election result
        if (electionResult.message === "No ongoing election results") {
            return res.status(404).json({ message: "No ongoing election results" });
        }
        // Send the fetched election result back to the client
        return res.status(200).json(electionResult);
    }
    catch (error) {
        console.error("Error fetching ongoing election results:", error);
        const message = error instanceof Error ? error.message : String(error);
        // Send an error response in case of failure
        return res.status(500).json({
            message: "Error fetching ongoing election results",
            error: message,
        });
    }
};
// Unified Controller for fetching activity board and notifications
export const getActivityBoardAndNotifications = async (_req, res) => {
    try {
        const data = await getActivityBoardAndNotificationsService();
        return res.status(200).json(data);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({
            message: "Error fetching activity board and notifications",
            error: message,
        });
    }
};
//# sourceMappingURL=electionLive.js.map