import { and, eq, sql } from "drizzle-orm";
import { db } from "../index";
import {
  reminderSettings,
  sentReminders,
  occasions,
  recipients,
  users,
  giftIdeas,
} from "../schema";
import type { ReminderSettings } from "@/types";

/**
 * Get reminder settings for a user
 */
export async function getReminderSettings(
  userId: string
): Promise<ReminderSettings | null> {
  const result = await db
    .select()
    .from(reminderSettings)
    .where(eq(reminderSettings.userId, userId))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Create default reminder settings for a new user
 */
export async function createDefaultReminderSettings(
  userId: string
): Promise<ReminderSettings> {
  const [settings] = await db
    .insert(reminderSettings)
    .values({
      userId,
      daysBefore: [30, 14, 7, 0],
      emailEnabled: true,
    })
    .returning();

  return settings;
}

/**
 * Update reminder settings for a user
 */
export async function updateReminderSettings(
  userId: string,
  data: {
    daysBefore?: number[];
    emailEnabled?: boolean;
  }
): Promise<ReminderSettings | null> {
  const [updated] = await db
    .update(reminderSettings)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(reminderSettings.userId, userId))
    .returning();

  return updated ?? null;
}

/**
 * Get or create reminder settings for a user
 */
export async function getOrCreateReminderSettings(
  userId: string
): Promise<ReminderSettings> {
  const existing = await getReminderSettings(userId);
  if (existing) {
    return existing;
  }
  return createDefaultReminderSettings(userId);
}

/**
 * Get all occasions that are exactly X days from now
 * Handles annual occasions by checking month/day regardless of year
 */
export async function getOccasionsForReminders(days: number) {
  const result = await db
    .select({
      id: occasions.id,
      recipientId: occasions.recipientId,
      userId: occasions.userId,
      occasionType: occasions.occasionType,
      date: occasions.date,
      isAnnual: occasions.isAnnual,
      notes: occasions.notes,
      recipient: {
        id: recipients.id,
        name: recipients.name,
        relationship: recipients.relationship,
      },
      user: {
        id: users.id,
        email: users.email,
        name: users.name,
      },
    })
    .from(occasions)
    .leftJoin(recipients, eq(occasions.recipientId, recipients.id))
    .leftJoin(users, eq(occasions.userId, users.id))
    .where(
      sql`
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
        END = ${days}
      `
    );

  return result;
}

/**
 * Check if a reminder has already been sent for a specific occasion and days-before interval
 */
export async function hasReminderBeenSent(
  occasionId: string,
  daysBefore: number
): Promise<boolean> {
  const result = await db
    .select({ id: sentReminders.id })
    .from(sentReminders)
    .where(
      and(
        eq(sentReminders.occasionId, occasionId),
        eq(sentReminders.daysBefore, daysBefore)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Log a sent reminder to prevent duplicates
 */
export async function logSentReminder(
  userId: string,
  occasionId: string,
  daysBefore: number
) {
  const [logged] = await db
    .insert(sentReminders)
    .values({
      userId,
      occasionId,
      daysBefore,
    })
    .returning();

  return logged;
}

/**
 * Get all users who have email reminders enabled
 */
export async function getUsersWithRemindersEnabled() {
  const result = await db
    .select({
      userId: reminderSettings.userId,
      daysBefore: reminderSettings.daysBefore,
      user: {
        id: users.id,
        email: users.email,
        name: users.name,
        clerkId: users.clerkId,
      },
    })
    .from(reminderSettings)
    .innerJoin(users, eq(reminderSettings.userId, users.id))
    .where(eq(reminderSettings.emailEnabled, true));

  return result;
}

/**
 * Get gift ideas for a specific recipient (unpurchased only)
 */
export async function getGiftIdeasForRecipient(recipientId: string) {
  const result = await db
    .select({
      id: giftIdeas.id,
      title: giftIdeas.title,
      price: giftIdeas.price,
      url: giftIdeas.url,
    })
    .from(giftIdeas)
    .where(
      and(
        eq(giftIdeas.recipientId, recipientId),
        eq(giftIdeas.isPurchased, false)
      )
    )
    .limit(5); // Limit to 5 gift ideas per email

  return result;
}
