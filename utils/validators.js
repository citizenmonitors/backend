import mongoose from "mongoose";

/**
 * Validates that a string is a valid MongoDB ObjectId.
 * Use before passing req.params.id (or similar) to findById, findByIdAndUpdate, etc.
 * @param {string} id - Candidate ID from request
 * @returns {boolean}
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== "string") return false;
  if (id.length !== 24) return false;
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  return String(new mongoose.Types.ObjectId(id)) === id;
};
