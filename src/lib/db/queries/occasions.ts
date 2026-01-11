import { and, eq, sql } from "drizzle-orm";
import { db } from "../index";
import { occasions, recipients } from "../schema";

export type CreateOccasionData = {
  recipientId: string;
  userId: string;
  occasionType: string;
  date: string;
  isAnnual?: boolean;
  notes?: string | null;
};

export type UpdateOccasionData = {
  recipientId?: string;
  occasionType?: string;
  date?: string;
  isAnnual?: boolean;
  notes?: string | null;
};

/**
 * Get all occasions for a user, optionally filtered by recipient
 */
export async function getOccasionsByUserId(
  userId: string,
  recipientId?: string
) {
  const conditions = [eq(occasions.userId, userId)];

  if (recipientId) {
    conditions.push(eq(occasions.recipientId, recipientId));
  }

  const result = await db
    .select({
      id: occasions.id,
      recipientId: occasions.recipientId,
      userId: occasions.userId,
      occasionType: occasions.occasionType,
      date: occasions.date,
      isAnnual: occasions.isAnnual,
      notes: occasions.notes,
      createdAt: occasions.createdAt,
      updatedAt: occasions.updatedAt,
      recipient: {
        id: recipients.id,
        name: recipients.name,
        relationship: recipients.relationship,
      },
    })
    .from(occasions)
    .leftJoin(recipients, eq(occasions.recipientId, recipients.id))
    .where(and(...conditions))
    .orderBy(occasions.date);

  return result;
}

/**
 * Get a single occasion by ID, verifying ownership
 */
