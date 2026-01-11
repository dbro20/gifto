import { z } from "zod";

// Valid reminder intervals (days before occasion)
export const REMINDER_INTERVALS = [30, 14, 7, 0] as const;

export type ReminderInterval = (typeof REMINDER_INTERVALS)[number];

/**
 * Schema for updating reminder settings
 */
export const updateReminderSettingsSchema = z.object({
  daysBefore: z
    .array(z.number().int().min(0).max(365))
    .min(0, "At least select when you want reminders")
    .refine(
      (arr) => arr.every((n) => REMINDER_INTERVALS.includes(n as ReminderInterval)),
      {
        message: "Invalid reminder interval",
      }
    ),
  emailEnabled: z.boolean(),
});

export type UpdateReminderSettingsInput = z.infer<
  typeof updateReminderSettingsSchema
>;

/**
 * Labels for reminder intervals
 */
export const REMINDER_INTERVAL_LABELS: Record<ReminderInterval, string> = {
  30: "30 days before",
  14: "2 weeks before",
  7: "1 week before",
  0: "Day of",
};
