import type { Request, Response } from "express";
import Election from "../../models/Election/Election.ts";
import { politicalParties } from "../../models/Election/PoliticalParty.ts";
type ElectionInput = { electionType: string; electionName: string };

export const createElection = async (req: Request, res: Response) => {
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
    } as ElectionInput);
    await election.save();

    return res.status(201).json(election);
  } catch (error) {
    return res.status(500).json({ message: "Error creating election", error });
  }
};

export const addPoliticalParty = async (req: Request, res: Response) => {
  try {
    const { partyName } = req.body;
    const existingParty = politicalParties.find(
      (party) => party.name.toLowerCase() === String(partyName).toLowerCase()
    );

    if (existingParty) {
      return res
        .status(400)
        .json({ message: "Political party already exists" });
    }

    const party = { name: partyName, code: "", imageUrl: null };
    politicalParties.push(party);
    return res.status(201).json(party);
  } catch (error) {
    return res.status(500).json({ message: "Error adding political party", error });
  }
};

export const getPoliticalParties = async (_req: Request, res: Response) => {
  try {
    return res.status(200).json(politicalParties);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching political parties", error });
  }
};
