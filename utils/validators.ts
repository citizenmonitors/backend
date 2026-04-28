import mongoose from "mongoose";

/** Normalize Express `req.params` values (string or string[] in some setups). */
export const asParamString = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

/**
 * Validates that a value is a valid MongoDB ObjectId string.
 * Use before passing req.params.id (or similar) to findById, findByIdAndUpdate, etc.
 */
export const isValidObjectId = (id: unknown): boolean => {
  if (!id || typeof id !== "string") return false;
  if (id.length !== 24) return false;
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  return String(new mongoose.Types.ObjectId(id)) === id;
};

