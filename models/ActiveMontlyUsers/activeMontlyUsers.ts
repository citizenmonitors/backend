import mongoose from "mongoose";

const monthlyActiveUsersSchema = new mongoose.Schema({
  month: {
    type: String,
    unique: true,
    required: true,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompletedUser",
    },
  ],
});

const ActiveUser = mongoose.model("ActiveUser", monthlyActiveUsersSchema);

export default ActiveUser;

