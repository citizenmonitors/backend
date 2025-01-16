import moment from "moment";
import CompletedUser from "../../models/CompletedUser.js";
import ElectionData from "../../models/Election/ElectionData.js";
import  Traffic  from "../../models/DailyTraffic/dailyTraffic.js";
import  ActiveUser  from "../../models/ActiveMontlyUsers/activeMontlyUsers.js";
import Election from "../../models/Election/Election.js";


export const getDashboardData = async () => {
  const today = moment().startOf("day");
  const lastMonthStart = moment().subtract(1, "month").startOf("month");
  const lastMonthEnd = moment().subtract(1, "month").endOf("month");

  // Registered Users
  const registeredUsersCount = await CompletedUser.countDocuments();
  const lastMonthRegisteredUsers = await CompletedUser.countDocuments({
    createdAt: { $gte: lastMonthStart.toDate(), $lte: lastMonthEnd.toDate() },
  });
  const thisMonthRegisteredUsers = await CompletedUser.countDocuments({
    createdAt: { $gte: moment().startOf("month").toDate() },
  });
const registeredUsersComparison = lastMonthRegisteredUsers
  ? Math.round(
      ((thisMonthRegisteredUsers - lastMonthRegisteredUsers) /
        lastMonthRegisteredUsers) *
        100
    ) + "%"
  : "0%";
  const registeredUsersData = await getDailyStats(CompletedUser, "createdAt");

  // Observers
  const observersCount = await CompletedUser.countDocuments({
    role: "observer",
  });
  const lastMonthObservers = await CompletedUser.countDocuments({
    role: "observer",
    createdAt: { $gte: lastMonthStart.toDate(), $lte: lastMonthEnd.toDate() },
  });
const observersComparison = lastMonthObservers
  ? Math.round(
      ((observersCount - lastMonthObservers) / lastMonthObservers) * 100
    ) + "%"
  : "0%";
  const observersData = await getDailyStats(CompletedUser, "createdAt", {
    role: "observer",
  });

  // Active Users
  const currentMonthKey = moment().format("YYYY-MM");
  const lastMonthKey = moment().subtract(1, "month").format("YYYY-MM");

  const currentMonthActiveUsers = await ActiveUser.findOne({
    month: currentMonthKey,
  });
  const lastMonthActiveUsers = await ActiveUser.findOne({
    month: lastMonthKey,
  });

  const activeUsersCount = currentMonthActiveUsers?.users.length || 0;
  const lastMonthActiveCount = lastMonthActiveUsers?.users.length || 0;

const activeUsersComparison = lastMonthActiveCount
  ? Math.round(
      ((activeUsersCount - lastMonthActiveCount) / lastMonthActiveCount) * 100
    ) + "%"
  : "0%";

  const activeUsersData = await getTrafficStats();

  // Results Uploaded
  const resultsUploadedCount = await ElectionData.countDocuments();
  const resultsLastMonth = await ElectionData.countDocuments({
    createdAt: { $gte: lastMonthStart.toDate(), $lte: lastMonthEnd.toDate() },
  });
const resultsComparison = resultsLastMonth
  ? Math.round(
      ((resultsUploadedCount - resultsLastMonth) / resultsLastMonth) * 100
    ) + "%"
  : "0%";

  const resultsData = await getDailyStats(ElectionData, "createdAt");

  // User Info
  const genderBreakdown = await CompletedUser.aggregate([
    { $match: { gender: { $exists: true } } }, 
    { $group: { _id: "$gender", count: { $sum: 1 } } },
    { $project: { name: "$_id", count: 1, _id: 0 } },
  ]);
  const rolesBreakdown = await CompletedUser.aggregate([
    { $match: { role: { $in: ["observer", "volunteer"] } } },
    { $group: { _id: "$role", count: { $sum: 1 } } },
    { $project: { name: "$_id", count: 1, _id: 0 } },
  ]);

  // Admins
  const admins = await CompletedUser.find({ role: "admin" })
    .sort({ createdAt: -1 }) 
    .limit(10)
    .select("email firstName lastName profileImage");

  // Daily Traffic
  const dailyTrafficToday = await Traffic.findOne({ date: today.toDate() });
  const dailyTrafficLastMonth = await Traffic.find({
    date: { $gte: lastMonthStart.toDate(), $lte: lastMonthEnd.toDate() },
  });

  const dailyTrafficCount = dailyTrafficToday?.visitCount || 0;
const dailyTrafficComparison = dailyTrafficLastMonth?.length
  ? Math.round(
      ((dailyTrafficCount - dailyTrafficLastMonth.length) /
        dailyTrafficLastMonth.length) *
        100
    ) + "%"
  : "0%";

  const dailyTrafficData = await getTrafficStats();

  // Final Response
  return {
    registeredUsers: {
      count: registeredUsersCount,
      lastMonthComparison: registeredUsersComparison,
      data: registeredUsersData,
    },
    observers: {
      count: observersCount,
      lastMonthComparison: observersComparison,
      data: observersData,
    },
    activeUsers: {
      count: activeUsersCount,
      lastMonthComparison: activeUsersComparison,
      data: activeUsersData,
    },
    resultsUploaded: {
      count: resultsUploadedCount,
      lastMonthComparison: resultsComparison,
      data: resultsData,
    },
    userInfo: {
      gender: genderBreakdown,
      roles: rolesBreakdown,
    },
    admins,
    dailyTraffic: {
      count: dailyTrafficCount,
      lastMonthComparison: dailyTrafficComparison,
      data: dailyTrafficData,
    },
  };
};

