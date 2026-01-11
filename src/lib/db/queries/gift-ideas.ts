import { and, eq, desc } from "drizzle-orm";
import { db } from "../index";
import { giftIdeas, recipients, occasions } from "../schema";

export type CreateGiftIdeaData = {
  recipientId: string;
  userId: string;
  title: string;
  description?: string | null;
  url?: string | null;
  originalUrl?: string | null;
  price?: string | null;
  asin?: string | null;
  originalPrice?: string | null;
};

export type UpdateGiftIdeaData = {
  recipientId?: string;
  title?: string;
  description?: string | null;
  url?: string | null;
  originalUrl?: string | null;
  price?: string | null;
  asin?: string | null;
  originalPrice?: string | null;
};

/**
 * Get all gift ideas for a user, optionally filtered by recipient
 */
export async function getGiftIdeasByUserId(
  userId: string,
  recipientId?: string
) {
  const conditions = [eq(giftIdeas.userId, userId)];

  if (recipientId) {
    conditions.push(eq(giftIdeas.recipientId, recipientId));
  }

  const result = await db
    .select({
      id: giftIdeas.id,
      recipientId: giftIdeas.recipientId,
      userId: giftIdeas.userId,
      title: giftIdeas.title,
      description: giftIdeas.description,
      url: giftIdeas.url,
      originalUrl: giftIdeas.originalUrl,
      price: giftIdeas.price,
      asin: giftIdeas.asin,
      originalPrice: giftIdeas.originalPrice,
      currentPrice: giftIdeas.currentPrice,
      isPurchased: giftIdeas.isPurchased,
      purchasedForOccasionId: giftIdeas.purchasedForOccasionId,
      createdAt: giftIdeas.createdAt,
      updatedAt: giftIdeas.updatedAt,
      recipient: {
        id: recipients.id,
        name: recipients.name,
        relationship: recipients.relationship,
      },
    })
    .from(giftIdeas)
    .leftJoin(recipients, eq(giftIdeas.recipientId, recipients.id))
    .where(and(...conditions))
    .orderBy(desc(giftIdeas.createdAt));

  return result;
}

/**
 * Get a single gift idea by ID, verifying ownership
 */
export async function getGiftIdeaById(id: string, userId: string) {
  const result = await db
    .select({
      id: giftIdeas.id,
      recipientId: giftIdeas.recipientId,
      userId: giftIdeas.userId,
      title: giftIdeas.title,
      description: giftIdeas.description,
      url: giftIdeas.url,
      originalUrl: giftIdeas.originalUrl,
      price: giftIdeas.price,
      asin: giftIdeas.asin,
      originalPrice: giftIdeas.originalPrice,
      currentPrice: giftIdeas.currentPrice,
      isPurchased: giftIdeas.isPurchased,
      purchasedForOccasionId: giftIdeas.purchasedForOccasionId,
      createdAt: giftIdeas.createdAt,
      updatedAt: giftIdeas.updatedAt,
      recipient: {
        id: recipients.id,
        name: recipients.name,
        relationship: recipients.relationship,
      },
      purchasedForOccasion: {
        id: occasions.id,
        occasionType: occasions.occasionType,
        date: occasions.date,
      },
    })
    .from(giftIdeas)
    .leftJoin(recipients, eq(giftIdeas.recipientId, recipients.id))
    .leftJoin(occasions, eq(giftIdeas.purchasedForOccasionId, occasions.id))
    .where(and(eq(giftIdeas.id, id), eq(giftIdeas.userId, userId)))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get gift ideas for a specific recipient
 */
export async function getGiftIdeasByRecipientId(
  recipientId: string,
  userId: string
) {
  return getGiftIdeasByUserId(userId, recipientId);
}

/**
 * Create a new gift idea
 */
export async function createGiftIdea(data: CreateGiftIdeaData) {
  const result = await db
    .insert(giftIdeas)
    .values({
      recipientId: data.recipientId,
      userId: data.userId,
      title: data.title,
      description: data.description ?? null,
      url: data.url ?? null,
      originalUrl: data.originalUrl ?? null,
      price: data.price ?? null,
      asin: data.asin ?? null,
      originalPrice: data.originalPrice ?? null,
    })
    .returning();

  return result[0];
}

/**
 * Update a gift idea, verifying ownership
 */
export async function updateGiftIdea(
  id: string,
  userId: string,
  data: UpdateGiftIdeaData
) {
  const result = await db
    .update(giftIdeas)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(giftIdeas.id, id), eq(giftIdeas.userId, userId)))
    .returning();

  return result[0] ?? null;
}

/**
 * Delete a gift idea, verifying ownership
 */
export async function deleteGiftIdea(id: string, userId: string) {
  const result = await db
    .delete(giftIdeas)
    .where(and(eq(giftIdeas.id, id), eq(giftIdeas.userId, userId)))
    .returning();

  return result[0] ?? null;
}

/**
 * Mark a gift idea as purchased
 */
export async function markAsPurchased(
  id: string,
  userId: string,
  occasionId?: string | null
) {
  const result = await db
    .update(giftIdeas)
    .set({
      isPurchased: true,
      purchasedForOccasionId: occasionId ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(giftIdeas.id, id), eq(giftIdeas.userId, userId)))
    .returning();

  return result[0] ?? null;
}

/**
 * Mark a gift idea as unpurchased
 */
export async function markAsUnpurchased(id: string, userId: string) {
  const result = await db
    .update(giftIdeas)
    .set({
      isPurchased: false,
      purchasedForOccasionId: null,
      updatedAt: new Date(),
    })
    .where(and(eq(giftIdeas.id, id), eq(giftIdeas.userId, userId)))
    .returning();

  return result[0] ?? null;
}
