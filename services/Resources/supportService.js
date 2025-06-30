import { supportRequestTemplate } from "../../config/emailTemplates.js";
import SupportRequest from "../../models/Resources/support.js"
import transporter, { sendEmail } from "../../config/email.js";


export const createSupportRequest = async (data) => {
    try {
      // Create the support request in the database
      const supportRequest = await SupportRequest.create(data);
  
      // Send the support message to support@citizenmonitors.com
      const emailContent = supportRequestTemplate(
        data.firstName,
        data.lastName,
        data.email,
        data.phoneNumber,
        data.category,
        data.message
      );
  
      await sendEmail({
        from: process.env.ZEPTO_FROM_EMAIL,
        to: "support@citizenmonitors.com",
        subject: `New Support Request from ${data.firstName} ${data.lastName}`,
        htmlbody: emailContent,
      });
  
      return supportRequest;
    } catch (error) {
      console.error("Error creating support request:", error.message);
      throw new Error("Failed to create support request");
    }
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