// Get all users

export const getAllUsersService = async () => {
  try {
    const lastMonthStart = moment().subtract(1, "month").startOf("month");
    const lastMonthEnd = moment().subtract(1, "month").endOf("month");

    // Fetch all user details

    const users = await CompletedUser.find().select("_id firstName lastName email state role gender createdAt").lean();

    // Total number of registered users

    const registeredUsersCount = await CompletedUser.countDocuments();
    const lastMonthRegisteredUsers = await CompletedUser.countDocuments({
      createdAt: { $gte : lastMonthStart.toDate(), $lte : lastMonthEnd.toDate() },
     })
    const thisMonthRegisteredUsers = await CompletedUser.countDocuments({
      createdAt: { $gte : moment().startOf("month").toDate()},
    });

    const registeredUsersComparison = lastMonthRegisteredUsers ? Math.round(
      ((thisMonthRegisteredUsers - lastMonthRegisteredUsers) / lastMonthRegisteredUsers) * 100
    ) + "%" : "0%";
    const registeredUsersData = await getDailyStats(CompletedUser, "createdAt");

    // Total number of observers
    const observersCount = await CompletedUser.countDocuments({
      role: "observer",
    });
     const lastMonthObservers = await CompletedUser.countDocuments({
       role: "observer",
       createdAt: {
         $gte: lastMonthStart.toDate(),
         $lte: lastMonthEnd.toDate(),
       },
     });
     const observersComparison = lastMonthObservers
       ? Math.round(
           ((observersCount - lastMonthObservers) / lastMonthObservers) * 100
         ) + "%"
       : "0%";
         const observersData = await getDailyStats(CompletedUser, "createdAt", {
           role: "observer",
         });

    //  Total number of volunteers
    const volunteersCount = await CompletedUser.countDocuments({
      role: "volunteer",
    });

     const lastMonthVolunteers = await CompletedUser.countDocuments({
       role: "volunteer",
       createdAt: {
         $gte: lastMonthStart.toDate(),
         $lte: lastMonthEnd.toDate(),
       },
     });
     const volunteersComparison = lastMonthVolunteers
       ? Math.round(
           ((volunteersCount - lastMonthVolunteers) / lastMonthVolunteers) * 100
         ) + "%"
       : "0%";
         const volunteersData = await getDailyStats(CompletedUser, "createdAt", {
           role: "volunteer",
         });

    // Total number of observers awaiting verification
    const observersAwaitingVerification = await CompletedUser.countDocuments({
      role: "observer",
      pendingObserverVerification: true,
    });

     const lastMonthAwaitingVerification = await CompletedUser.countDocuments({
       role: "observer",
       pendingObserverVerification: true,
       createdAt: {
         $gte: lastMonthStart.toDate(),
         $lte: lastMonthEnd.toDate(),
       },
     });
     const awaitingVerificationComparison = lastMonthAwaitingVerification
       ? Math.round(
           ((observersAwaitingVerification - lastMonthAwaitingVerification) /
             lastMonthAwaitingVerification) *
             100
         ) + "%"
       : "0%";
          const observersAwaitingVerificationData = await getDailyStats(
            CompletedUser,
            "createdAt",
            {
              role: "observer",
              pendingObserverVerification: true,
            }
          );

    // Gender breakdown
    const genderBreakdown = await CompletedUser.aggregate([
      { $group: { _id: "$gender", count: {$sum: 1}}},
      { $project: { name: "$_id", count: 1, _id: 0}},
    ]);

    // Role breakdown
    const rolesBreakdown = await CompletedUser.aggregate([
      { $group: { _id: "$role", count: {$sum: 1}}},
      { $project: { name: "$_id", count: 1, _id: 0}},
    ]);

    // Response

    return {
      registeredUsers: {
        count: registeredUsersCount,
        lastMonthComparison: registeredUsersComparison,
        data: registeredUsersData,
      },
      observers: {
        count: observersCount,
        lastMonthComparison: observersComparison,
        data: observersData,
      },
      volunteers: {
        count: volunteersCount,
        lastMonthComparison: volunteersComparison,
        data: volunteersData,
      },
      awaitingVerification: {
        count: observersAwaitingVerification,
        lastMonthComparison: awaitingVerificationComparison,
        data: observersAwaitingVerificationData,
      },
      userInfo: {
        gender: genderBreakdown,
        roles: rolesBreakdown,
      },
      users,
    };
    
  } catch (error) {
    throw new Error(`Error fetching users and stats: ${error.message}`);
  }
};

