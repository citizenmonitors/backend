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
            picture: result.resultPicture,
            video: result.resultVideo,
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








