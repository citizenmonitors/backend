import Election from "../../models/Election/Election.js";
import { politicalParties } from "../../models/Election/PoliticalParty.js";
export const createElection = async (req, res) => {
    try {
        const { type, name } = req.body;
        const existingElection = await Election.findOne({
            electionType: type,
            electionName: name,
        });
        if (existingElection) {
            return res.status(400).json({ message: "Election already exists" });
        }
        const election = new Election({
            electionType: type,
            electionName: name,
        });
        await election.save();
        return res.status(201).json(election);
    }
    catch (error) {
        return res.status(500).json({ message: "Error creating election", error });
    }
};
export const addPoliticalParty = async (req, res) => {
    try {
        const { partyName } = req.body;
        const existingParty = politicalParties.find((party) => party.name.toLowerCase() === String(partyName).toLowerCase());
        if (existingParty) {
            return res
                .status(400)
                .json({ message: "Political party already exists" });
        }
        const party = { name: partyName, code: "", imageUrl: null };
        politicalParties.push(party);
        return res.status(201).json(party);
    }
    catch (error) {
        return res.status(500).json({ message: "Error adding political party", error });
    }
};
export const getPoliticalParties = async (_req, res) => {
    try {
        return res.status(200).json(politicalParties);
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error fetching political parties", error });
    }
};
//# sourceMappingURL=electionController.js.map