// Fetch single user info
export const getUserByIdService = async (id) =>{
  try {
    const user = await CompletedUser.findById(id).lean();
    if(!user){
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }
};

// Delete single user
export const deleteUserService = async (id) =>{
  try {
    const user = await CompletedUser.findByIdAndDelete(id);
    if(!user){
      throw new Error("User not found or already deleted")
    }
    return {message: "User deleted successfully"};
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
};

export const approveObserverService = async (id) => {
  try {
    // Find the user by ID
    const user = await CompletedUser.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "observer") {
      throw new Error("User is not an observer");
    }

    // Approve the observer and update their details
    user.isObserverInPollingUnit = true;
    user.pendingObserverVerification = false;
    await user.save();

    // Find all users in the same polling unit
    const usersInPollingUnit = await CompletedUser.find({
      pollingUnit: user.pollingUnit,
      _id: { $ne: userId },
    });

    for (const otherUser of usersInPollingUnit) {
      if (otherUser.role === "observer") {
        // Downgrade other observers to volunteers
        otherUser.role = "volunteer";
        otherUser.isObserverInPollingUnit = false;
      }

      if (otherUser.role === "volunteer" && otherUser.pendingObserverVerification) {
        // Remove pending verification for volunteers
        otherUser.pendingObserverVerification = false;
      }

      await otherUser.save();
    }

    // Fetch all users after updates
    const allUsers = await CompletedUser.find().select(
      "_id firstName lastName email state role gender createdAt"
      );

    return {
      message: "Observer approved successfully",
      approvedObserver: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        pollingUnit: user.pollingUnit,
      },
      allUsers,
    };
  } catch (error) {
    throw new Error(`Error approving observer: ${error.message}`);
  }
};


