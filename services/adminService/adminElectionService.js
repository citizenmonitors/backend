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
    const flaggedIncidents = await IncidentReport.find({
      flagged: true,
    }).lean();

    return {
      flaggedResults: formatMedia(flaggedResults, "result"),
      flaggedIncidents: formatMedia(flaggedIncidents, "incident"),
    };
  } catch (error) {
    throw new Error(`Error fetching flagged results: ${error.message}`);
  }
};

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
    const flaggedIncidents = await IncidentReport.find({
      flagged: true,
    }).lean();

    return {
      message: "Flagged result deleted successfully",
      flaggedResults: formatMedia(flaggedResults, "result"),
      flaggedIncidents: formatMedia(flaggedIncidents, "incident"),
    };
  } catch (error) {
    throw new Error(`Error deleting flagged result: ${error.message}`);
  }
};

export const restoreFlaggedResult = async (id) => {
  try {
    let updated = false;

    const result = await ElectionData.findById(id);
    if (result) {
      result.hidden = false;
      result.flagged = false;
      result.actions = [];
      result.priorityLevel = 0;
      await result.save();
      updated = true;
    }

    const incident = await IncidentReport.findById(id);
    if (incident) {
      incident.hidden = false;
      incident.flagged = false;
      incident.actions = [];
      incident.priorityLevel = 0;
      await incident.save();
      updated = true;
    }

    if (!updated) {
      throw new Error("No flagged result or incident found.");
    }

    const flaggedResults = await ElectionData.find({ flagged: true }).lean();
    const flaggedIncidents = await IncidentReport.find({
      flagged: true,
    }).lean();

    return {
      message: "Result restored successfully",
      flaggedResults: formatMedia(flaggedResults, "result"),
      flaggedIncidents: formatMedia(flaggedIncidents, "incident"),
    };
  } catch (error) {
    throw new Error(`Error restoring flagged result: ${error.message}`);
  }
};

// Helper function to format media (pictures & videos)
const formatMedia = (data, type) => {
  return data.map((item) => ({
    ...item,
    resultPicture:
      type === "result" && item.resultPicture ? [item.resultPicture] : [],
    resultVideo: type === "result" && item.resultVideo ? item.resultVideo : {},
    incidentPictures:
      type === "incident" && item.incidentPictures.length > 0
        ? item.incidentPictures
        : [],
    incidentVideos:
      type === "incident" && item.incidentVideos.length > 0
        ? item.incidentVideos[0]
        : {}, // Convert to object if only one
  }));
};



export const getSingleFlaggedElectionService = async (electionId) => {
  try {
    let flaggedData = await ElectionData.findById(electionId)
      .populate("election", "electionType electionName startDate endDate")
      .lean();

    let dataType = "result";

    // If no flagged election is found, check if it's an incident report
    if (!flaggedData || !flaggedData.flagged) {
      flaggedData = await IncidentReport.findById(electionId)
        .populate("election", "electionType electionName startDate endDate")
        .lean();
      dataType = "incident";
    }

    if (!flaggedData || !flaggedData.flagged) {
      throw new Error("Flagged election result or incident report not found.");
    }

    // Extract counter evidence IDs from actions
    const evidenceIds = flaggedData.actions
      .filter((action) => action.evidenceId)
      .map((action) => action.evidenceId);

    // Fetch counter evidence results or incidents
    const counterEvidence =
      dataType === "result"
        ? await ElectionData.find({ _id: { $in: evidenceIds } }).lean()
        : await IncidentReport.find({ _id: { $in: evidenceIds } }).lean();

    // Function to filter out empty fields and irrelevant data
    const filterFields = (data, isElection) => {
      let filteredData = {
        electionId: data._id,
        electionType: data.election.electionType,
        electionName: data.election.electionName,
        startDate: data.election.startDate,
        endDate: data.election.endDate,
        state: data.state,
        lga: data.lga,
        ward: data.ward,
        pollingUnit: data.pollingUnit,
        flagged: data.flagged,
        hidden: data.hidden,
        priorityLevel: data.priorityLevel,
      };

      if (isElection) {
        filteredData = {
          ...filteredData,
          partiesVotes: data.partiesVotes,
          accreditedVoters: data.accreditedVoters,
          rejectedPapers: data.rejectedPapers,
          spoiledBallotPapers: data.spoiledBallotPapers,
          usedBallotPapers: data.usedBallotPapers,
          resultPicture: data.resultPicture ? [data.resultPicture] : [],
          resultVideo: data.resultVideo || {},
        };
      } else {
        filteredData = {
          ...filteredData,
          selectIncident: data.selectIncident,
          incidentNote: data.incidentNote,
          electionRating: data.electionRating,
          incidentPictures:
            data.incidentPictures && data.incidentPictures.length > 0
              ? data.incidentPictures
              : [],
          incidentVideos:
            data.incidentVideos && data.incidentVideos.length > 1
              ? data.incidentVideos 
              : data.incidentVideos.length === 1
              ? data.incidentVideos[0] 
              : {},
        };
      }

      // Remove undefined fields
      return Object.fromEntries(
        Object.entries(filteredData).filter(([_, v]) => v !== undefined)
      );
    };

    return {
      result: {
        [dataType]: filterFields(flaggedData, dataType === "result"),
        counterEvidence: counterEvidence.map((evidence) =>
          filterFields(evidence, dataType === "result")
        ),
      },
    };
  } catch (error) {
    throw new Error(`Error fetching flagged data: ${error.message}`);
  }
};


