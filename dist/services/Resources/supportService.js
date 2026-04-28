import { supportRequestTemplate } from "../../config/emailTemplates.js";
import SupportRequest from "../../models/Resources/support.js";
import { sendEmail } from "../../config/email.js";
export const createSupportRequest = async (data) => {
    try {
        const supportRequest = (await SupportRequest.create(data));
        const emailContent = supportRequestTemplate(data.firstName, data.lastName, data.email, data.phoneNumber, data.category, data.message);
        await sendEmail({
            to: "support@citizenmonitors.com",
            subject: `New Support Request from ${data.firstName} ${data.lastName}`,
            htmlbody: emailContent,
        });
        return supportRequest;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error creating support request:", message);
        throw new Error("Failed to create support request");
    }
};
export const getAllSupportRequests = async (user) => {
    if (!user?.role || !["admin", "super-admin"].includes(user.role)) {
        throw new Error("Unauthorized access");
    }
    return (await SupportRequest.find().sort({ createdAt: -1 }));
};
export const getSupportRequestById = async (user, id) => {
    if (!user?.role || !["admin", "super-admin"].includes(user.role)) {
        throw new Error("Unauthorized access");
    }
    const supportRequest = (await SupportRequest.findById(id));
    if (!supportRequest)
        throw new Error("Support request not found");
    return supportRequest;
};
export const deleteSupportRequest = async (user, id) => {
    if (!user?.role || !["admin", "super-admin"].includes(user.role)) {
        throw new Error("Unauthorized access");
    }
    const deletedSupport = await SupportRequest.findByIdAndDelete(id);
    if (!deletedSupport)
        throw new Error("Support request not found");
    return { message: "Support request deleted successfully" };
};
//# sourceMappingURL=supportService.js.map