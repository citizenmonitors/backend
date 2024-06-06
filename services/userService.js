import User from "../models/User.js";
import CompletedUser from "../models/CompletedUser.js";
import { hashPassword } from "../utils/hashPassword.js";

export const getAllUsers = async () => {
  const users = await CompletedUser.find({});
  return users;
};

export const getUsersByRole = async (role) => {
  const users = await CompletedUser.find({ role });
  return users;
};

export const updateUserDetails = async (email, updateData) => {
  let user =
    (await User.findOne({ email })) || (await CompletedUser.findOne({ email }));
  if (!user) {
    throw new Error("User not found");
  }

  for (const key in updateData) {
    if (key === "password") {
      user[key] = await hashPassword(updateData[key]);
    } else {
      user[key] = updateData[key];
    }
  }

  await user.save();
  return user;
};
