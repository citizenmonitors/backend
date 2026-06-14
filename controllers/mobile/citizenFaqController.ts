import type { Request, Response } from "express";
import type { FAQCategory } from "../../content/citizenFAQ/faqs.ts";
import {
  getCitizenFaqByCategory,
  listCitizenFaq,
} from "../../services/mobile/citizenFaqService.ts";
import { asParamString } from "../../utils/validators.ts";

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const FAQ_CATEGORIES = new Set<FAQCategory>(["general", "observer"]);

export const getCitizenFaqListMobile = async (_req: Request, res: Response) => {
  try {
    const payload = listCitizenFaq();
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getCitizenFaqCategoryMobile = async (req: Request, res: Response) => {
  try {
    const category = asParamString(req.params.category).toLowerCase() as FAQCategory;
    if (!FAQ_CATEGORIES.has(category)) {
      return res.status(400).json({ message: "Invalid FAQ category" });
    }
    const bundle = getCitizenFaqByCategory(category);
    if (!bundle) {
      return res.status(404).json({ message: "FAQ category not found" });
    }
    return res.status(200).json(bundle);
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) });
  }
};
