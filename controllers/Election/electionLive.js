import { getActivityBoardAndNotificationsService, getAllOngoingElectionResults, getLiveElectionService } from "../../services/Election/electionLive.js";


// Controller to handle fetching unified election details
export const getLiveElectionDetails = async (req, res) => {
  const { electionId } = req.params;
  const userId = req.user._id;

  try {
    // Call the service to fetch unified election details
    const electionDetails = await getLiveElectionService(electionId, userId);

    // Return the election details as response
    return res.status(200).json(electionDetails);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching election details",
      error: error.message,
    });
  }
};

// Controller to handle fetching all ongoing election results
export const getOngoingElections = async (req, res) => {
  const userId = req.user._id; 

  try {
    // Call the service to fetch the prioritized ongoing election result
    const electionResult = await getAllOngoingElectionResults(userId);

    // Check if there's no ongoing election result
    if (electionResult.message === "No ongoing election results") {
      return res.status(404).json({ message: "No ongoing election results" });
    }

    // Send the fetched election result back to the client
    return res.status(200).json(electionResult);
  } catch (error) {
    console.error("Error fetching ongoing election results:", error);

    // Send an error response in case of failure
    return res.status(500).json({
      message: "Error fetching ongoing election results",
      error: error.message,
    });
  }
};

// Unified Controller for fetching activity board and notifications
export const getActivityBoardAndNotifications = async (req, res) => {
  try {
    const data = await getActivityBoardAndNotificationsService();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching activity board and notifications",
      error: error.message,
    });
  }
};