// Helper Functions
const getDailyStats = async (model, dateField, match = {}) => {
  const startOfWeek = moment().subtract(6, "days").startOf("day");
  const stats = await model.aggregate([
    { $match: { ...match, [dateField]: { $gte: startOfWeek.toDate() } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return Array(7)
    .fill(0)
    .map((_, idx) => {
      const date = startOfWeek.clone().add(idx, "days").format("YYYY-MM-DD");
      const stat = stats.find((s) => s._id === date);
      return stat ? stat.count : 0;
    });
};

const getTrafficStats = async () => {
  const today = moment().startOf("day");
  const stats = await Traffic.find({
    date: { $gte: today.clone().subtract(6, "days").toDate() },
  }).sort({ date: 1 });

  return Array(7)
    .fill(0)
    .map((_, idx) => {
      const date = today.clone().subtract(idx, "days").format("YYYY-MM-DD");
      const stat = stats.find(
        (s) => moment(s.date).format("YYYY-MM-DD") === date 
      );
      return stat ? stat.visitCount : 0;
    });
};


export const getAllElectionsService = async () => {
  // Fetch all elections with their results and incident reports
  const elections = await Election.find()

  // Format and return elections, excluding `electionLocation` and unnecessary fields
  return elections.map((election) => {
    const {
      electionLocation,
      politicalParties,
      resultsCount,
      incidentReports,
      results,
      ...electionData
    } = election.toObject();


    return electionData;
  });
};


export const getAdminLiveElectionService = async (electionId) => {
  try {
    const election = await Election.findById(electionId).lean();
    if (!election) throw new Error("Election not found");

    const { electionName, electionType, startDate, endDate, electionLocation } =
      election;

    // Fetch live election results
    const electionResults = await ElectionData.find({
      election: electionId,
      userRole: "observer",
    }).lean();

    if (electionResults.length === 0) {
      return { message: "No live results available for this election." };
    }

    // Group results by location (state, lga, or ward based on election type)
    const locationResults = electionResults.reduce((acc, result) => {
      const locationKey =
        electionType === "national"
          ? result.state
          : electionType === "gubernatorial"
          ? result.state
          : result.lga;

      if (!acc[locationKey]) acc[locationKey] = [];
      acc[locationKey].push(result);
      return acc;
    }, {});

    // Handle national elections
    if (electionType === "national") {
      const stateArray = Object.keys(locationResults).map((state) => {
        const stateResults = locationResults[state];
        const { resultData, aggregateAnalysis } = aggregateResultsAndTopParties(
          stateResults,
          "state"
        );
        const footer = calculateFooter(stateResults, "state", electionLocation);

        return {
          state,
          chart: resultData,
          aggregateAnalysis,
          footer,
        };
      });

      return {
        electionDetails: {
          electionId,
          electionName,
          electionType,
          startDate,
          endDate,
        },
        result: stateArray,
      };
    }

    // Handle gubernatorial elections
    if (electionType === "gubernatorial") {
      const uniqueStates = Object.keys(locationResults);

      if (uniqueStates.length === 1) {
        // Single state with results
        const stateResults = locationResults[uniqueStates[0]];
        const { aggregateAnalysis } = aggregateResultsAndTopParties(
          stateResults,
          "lga"
        );

        const footer = calculateFooter(stateResults, "lga", electionLocation);

        return {
          electionDetails: {
            electionId,
            electionName,
            electionType,
            startDate,
            endDate,
          },
          result: {
            aggregateAnalysis,
            footer,
          },
        };
      }

      // Multiple states with results
      const stateArray = uniqueStates.map((state) => {
        const stateResults = locationResults[state];
        const { resultData, aggregateAnalysis } = aggregateResultsAndTopParties(
          stateResults,
          "lga"
        );
        const footer = calculateFooter(stateResults, "lga", electionLocation);

        return {
          state,
          chart: resultData,
          aggregateAnalysis,
          footer,
        };
      });

      return {
        electionDetails: {
          electionId,
          electionName,
          electionType,
          startDate,
          endDate,
        },
        result: stateArray,
      };
    }

    // Handle other elections (senatorial, house-of-representatives, etc.)
    const uniqueLGAs = Object.keys(locationResults);

    if (uniqueLGAs.length === 1) {
      // Single LGA with results
      const lgaResults = locationResults[uniqueLGAs[0]];
      const { resultData, aggregateAnalysis } = aggregateResultsAndTopParties(
        lgaResults,
        "ward"
      );

      const footer = calculateFooter(lgaResults, "ward", electionLocation);

      return {
        electionDetails: {
          electionId,
          electionName,
          electionType,
          startDate,
          endDate,
        },
        result: {
          chart: resultData,
          aggregateAnalysis,
          footer,
        },
      };
    }

    // Multiple LGAs with results
    const lgaArray = uniqueLGAs.map((lga) => {
      const lgaResults = locationResults[lga];
      const { resultData, aggregateAnalysis } = aggregateResultsAndTopParties(
        lgaResults,
        "ward"
      );
      const footer = calculateFooter(lgaResults, "ward", electionLocation);

      return {
        lga,
        chart: resultData,
        aggregateAnalysis,
        footer,
      };
    });

    return {
      electionDetails: {
        electionId,
        electionName,
        electionType,
        startDate,
        endDate,
      },
      result: lgaArray,
    };
  } catch (error) {
    throw new Error(
      `Error fetching admin live election data: ${error.message}`
    );
  }
};

// Helper: Aggregate Results and Top Parties
const aggregateResultsAndTopParties = (results, groupBy) => {
  const aggregated = {};
  const totalVotesByParty = {};

  results.forEach((result) => {
    const groupKey = result[groupBy]; // Either state, lga, or ward
    const { partiesVotes } = result;

    // Initialize group if not exists
    if (!aggregated[groupKey]) {
      aggregated[groupKey] = { partiesVotes: {} };
    }

    // Aggregate votes by party
    partiesVotes.forEach(({ party, count }) => {
      aggregated[groupKey].partiesVotes[party] =
        (aggregated[groupKey].partiesVotes[party] || 0) + count;

      // Update total aggregate analysis
      totalVotesByParty[party] = (totalVotesByParty[party] || 0) + count;
    });
  });

  return {
    resultData: getTopSevenParties(totalVotesByParty),
    aggregateAnalysis: totalVotesByParty,
  };
};

// Helper: Get Top 7 Parties
const getTopSevenParties = (partiesVotes) => {
  return Object.entries(partiesVotes)
    .sort(([, votesA], [, votesB]) => votesB - votesA) // Sort by descending votes
    .slice(0, 7) // Get top 7
    .map(([party, votes]) => ({ party, [party]: votes }));
};

// Helper: Calculate Footer
const calculateFooter = (data, groupBy, electionLocation) => {
  // Ensure electionLocation is an array, fallback to an empty array
  const registeredLocations = new Set(
    Array.isArray(electionLocation)
      ? electionLocation.map((loc) => loc.toUpperCase())
      : []
  );

  const submittedLocations = new Set(
    data.map((item) => (item[groupBy] || "").toUpperCase())
  );

  return {
    [`registered-${groupBy}s`]: registeredLocations.size,
    [`submitted-${groupBy}s`]: submittedLocations.size,
  };
};


