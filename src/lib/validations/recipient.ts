import { z } from "zod";

/**
 * Schema for creating a new recipient
 */
export const createRecipientSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  relationship: z
    .string()
    .max(50, "Relationship must be less than 50 characters")
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .nullable(),
});

/**
 * Schema for updating a recipient
 */
export const updateRecipientSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  relationship: z
    .string()
    .max(50, "Relationship must be less than 50 characters")
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .nullable(),
});

export type CreateRecipientInput = z.infer<typeof createRecipientSchema>;
export type UpdateRecipientInput = z.infer<typeof updateRecipientSchema>;

/**
 * Common relationship options for the dropdown
 */
export const RELATIONSHIP_OPTIONS = [
  { value: "partner", label: "Partner / Spouse" },
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "sibling", label: "Sibling" },
  { value: "grandparent", label: "Grandparent" },
  { value: "grandchild", label: "Grandchild" },
  { value: "friend", label: "Friend" },
  { value: "colleague", label: "Colleague" },
  { value: "boss", label: "Boss" },
  { value: "aunt_uncle", label: "Aunt / Uncle" },
  { value: "cousin", label: "Cousin" },
  { value: "niece_nephew", label: "Niece / Nephew" },
  { value: "in_law", label: "In-Law" },
  { value: "neighbor", label: "Neighbor" },
  { value: "other", label: "Other" },
] as const;
