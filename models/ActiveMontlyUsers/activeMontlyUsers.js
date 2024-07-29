import mongoose from "mongoose";

const monthlyActiveUsersSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true,
    unique: true,
  },
  activeUserCount: {
    type: Number,
    // default: 0,
    required: true,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompletedUser",
    },
  ],
});

const MontlyActiveUsers = mongoose.model('MontlyActiveUsers', monthlyActiveUsersSchema);

export default MontlyActiveUsers;