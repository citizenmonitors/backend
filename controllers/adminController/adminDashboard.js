import * as AdminService from "../../services/adminService/adminDashboard.js";
import { isValidObjectId } from "../../utils/validators.js";


export const getDashboardController = async (req, res) => {
  try {
    const data = await AdminService.getDashboardData();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};




export const inviteAdmin = async (req, res) => {
 try {
   const adminId = req.user._id; 
   const data = await AdminService.createAdminService(adminId, req.body);
   res.json({ message: "Invitation sent", data });
 } catch (error) {
   res
     .status(500)
     .json({ message: "Error inviting admin", error: error.message });
 }
};

export const updateAdminPermissions = async (req, res) => {
  try {
    const { adminId } = req.params;
    if (!isValidObjectId(adminId)) {
      return res.status(400).json({ message: "Invalid admin ID" });
    }
    const updatedBy = req.user._id; 
    const { role, permissions } = req.body; 

    const updatedPermissions = await AdminService.updateAdminPermissionsService(
      adminId,
      updatedBy,
      { role, permissions }
    );

    res.json(
      updatedPermissions,
    );
  } catch (error) {
    res.status(500).json({
      message: "Error updating admin permissions",
      error: error.message,
    });
  }
};


export const suspendAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    if (!isValidObjectId(adminId)) {
      return res.status(400).json({ message: "Invalid admin ID" });
    }
    const suspendedBy = req.user._id;

    const updatedAdmin = await AdminService.suspendAdminService(
      adminId,
      suspendedBy
    );
    res.json( updatedAdmin );
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error suspending admin", error: error.message });
  }
};



export const getAllAdmins = async (req, res) => {
  try {
    const data = await AdminService.getAllAdminsService();
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admins", error: error.message });
  }
};



export const getAccessControl = async (req, res) => {
  try {
    const data = await AdminService.getAccessControlService();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching access control logs",
      error: error.message,
    });
  }
};


export const getAdminLogs = async (req, res) => {
  try {
    const adminId = req.params.adminId;
    if (!isValidObjectId(adminId)) {
      return res.status(400).json({ message: "Invalid admin ID" });
    }
    const data = await AdminService.getAdminLogsService(adminId);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching logs",
      error: error.message,
    });
  }
};


export const getSingleAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    if (!isValidObjectId(adminId)) {
      return res.status(400).json({ message: "Invalid admin ID" });
    }
    const { role, permissions } = req.body; 
    const admin = await AdminService.getSingleAdminService(adminId, { role, permissions });

    res.json(admin);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching admin details",
      error: error.message,
    });
  }
};





export const getUserEmailsController = async (req, res) => {

  try {
    const emails = await AdminService.getUserEmailsService();
    const emailList = emails.join("\n"); 

    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(emailList);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

