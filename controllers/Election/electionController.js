import Election from "../../models/Election/Election.js";
import PoliticalParty from "../../models/Election/PoliticalParty.js";

export const createElection = async (req, res) => {
  try {
    const { year, type, startDate, endDate } = req.body;
    const existingElection = await Election.findOne({ year, type });

    if (existingElection) {
      return res
        .status(400)
        .json({ message: "Election type already exists for this year" });
    }

    const election = new Election({ year, type, startDate, endDate });
    await election.save();

    res.status(201).json(election);
  } catch (error) {
    res.status(500).json({ message: "Error creating election", error });
  }
};

export const addPoliticalParty = async (req, res) => {
  try {
    const { partyName } = req.body;
    const existingParty = await PoliticalParty.findOne({ name: partyName });

    if (existingParty) {
      return res
        .status(400)
        .json({ message: "Political party already exists" });
    }

    const party = new PoliticalParty({ name: partyName });
    await party.save();

    res.status(201).json(party);
  } catch (error) {
    res.status(500).json({ message: "Error adding political party", error });
  }
};

export const getPoliticalParties = async (req, res) => {
  try {
    const parties = await PoliticalParty.find();
    res.status(200).json(parties);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching political parties", error });
  }
};
