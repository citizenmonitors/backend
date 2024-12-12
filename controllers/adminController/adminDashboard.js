import { getDashboardData } from "../../services/adminService/adminDashboard.js"; 

export const getDashboardController = async (req, res) => {
  try {
    const data = await getDashboardData();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};
