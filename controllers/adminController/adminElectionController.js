import * as AdminDashServices from "../../services/adminService/adminDashboard.js";
import * as AdminService from "../../services/adminService/adminElectionService.js";


export const getDashboardDataController = async (req, res) => {
    try {
        const dashboardData = await AdminService.getDashboardDataService();
        res.status(200).json(dashboardData)
    } catch (error) {
        res.status(505),json({error: error.message})
    }
}

export const getAllAdminController = async (req, res) => {
    try {
        const admins = await AdminService.getAllAdminService();
        res.status(200).json(admins);
    } catch (error) {
        res
          .status(500)
          .json({ message: "Error fetching admins", error: error.message });
    }
}


export const getAllElections = async (req, res) => {
  try {
    const elections = await AdminDashServices.getAllActiveElectionsService();

    res.status(200).json({ elections });
  } catch (error) {
    console.error("Error fetching elections:", error);
    res
      .status(500)
      .json({ message: "Error fetching elections", error: error.message });
  }
};

export const getAllElectionTypes = async (req, res) => {
  try {
    const elections = await AdminDashServices.getAllElectionTypesService();

    res.status(200).json({ elections });
  } catch (error) {
    console.error("Error fetching elections:", error);
    res
      .status(500)
      .json({ message: "Error fetching elections", error: error.message });
  }
};

export const getAdminLiveElectionController = async (req, res) => {
  try {
    const { electionId } = req.params;
    if (!electionId) {
      return res.status(400).json({ message: "Election ID is required." });
    }

    const result = await AdminDashServices.getAdminLiveElectionService(electionId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching admin live election data:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Fetch all results and incidents
export const getAllElectionAndIncidentController = async (req, res) =>{
  try {
    
    const results = await AdminService.getAllResultService();
    res.status(200).json({results});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export const getResultOrIncidentByController = async (req, res) => {
  try {
    const { id } = req.params;
    const resultOrIncident = await AdminService.getResultOrIncidentByIdService(id);
    res.status(200).json({result: resultOrIncident});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// Delete result or incident
export const deletedResultOrIncidentController = async (req, res) => {
 try {
   const { id } = req.params;
   const adminId = req.user._id;

   const result = await AdminService.deleteResultOrIncidentService(id, adminId);
   res.status(200).json(result);
 } catch (error) {
   res
     .status(500)
     .json({
       message: "Error deleting result or incident",
       error: error.message,
     });
 }
}

export const getAllUsersController = async (req, res) => {
  try {
    const results = await AdminDashServices.getAllUsersService();
    res.status(200).json({results});
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching users and stats",
        error: error.message,
      });
  }
}

export const getUserByIdController = async (req, res) => {
  try {
    const {id} = req.params;
    const user = await AdminDashServices.getUserByIdService(id);
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
};

export const deleteUserByIdController = async (req, res) => {
  try {
    const {id} = req.params;
    const result = await AdminDashServices.deleteUserService(id);
    res.status(200).json(result);
  } catch (error) {
     res
       .status(500)
       .json({ message: "Error deleting user", error: error.message });
  }
}

export const approveObserverController = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await AdminDashServices.approveObserverService(id);

    res.status(200).json(response);
  } catch (error) {
    console.error(`Error in approveObserverController: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

export const getAllObserver = async (req, res) => {
  try {
    const data = await AdminDashServices.getAllObsersverService();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const downgradeObserverController = async (req, res) => {
  try {
    let { id } = req.params;
    const { adminReason } = req.body;


    // Validate admin reason
    if (!adminReason) {
      return res.status(400).json({ message: "Admin reason is required" });
    }

    const result = await AdminDashServices.downgradeObserverService(id, adminReason);
    res.status(200).json(result);
  } catch (error) {
    console.error(`Error in downgradeObserverController: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

export const getFlaggedResultsCon = async (req, res) => {
  try {
    const results = await AdminService.getFlaggedResultsService();
    res.status(200).json({results});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const deleteFlaggedResultController = async (req, res) => {
try {
  const { id } = req.params;
  const adminId = req.user._id;

  const result = await AdminService.deleteFlaggedResults(id, adminId);
  res.status(200).json(result);
} catch (error) {
  res
    .status(500)
    .json({ message: "Error deleting flagged result", error: error.message });
}
};


export const restoreFlaggedResultController = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const result = await AdminService.restoreFlaggedResult(id, adminId);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error restoring flagged result",
        error: error.message,
      });
  }
};


export const getSingleFlaggedElectionController = async (req, res) => {
  try {
    const { id } = req.params;
    const resultOrIncident = await AdminService.getSingleFlaggedElectionService(id);
    res.status(200).json({ result: resultOrIncident });
  } catch (error) {
    console.error(`Error fetching flagged election: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};


export const adminNotificationController = async (req, res) =>{
  try {
    const userId = req.user._id;
    const notifications = await AdminService.adminNotificationService(userId);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
}

export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const result = await AdminService.markNotificationAsReadService(notificationId, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error marking notification as read", error: error.message });
  }
};

export const deleteNotificationForUser = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const result = await AdminService.deleteNotificationForUserService(notificationId, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error deleting notification", error: error.message });
  }
};
