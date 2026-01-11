import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { recipients, occasions } from "@/lib/db/schema";
import type { Recipient, NewRecipient } from "@/types";

/**
 * Get all recipients for a user, ordered by most recently created
 */
export async function getRecipientsByUserId(
  userId: string
): Promise<Recipient[]> {
  return db
    .select()
    .from(recipients)
    .where(eq(recipients.userId, userId))
    .orderBy(desc(recipients.createdAt));
}

/**
 * Get all recipients with their birthday occasion
 */
export async function getRecipientsWithBirthday(
  userId: string
): Promise<(Recipient & { birthday: string | null })[]> {
  const recipientList = await db
    .select()
    .from(recipients)
    .where(eq(recipients.userId, userId))
    .orderBy(desc(recipients.createdAt));

  // Get all birthday occasions for these recipients
  const birthdayOccasions = await db
    .select()
    .from(occasions)
    .where(
      and(
        eq(occasions.userId, userId),
        eq(occasions.occasionType, "Birthday")
      )
    );

  // Map birthdays to recipients
  const birthdayMap = new Map(
    birthdayOccasions.map((o) => [o.recipientId, o.date])
  );

  return recipientList.map((r) => ({
    ...r,
    birthday: birthdayMap.get(r.id) || null,
  }));
}

/**
 * Get a single recipient by ID with ownership verification
 * Returns null if recipient doesn't exist or doesn't belong to the user
 */
export async function getRecipientById(
  id: string,
  userId: string
): Promise<Recipient | null> {
  const result = await db
    .select()
    .from(recipients)
    .where(and(eq(recipients.id, id), eq(recipients.userId, userId)))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Create a new recipient
 */
export async function createRecipient(
  data: Omit<NewRecipient, "id" | "createdAt" | "updatedAt">
): Promise<Recipient> {
  const [newRecipient] = await db.insert(recipients).values(data).returning();

  return newRecipient;
}

/**
 * Update a recipient with ownership verification
 * Returns null if recipient doesn't exist or doesn't belong to the user
 */
export async function updateRecipient(
  id: string,
  userId: string,
  data: Partial<Pick<Recipient, "name" | "relationship" | "notes">>
): Promise<Recipient | null> {
  const [updatedRecipient] = await db
    .update(recipients)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(recipients.id, id), eq(recipients.userId, userId)))
    .returning();

  return updatedRecipient ?? null;
}

/**
 * Delete a recipient with ownership verification
 * Returns true if deleted, false if not found or doesn't belong to user
 */
export async function deleteRecipient(
  id: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(recipients)
    .where(and(eq(recipients.id, id), eq(recipients.userId, userId)))
    .returning({ id: recipients.id });

  return result.length > 0;
}
