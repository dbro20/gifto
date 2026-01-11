import { z } from "zod";

// Preset occasion types
export const OCCASION_TYPES = [
  "Birthday",
  "Anniversary",
  "Christmas",
  "Valentine's Day",
  "Mother's Day",
  "Father's Day",
  "Other",
] as const;

// Schema for creating an occasion (used in API routes)
export const createOccasionSchema = z.object({
  recipientId: z.string().uuid("Invalid recipient ID"),
  occasionType: z.string().min(1, "Occasion type is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  isAnnual: z.boolean().default(false),
  notes: z.string().optional().nullable(),
});

// Schema for the form (with explicit boolean for react-hook-form compatibility)
export const occasionFormSchema = z.object({
  recipientId: z.string().uuid("Invalid recipient ID"),
  occasionType: z.string().min(1, "Occasion type is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  isAnnual: z.boolean(),
  notes: z.string().optional().nullable(),
});

// Schema for updating an occasion
export const updateOccasionSchema = z.object({
  recipientId: z.string().uuid("Invalid recipient ID").optional(),
  occasionType: z.string().min(1, "Occasion type is required").optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  isAnnual: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

// Types inferred from schemas
export type CreateOccasionInput = z.infer<typeof createOccasionSchema>;
export type OccasionFormInput = z.infer<typeof occasionFormSchema>;
export type UpdateOccasionInput = z.infer<typeof updateOccasionSchema>;
