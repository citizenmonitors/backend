import path from "path";
import CompletedUser from "../../models/CompletedUser.js";

// bug
// observer to volunteer
export const observerToVolunteerService = async ({ email, details, file }) => {
  const user = await CompletedUser.findOne({ email });

  if (!user) {
    throw new Error("No account found with this email address");
  }

  if (file) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", "pdf", ".png"].includes(ext)) {
      throw new Error(
        "Only images are allowed. Please upload a jpg, jpeg, pdf, or png file."
      );
    }
    details.governmentId = file.path;
  } else {
    throw new Error("Government ID is required for volunteers");
  }

  Object.assign(user, details);
  user.role = "volunteer";

  await user.save();

  const { password, ...userDetails } = user.toObject();
  return userDetails;
};

