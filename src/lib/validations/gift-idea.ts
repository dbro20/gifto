import { z } from "zod";

/**
 * Schema for creating a new gift idea
 */
export const createGiftIdeaSchema = z.object({
  recipientId: z.string().uuid("Invalid recipient ID"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .optional()
    .nullable(),
  url: z
    .string()
    .url("Invalid URL format")
    .max(2000, "URL must be less than 2000 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")
    .optional()
    .nullable()
    .or(z.literal("")),
});

/**
 * Schema for updating a gift idea
 */
export const updateGiftIdeaSchema = z.object({
  recipientId: z.string().uuid("Invalid recipient ID").optional(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .optional(),
  description: z
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .optional()
    .nullable(),
  url: z
    .string()
    .url("Invalid URL format")
    .max(2000, "URL must be less than 2000 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")
    .optional()
    .nullable()
    .or(z.literal("")),
});

/**
 * Schema for marking a gift as purchased
 */
export const purchaseGiftSchema = z.object({
  occasionId: z.string().uuid("Invalid occasion ID").optional().nullable(),
});

export type CreateGiftIdeaInput = z.infer<typeof createGiftIdeaSchema>;
export type UpdateGiftIdeaInput = z.infer<typeof updateGiftIdeaSchema>;
export type PurchaseGiftInput = z.infer<typeof purchaseGiftSchema>;
