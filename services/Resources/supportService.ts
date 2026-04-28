import { supportRequestTemplate } from "../../config/emailTemplates.js";
import SupportRequest from "../../models/Resources/support.js";
import { sendEmail } from "../../config/email.js";
import type { Types } from "mongoose";

type SupportPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  category: string;
  message: string;
};
type AdminLikeUser = { role?: string };
type SupportDoc = {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  category: string;
  message: string;
  createdAt?: Date;
};

export const createSupportRequest = async (data: SupportPayload): Promise<SupportDoc> => {
  try {
    const supportRequest = (await SupportRequest.create(data)) as SupportDoc;

    const emailContent = supportRequestTemplate(
      data.firstName,
      data.lastName,
      data.email,
      data.phoneNumber,
      data.category,
      data.message
    );

    await sendEmail({
      to: "support@citizenmonitors.com",
      subject: `New Support Request from ${data.firstName} ${data.lastName}`,
      htmlbody: emailContent,
    });

    return supportRequest;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error creating support request:", message);
    throw new Error("Failed to create support request");
  }
};

export const getAllSupportRequests = async (user: AdminLikeUser | undefined): Promise<SupportDoc[]> => {
  if (!user?.role || !["admin", "super-admin"].includes(user.role)) {
    throw new Error("Unauthorized access");
  }
  return (await SupportRequest.find().sort({ createdAt: -1 })) as SupportDoc[];
};

export const getSupportRequestById = async (
  user: AdminLikeUser | undefined,
  id: string
): Promise<SupportDoc> => {
  if (!user?.role || !["admin", "super-admin"].includes(user.role)) {
    throw new Error("Unauthorized access");
  }

  const supportRequest = (await SupportRequest.findById(id)) as SupportDoc | null;
  if (!supportRequest) throw new Error("Support request not found");
  return supportRequest;
};

export const deleteSupportRequest = async (
  user: AdminLikeUser | undefined,
  id: string
): Promise<{ message: string }> => {
  if (!user?.role || !["admin", "super-admin"].includes(user.role)) {
    throw new Error("Unauthorized access");
  }

  const deletedSupport = await SupportRequest.findByIdAndDelete(id);
  if (!deletedSupport) throw new Error("Support request not found");
  return { message: "Support request deleted successfully" };
};

