import { getAdminLiveElectionService, getAllElectionsService } from "../../services/adminService/adminDashboard.js";
import {
    getAllAdminService,
    getDashboardDataService,
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
