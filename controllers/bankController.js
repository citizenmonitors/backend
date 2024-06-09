import getBanks from "../services/bankService.js";

export const getAllBanks = async (req, res) => {
  try {
    const banks = await getBanks();
    res.status(200).json({ banks });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch banks", error: error.message });
  }
};
