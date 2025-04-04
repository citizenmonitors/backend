import SupportRequest from "../../models/Resources/support.js"

export const createSupportRequest = async (data) => {
    return await SupportRequest.create(data);
  };


  export const getAllSupportRequests = async (user) => {
    if (!["admin", "super-admin"].includes(user.role)) {
      throw new Error("Unauthorized access");
    }
    return await SupportRequest.find().sort({ createdAt: -1 });
  };


  export const getSupportRequestById = async (user, id) => {
    if (!["admin", "super-admin"].includes(user.role)) {
      throw new Error("Unauthorized access");
    }
  
    const supportRequest = await SupportRequest.findById(id);
    if (!supportRequest) throw new Error("Support request not found");
    return supportRequest;
  };


  export const deleteSupportRequest = async (user, id) => {
    if (!["admin", "super-admin"].includes(user.role)) {
      throw new Error("Unauthorized access");
    }
  
    const deletedSupport = await SupportRequest.findByIdAndDelete(id);
    if (!deletedSupport) throw new Error("Support request not found");
    return { message: "Support request deleted successfully" };
  };