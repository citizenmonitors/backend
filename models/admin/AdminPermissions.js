import mongoose from "mongoose";

const adminPermissionsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompletedUser",
      required: true,
    },
    getAdmins: { type: Boolean, default: false },
    // approveObserver: { type: Boolean, default: false },
    viewResults: { type: Boolean, default: false },
    viewResult: { type: Boolean, default: false },
    deleteResult: { type: Boolean, default: false },
    viewUsers: { type: Boolean, default: false },
    viewUser: { type: Boolean, default: false },
    deleteUser: { type: Boolean, default: false },
    approveObserver: { type: Boolean, default: false },
    downgradeObserver: { type: Boolean, default: false },
    deleteFlagged: { type: Boolean, default: false },
    restoreFlagged: { type: Boolean, default: false },
    createElection: { type: Boolean, default: false },
    updateElection: { type: Boolean, default: false },
    createActiveElection: { type: Boolean, default: false },
    updateActiveElection: { type: Boolean, default: false },
    deleteElection: { type: Boolean, default: false },
    deleteActiveElection: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);



export default mongoose.model("AdminPermissions", adminPermissionsSchema);
