import moment from "moment";
import CompletedUser from "../../models/CompletedUser.js";
import ElectionData from "../../models/Election/ElectionData.js"
import DailyTraffic from "../../models/DailyTraffic/dailyTraffic.js";
import MontlyActiveUsers from "../../models/ActiveMontlyUsers/activeMontlyUsers.js";
import Election from "../../models/Election/Election.js";
import IncidentReport from "../../models/Election/IncidentReport.js";


export const getDashboardDataService = async () => {
    try {
        const [
          totalRegisteresUSers,
          totalObserverUsers,
          totalActiveUsers,
          totalResultsUploaded,
          dailyTraffic,
        ] = await Promise.all([
          CompletedUser.countDocuments(),
          CompletedUser.countDocuments({ role: "observer" }),
          MontlyActiveUsers.find(),
          ElectionData.countDocuments(),
          DailyTraffic.find(),

        ]);

        // Get user info
        const maleCount = await CompletedUser.countDocuments({gender: 'male'});
        const femaleCount= await CompletedUser.countDocuments({gender: 'female'});
        const observerCount = await CompletedUser.countDocuments({role: 'observer'});
        const volunteerCount = await CompletedUser.countDocuments({role: 'volunteer'});
        
        const userInfo = {
            gender:{
                male: maleCount,
                female: femaleCount,
            },
            role:{
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
    } catch (error) {
        console.error("Error fetching dashboard data", error);
        throw new Error("Failed to fetch dashboard data");
    }
}

export const getAllAdminService = async () =>{
    return await CompletedUser.find({role: 'admin'}).select('firstName lastName email image');
}

export const getAllResultService = async () => {
  try {
    const elections = await Election.find().lean();
    if (!elections || elections.length === 0) {
      throw new Error("No election found");
    }

    const allResults = [];

    for (const election of elections) {
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
        if (result.user) {
          // Filter out null users
          allResults.push({
            id: result._id,
            firstName: result.user.firstName || "N/A",
            lastName: result.user.lastName || "N/A",
            email: result.user.email || "N/A",
            role: result.user.role || "N/A",
            election: election.electionType,
            state: result.state,
            lga: result.lga,
            pictures: result.resultPicture
              ? Array.isArray(result.resultPicture)
                ? result.resultPicture
                : [result.resultPicture] // Wrap object in array
              : [],
            videos: result.resultVideo
              ? Array.isArray(result.resultVideo)
                ? result.resultVideo
                : [result.resultVideo] // Wrap object in array
              : [],
            createdAt: result.createdAt,
            resultUploaded: "Election Result",
          });
        } else {
          console.warn(`Result without user reference: ${result._id}`);
        }
      }

      // Consolidate incidents
      for (const incident of electionIncidents) {
        if (incident.user) {
          // Filter out null users
          allResults.push({
            id: incident._id,
            firstName: incident.user.firstName || "N/A",
            lastName: incident.user.lastName || "N/A",
            email: incident.user.email || "N/A",
            role: incident.user.role || "N/A",
            election: election.electionType,
            state: incident.state,
            lga: incident.lga,
            pictures: incident.incidentPictures,
            videos: incident.incidentVideos,
            createdAt: incident.createdAt,
            resultUploaded: "Incident Report",
          });
        } else {
          console.warn(`Incident without user reference: ${incident._id}`);
        }
      }
    }

    return allResults;
  } catch (error) {
    console.error(`Error fetching results and incidents: ${error.message}`);
    throw new Error(`Error fetching results and incidents: ${error.message}`);
  }
};


// Fetch individual results or incident

export const getResultOrIncidentByIdService = async (id) => {
    try {
      const result = await ElectionData.findById(id).lean();
      if (result) {
        const election = await Election.findById(result.election).lean();
        if (!election) {
          throw new Error("Election details not found for the result");
        }

        const { flagged, actions, agreed, ...filterdResult } = result;

        return {
          result: {
            electionDetails: {
              electionType: election.electionType,
              electionName: election.electionName,
              startDate: election.startDate,
              endDate: election.endDate,
            },
            ...filterdResult,
          },
        };
      }

      // Find the incident by ID
      const incident = await IncidentReport.findById(id).lean();
      if (incident) {
        // Fetch the associated election details
        const election = await Election.findById(incident.election).lean();
        if (!election) {
          throw new Error("Election details not found for the incident.");
        }

        // Exclude flagged, actions, and agreed fields
        const { flagged, actions, agreed, ...filteredIncident } = incident;

        // Attach election details
        return {
          incident: {
            electionDetails: {
              electionType: election.electionType,
              electionName: election.electionName,
              startDate: election.startDate,
              endDate: election.endDate,
            },
            ...filteredIncident,
          },
        };
      }

      throw new Error("No result or incident found with the given id");
    } catch (error) {
        throw new Error('Error fetching results and incidents: ${error.message}')
    }
};

// Delete result or incident
export const deleteResultOrIncidentService = async (id) => {

    try {
        const result = await ElectionData.findByIdAndDelete(id);
        if(result) return "Result deleted successfully";

        const incident = await IncidentReport.findByIdAndDelete(id);
        if(incident) return "Incident deleted successfully";

        throw new Error('No result or incident found with the given id');
    } catch (error) {
        throw new Error('Error deleting result and incident: ${error.message}');
    }
};


export const getFlaggedResultsService = async () => {

try {
  const flaggedResults = await ElectionData.find({ flagged: true }).lean();
  const flaggedIncidents = await IncidentReport.find({ flagged: true }).lean();

  return { flaggedResults, flaggedIncidents };
} catch (error) {
  throw new Error(`Error fetching flagged results: ${error.message}`);
}

}

export const deleteFlaggedResults = async (id) => {
  try {
    // Check if the result or incident is flagged before deleting
    const result = await ElectionData.findOne({ _id: id, flagged: true });
    const incident = await IncidentReport.findOne({ _id: id, flagged: true });

    if (!result && !incident) {
      throw new Error("No flagged result found for deletion");
    }

    if (result) {
      await ElectionData.findByIdAndDelete(id);
    }

    if (incident) {
      await IncidentReport.findByIdAndDelete(id);
    }

      const flaggedResults = await ElectionData.find({ flagged: true }).lean();
   const flaggedIncidents = await IncidentReport.find({ flagged: true }).lean();


    return {
      message: "Flagged result deleted successfully",
      flaggedResults,
      flaggedIncidents,
    };
  } catch (error) {
    throw new Error(`Error deleting flagged result: ${error.message}`);
  }
};


export const restoreFlaggedResult = async (id) => {
  try {

    let updated = false
    const result = await ElectionData.findById(id);
    if(result){
      result.hidden = false;
      result.flagged = false;
      result.actions = [];
      result.priorityLevel = 0;
      await result.save();
      updated = true;
    }

    const incident = await IncidentReport.findById(id);

    if(incident) {
      incident.hidden = false;
      incident.flagged = false;
      incident.actions = [];
      incident.priorityLevel = 0;
      await incident.save()
      updated = true;
    }

     if (!updated) {
       throw new Error("No flagged result or incident found.");
     }

   const flaggedResults = await ElectionData.find({ flagged: true }).lean();
   const flaggedIncidents = await IncidentReport.find({ flagged: true }).lean();

   return {
     message: "Result restored successfully",
     flaggedResults,
     flaggedIncidents,
   };
  } catch (error) {
    throw new Error(`Error restoring flagged result: ${error.message}`);
  }
}


export const getSingleFlaggedElectionService = async (electionId) => {
  try {
    let flaggedData = await ElectionData.findById(electionId)
      .populate("election", "electionType electionName startDate endDate")
      .populate("user", "firstName lastName email")
      .lean();

    let dataType = "election"; // Default to election result

    // If no flagged election is found, check if it's an incident report
    if (!flaggedData || !flaggedData.flagged) {
      flaggedData = await IncidentReport.findById(electionId)
        .populate("election", "electionType electionName startDate endDate")
        .populate("user", "firstName lastName email")
        .lean();
      dataType = "incident"; // Change type to incident report
    }

    if (!flaggedData || !flaggedData.flagged) {
      throw new Error("Flagged election result or incident report not found.");
    }

    // Extract counter evidence IDs from actions
    const evidenceIds = flaggedData.actions
      .filter((action) => action.evidenceId) 
      .map((action) => action.evidenceId); 

    // Fetch counter evidence results
    const counterEvidenceResults = await ElectionData.find({
      _id: { $in: evidenceIds },
    })
      .populate("user", "firstName lastName email")
      .lean();

    return {
      dataType, // election or incident
      electionDetails: {
        electionId: flaggedData._id,
        electionType: flaggedData.election.electionType,
        electionName: flaggedData.election.electionName,
        startDate: flaggedData.election.startDate,
        endDate: flaggedData.election.endDate,
      },
      result: {
        electionId: flaggedData._id,
        pollingUnit: flaggedData.pollingUnit,
        state: flaggedData.state,
        lga: flaggedData.lga,
        ward: flaggedData.ward,
        user: {
          firstName: flaggedData.user.firstName,
          lastName: flaggedData.user.lastName,
          email: flaggedData.user.email,
        },
        resultPicture: flaggedData.resultPicture,
        resultVideo: flaggedData.resultVideo,
        partiesVotes: flaggedData.partiesVotes,
        voteRating: flaggedData.voteRating,
        voterIntimidation: flaggedData.voterIntimidation,
        voteBuying: flaggedData.voteBuying,
        actions: flaggedData.actions,
        flagged: flaggedData.flagged,
        hidden: flaggedData.hidden,
        priorityLevel: flaggedData.priorityLevel, // Use existing priorityLevel
      },
      counterEvidence: counterEvidenceResults.map((evidence) => ({
        evidenceId: evidence._id,
        user: {
          firstName: evidence.user.firstName,
          lastName: evidence.user.lastName,
          email: evidence.user.email,
        },
        resultPicture: evidence.resultPicture,
        resultVideo: evidence.resultVideo,
        partiesVotes: evidence.partiesVotes,
        voteRating: evidence.voteRating,
        voterIntimidation: evidence.voterIntimidation,
        voteBuying: evidence.voteBuying,
      })),
    };
  } catch (error) {
    throw new Error(`Error fetching flagged data: ${error.message}`);
  }
};