export async function getOccasionById(id: string, userId: string) {
  const result = await db
    .select({
      id: occasions.id,
      recipientId: occasions.recipientId,
      userId: occasions.userId,
      occasionType: occasions.occasionType,
      date: occasions.date,
      isAnnual: occasions.isAnnual,
      notes: occasions.notes,
      createdAt: occasions.createdAt,
      updatedAt: occasions.updatedAt,
      recipient: {
        id: recipients.id,
        name: recipients.name,
        relationship: recipients.relationship,
      },
    })
    .from(occasions)
    .leftJoin(recipients, eq(occasions.recipientId, recipients.id))
    .where(and(eq(occasions.id, id), eq(occasions.userId, userId)))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get upcoming occasions within the next N days
 * Handles annual occasions by checking if month/day falls within range
 */
export async function getUpcomingOccasions(userId: string, days: number = 30) {
  // For annual occasions, we need to check if the month/day falls within the next N days
  // regardless of the year. We use SQL to handle this calculation.
  const result = await db
    .select({
      id: occasions.id,
      recipientId: occasions.recipientId,
      userId: occasions.userId,
      occasionType: occasions.occasionType,
      date: occasions.date,
      isAnnual: occasions.isAnnual,
      notes: occasions.notes,
      createdAt: occasions.createdAt,
      updatedAt: occasions.updatedAt,
      recipient: {
        id: recipients.id,
        name: recipients.name,
        relationship: recipients.relationship,
      },
      // Calculate days until the occasion
      daysUntil: sql<number>`
        CASE
          WHEN ${occasions.isAnnual} THEN
            -- For annual occasions, calculate days until next occurrence
            CASE
              WHEN (EXTRACT(MONTH FROM ${occasions.date}::date) * 100 + EXTRACT(DAY FROM ${occasions.date}::date)) >=
                   (EXTRACT(MONTH FROM CURRENT_DATE) * 100 + EXTRACT(DAY FROM CURRENT_DATE))
              THEN
                -- This year's occurrence hasn't happened yet
                (DATE_TRUNC('year', CURRENT_DATE) +
                 ((EXTRACT(MONTH FROM ${occasions.date}::date) - 1) || ' months')::interval +
                 ((EXTRACT(DAY FROM ${occasions.date}::date) - 1) || ' days')::interval)::date - CURRENT_DATE
              ELSE
                -- Next occurrence is next year
                (DATE_TRUNC('year', CURRENT_DATE) + '1 year'::interval +
                 ((EXTRACT(MONTH FROM ${occasions.date}::date) - 1) || ' months')::interval +
                 ((EXTRACT(DAY FROM ${occasions.date}::date) - 1) || ' days')::interval)::date - CURRENT_DATE
            END
          ELSE
            -- For non-annual occasions, simple date difference
            ${occasions.date}::date - CURRENT_DATE
        END
      `.as("days_until"),
    })
    .from(occasions)
    .leftJoin(recipients, eq(occasions.recipientId, recipients.id))
    .where(
      and(
        eq(occasions.userId, userId),
        sql`
          CASE
            WHEN ${occasions.isAnnual} THEN
              CASE
                WHEN (EXTRACT(MONTH FROM ${occasions.date}::date) * 100 + EXTRACT(DAY FROM ${occasions.date}::date)) >=
                     (EXTRACT(MONTH FROM CURRENT_DATE) * 100 + EXTRACT(DAY FROM CURRENT_DATE))
                THEN
                  (DATE_TRUNC('year', CURRENT_DATE) +
                   ((EXTRACT(MONTH FROM ${occasions.date}::date) - 1) || ' months')::interval +
                   ((EXTRACT(DAY FROM ${occasions.date}::date) - 1) || ' days')::interval)::date - CURRENT_DATE
                ELSE
                  (DATE_TRUNC('year', CURRENT_DATE) + '1 year'::interval +
                   ((EXTRACT(MONTH FROM ${occasions.date}::date) - 1) || ' months')::interval +
                   ((EXTRACT(DAY FROM ${occasions.date}::date) - 1) || ' days')::interval)::date - CURRENT_DATE
              END
            ELSE
              ${occasions.date}::date - CURRENT_DATE
          END BETWEEN 0 AND ${days}
        `
      )
    )
    .orderBy(
      sql`
        CASE
          WHEN ${occasions.isAnnual} THEN
            CASE
              WHEN (EXTRACT(MONTH FROM ${occasions.date}::date) * 100 + EXTRACT(DAY FROM ${occasions.date}::date)) >=
                   (EXTRACT(MONTH FROM CURRENT_DATE) * 100 + EXTRACT(DAY FROM CURRENT_DATE))
              THEN
                (DATE_TRUNC('year', CURRENT_DATE) +
                 ((EXTRACT(MONTH FROM ${occasions.date}::date) - 1) || ' months')::interval +
                 ((EXTRACT(DAY FROM ${occasions.date}::date) - 1) || ' days')::interval)::date
              ELSE
                (DATE_TRUNC('year', CURRENT_DATE) + '1 year'::interval +
                 ((EXTRACT(MONTH FROM ${occasions.date}::date) - 1) || ' months')::interval +
                 ((EXTRACT(DAY FROM ${occasions.date}::date) - 1) || ' days')::interval)::date
            END
          ELSE
            ${occasions.date}::date
        END
      `
    );

  return result;
}

/**
 * Create a new occasion
 */
export async function createOccasion(data: CreateOccasionData) {
  const result = await db
    .insert(occasions)
    .values({
      recipientId: data.recipientId,
      userId: data.userId,
      occasionType: data.occasionType,
      date: data.date,
      isAnnual: data.isAnnual ?? false,
      notes: data.notes ?? null,
    })
    .returning();

  return result[0];
}

/**
 * Update an occasion, verifying ownership
 */
export async function updateOccasion(
  id: string,
  userId: string,
  data: UpdateOccasionData
) {
  const result = await db
    .update(occasions)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(occasions.id, id), eq(occasions.userId, userId)))
    .returning();

  return result[0] ?? null;
}

/**
 * Delete an occasion, verifying ownership
 */
export async function deleteOccasion(id: string, userId: string) {
  const result = await db
    .delete(occasions)
    .where(and(eq(occasions.id, id), eq(occasions.userId, userId)))
    .returning();

  return result[0] ?? null;
}
