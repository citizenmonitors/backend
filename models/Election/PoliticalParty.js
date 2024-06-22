import mongoose from "mongoose";

const PoliticalPartySchema = new mongoose.Schema({
  partyName: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.model("PoliticalParty", PoliticalPartySchema);