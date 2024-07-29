import {
    getAllAdminService,
    getDailyTrafficService,
    getTotalActiveUsersService,
  getTotalRegistredUsersService,
  getTotalResultsUploadedService,
  getTotalVolunteerUsersService,
  getUserInfoService,
} from "../../services/adminService/adminElectionService.js";

export const getTotalRegisteredUsersController = async (req, res) => {
    try {
        const totalUsers = await getTotalRegistredUsersService();
        res.status(200).json({totalUsers});
    } catch (error) {
        res
          .status(500)
          .json({
            message: "Error fetching total users",
            error: error.message,
          });
    }
}

export const getTotalVolunteerUsersController = async (req, res) => {
    try {
        const totalVolunteers = await getTotalVolunteerUsersService();
        res.status(200).json({totalVolunteers});
    } catch (error) {
        res
          .status(500)
          .json({
            message: "Error fetching total volunteer users",
            error: error.message,
          });
    }
}

export const getTotalActiveUserController = async (req, res) => {
    try {
    const totalActiveUser = await getTotalActiveUsersService();
    res.status(200).json({totalActiveUser });
    } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching total active users",
        error: error.message,
      });
    }
}

export const getTotalResultsUploadedController = async (req, res) =>{
    try{
    const totalResults = await getTotalResultsUploadedService();
    res.status(200).json({totalResults});
}
catch(error){
    res
      .status(500)
      .json({ message: "Error fetching total results uploaded", error: error.message });
}
}

export const getUserInfoController = async (req, res) =>{
    try {
        const userInfo = await getUserInfoService();
        res.status(200).json(userInfo)
    } catch (error) {
        res.status(500).json({message: "Error fetching user info", error: error.message
    })
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

export const getDailyTrafficController = async (req, res) => {
    try {
        const dailyTraffic = await getDailyTrafficService();
        res.status(200).json({dailyTraffic})
    } catch (error) {
        res
          .status(500)
          .json({ message: "Error fetching daily traffic",  error: error });
    }
}