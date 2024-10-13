import { getLiveElectionService } from "../../services/Election/electionLive.js";


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