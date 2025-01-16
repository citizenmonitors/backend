import { approveObserverService, deleteUserService, getAdminLiveElectionService, getAllElectionsService, getAllUsersService, getUserByIdService } from "../../services/adminService/adminDashboard.js";
import {
  deleteResultOrIncidentService,
    getAllAdminService,
    getAllResultService,
    getDashboardDataService,
    getResultOrIncidentByIdService,
} from "../../services/adminService/adminElectionService.js";

export const getDashboardDataController = async (req, res) => {
    try {
        const dashboardData = await getDashboardDataService();
        res.status(200).json(dashboardData)
    } catch (error) {
        res.status(505),json({error: error.message})
    }
}

export const getAllAdminController = async (req, res) => {
    try {
        const admins = await getAllAdminService();
        res.status(200).json(admins);
    } catch (error) {
        res
          .status(500)
          .json({ message: "Error fetching admins", error: error.message });
    }
}


export const getAllElections = async (req, res) => {
  try {
    const elections = await getAllElectionsService();

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

    const result = await getAdminLiveElectionService(electionId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching admin live election data:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Fetch all results and incidents
export const getAllElectionAndIncidentController = async (req, res) =>{
  try {
    
    const results = await getAllResultService();
    res.status(200).json({results});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export const getResultOrIncidentByController = async (req, res) => {
  try {
    const { id } = req.params;
    const resultOrIncident = await getResultOrIncidentByIdService(id);
    res.status(200).json({result: resultOrIncident});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// Delete result or incident
export const deletedResultOrIncidentController = async (req, res) => {
  try {

    const { id } = req.params;

    // check admin role
    if(req.user.role !== 'admin') {
      return res.status(403).json({message: "Access denied"});
    }

    const message = await deleteResultOrIncidentService(id);
    res.status(200).json({message})
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

export const getAllUsersController = async (req, res) => {
  try {
    const results = await getAllUsersService();
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
    const user = await getUserByIdService(id);
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
    const result = await deleteUserService(id);
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

    const response = await approveObserverService(id);

    res.status(200).json(response);
  } catch (error) {
    console.error(`Error in approveObserverController: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};