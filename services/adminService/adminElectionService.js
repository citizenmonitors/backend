import moment from "moment";
import CompletedUser from "../../models/CompletedUser.js";
import ElectionData from "../../models/Election/ElectionData.js"
import DailyTraffic from "../../models/DailyTraffic/dailyTraffic.js";
import MontlyActiveUsers from "../../models/ActiveMontlyUsers/activeMontlyUsers.js";
import Election from "../../models/Election/Election.js";
import IncidentReport from "../../models/Election/IncidentReport.js";
import ActiveElection from "../../models/Election/ActiveElection.js";
import AdminLog from "../../models/admin/AdminLog.js";
import Notification from "../../models/DailyTraffic/Notification.js";


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
    const activeElections = await ActiveElection.find()
      .populate("election", "electionType electionName")
      .lean();

    if (!activeElections || activeElections.length === 0) {
      throw new Error("No election found");
    }

    const allResults = [];

    for (const election of activeElections) {
      if (!election.election) {
        console.log(
          `Skipping election ${election._id} due to missing election details.`
        );
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
        if (result.user) {
          allResults.push({
            id: result._id,
            firstName: result.user.firstName || "N/A",
            lastName: result.user.lastName || "N/A",
            email: result.user.email || "N/A",
            role: result.user.role || "N/A",
            election: election.election?.electionType || "N/A",
            electionName: election.election?.electionName || "N/A",
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
        } else {
          console.warn(`Result without user reference: ${result._id}`);
        }
      }

      // Consolidate incidents
      for (const incident of electionIncidents) {
        if (incident.user) {
          allResults.push({
            id: incident._id,
            firstName: incident.user.firstName || "N/A",
            lastName: incident.user.lastName || "N/A",
            email: incident.user.email || "N/A",
            role: incident.user.role || "N/A",
            election: election.election?.electionType || "N/A",
            electionName: election.election?.electionName || "N/A",
            state: incident.state,
            lga: incident.lga,
            pictures: incident.incidentPictures || [],
            videos: incident.incidentVideos || [],
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

      return {
        result: {
          electionDetails: {
            election: activeElection?.election?.electionType || "N/A",
            electionName: activeElection?.election?.electionName || "N/A",
            startDate: activeElection?.startDate || null,
            endDate: activeElection?.endDate || null,
          },
          ...filteredResult,
        },
      };
    }


    // Find the incident by ID
    const incident = await IncidentReport.findById(id).lean();
    if (incident) {
      const activeElectionIncident = await ActiveElection.findById(
        incident.election
      )
        .populate("election", "electionType electionName")
        .lean();
      if (!activeElectionIncident) {
        throw new Error("Election details not found for the incident.");
      }

      const { flagged, actions, agreed, ...filteredIncident } = incident;

      return {
        incident: {
          electionDetails: {
            election:
              activeElectionIncident?.election?.electionType || "N/A",
            electionName:
              activeElectionIncident?.election?.electionName || "N/A",
            startDate: activeElectionIncident?.startDate || null,
            endDate: activeElectionIncident?.endDate || null,
          },
          ...filteredIncident,
        },
      };
    }

    throw new Error("No result or incident found with the given ID");
  } catch (error) {
    throw new Error(`Error fetching results and incidents: ${error.message}`);
  }
};


// Delete result or incident

export const deleteResultOrIncidentService = async (id, adminId) => {
  try {
    let deletedType = "";

    const result = await ElectionData.findByIdAndDelete(id);
    if (result) {
      deletedType = "Election Result";
    } else {
      const incident = await IncidentReport.findByIdAndDelete(id);
      if (incident) {
        deletedType = "Incident Report";
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
  } catch (error) {
    throw new Error(`Error deleting result or incident: ${error.message}`);
  }
};

export const getFlaggedResultsService = async () => {
  
   try {
  return await fetchUpdatedFlaggedResults();
   } catch (error) {
     console.error(`Error fetching results and incidents: ${error.message}`);
     throw new Error(`Error fetching results and incidents: ${error.message}`);
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
    }
    if (incident) {
      await IncidentReport.findByIdAndDelete(id);
      deletedType = "Flagged Incident Report";
    }

    const results = await fetchUpdatedFlaggedResults();


    // Log admin action
    await AdminLog.create({
      admin: adminId,
      action: `Deleted ${deletedType}`,
      timestamp: new Date(),
    });

    return { message: `${deletedType} deleted successfully`, results };
  } catch (error) {
    throw new Error(`Error deleting flagged result: ${error.message}`);
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
      result.actions = [];
      result.priorityLevel = 0;
      await result.save();
      updated = true;
      restoredType = "Election Result";
    }

    const incident = await IncidentReport.findById(id);
    if (incident) {
      incident.hidden = false;
      incident.flagged = false;
      incident.actions = [];
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
  } catch (error) {
    throw new Error(`Error restoring flagged result: ${error.message}`);
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

      const activeElectionResult = await ActiveElection.findById(
        result.election
      )
        .populate("election", "electionType electionName")
        .lean();
      if (!activeElectionResult) {
        throw new Error("Election details not found for the result");
      }

      // Extract counter evidence IDs from actions
      const evidenceIds =
        result.actions
          ?.filter((action) => action.evidenceId)
          .map((action) => action.evidenceId) || [];

      // Fetch counter evidence results
      const counterEvidence = await ElectionData.find({
        _id: { $in: evidenceIds },
      }).lean();

      // Remove unnecessary fields
      const { actions, agreed, ...filteredResult } = result;

      return {
        result: {
          electionDetails: {
            election: activeElectionResult?.election?.electionType || "N/A",
            electionName: activeElectionResult?.election?.electionName || "N/A",
            startDate: activeElectionResult?.startDate || null,
            endDate: activeElectionResult?.endDate || null,
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

      const activeElectionIncident = await ActiveElection.findById(
        incident.election
      )
        .populate("election", "electionType electionName")
        .lean();
      if (!activeElectionIncident) {
        throw new Error("Election details not found for the incident.");
      }

      // Extract counter evidence IDs from actions
      const evidenceIds =
        incident.actions
          ?.filter((action) => action.evidenceId)
          .map((action) => action.evidenceId) || [];

      // Fetch counter evidence incidents
      const counterEvidence = await IncidentReport.find({
        _id: { $in: evidenceIds },
      }).lean();

      // Remove unnecessary fields
      const { actions, agreed, ...filteredIncident } = incident;

      return {
        incident: {
          electionDetails: {
            election:
              activeElectionIncident?.election?.electionType || "N/A",
            electionName:
              activeElectionIncident?.election?.electionName || "N/A",
            startDate: activeElectionIncident?.startDate || null,
            endDate: activeElectionIncident?.endDate || null,
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
  } catch (error) {
    throw new Error(`Error fetching flagged result/incident: ${error.message}`);
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
      allResults.push({
        id: result._id,
        firstName: result.user?.firstName || "N/A",
        lastName: result.user?.lastName || "N/A",
        email: result.user?.email || "N/A",
        role: result.user?.role || "N/A",
        election: election.election?.electionType || "Unknown",
        electionName: election.election?.electionName || "Unknown",
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
      allResults.push({
        id: incident._id,
        firstName: incident.user?.firstName || "N/A",
        lastName: incident.user?.lastName || "N/A",
        email: incident.user?.email || "N/A",
        role: incident.user?.role || "N/A",
        election: election.election?.electionType || "Unknown",
        electionName: election.election?.electionName || "Unknown",
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




export const adminNotificationService = async (userId) =>{
  try {
       const notifications = await Notification.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

            const  notification= notifications.map((notificationReadStatus) => {
              const read = notificationReadStatus.readBy
                ? notificationReadStatus.readBy.some(
                    (readerId) => readerId.toString() === userId.toString()
                  )
                : false;
            
              const { readBy, ...notificationWithoutReadBy } = notificationReadStatus;
            
              return { ...notificationWithoutReadBy, read };
            });

    return notification;
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    throw new Error("Failed to fetch admin notifications");
  }
}

export const markNotificationAsReadService = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) throw new Error("NotificationId not found");

  const alreadyRead = notification.readBy.some(
    (readerId) => readerId.toString() === userId.toString()
  );

  if (!alreadyRead) {
    notification.readBy.push(userId);
    await notification.save();
  }

  return { message: "Notification marked as read" };
};
