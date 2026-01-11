import { NextResponse } from "next/server";
import { format } from "date-fns";
import { sendEmail } from "@/lib/email/resend";
import { ReminderEmail } from "@/lib/email/templates/reminder";
import { DayOfReminderEmail } from "@/lib/email/templates/day-of-reminder";
import {
  getUsersWithRemindersEnabled,
  getOccasionsForReminders,
  hasReminderBeenSent,
  logSentReminder,
  getGiftIdeasForRecipient,
} from "@/lib/db/queries/reminders";

// Base URL for email links
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://gifto.app";

/**
 * GET /api/cron/reminders
 * Daily cron job to send reminder emails
 *
 * Called by Vercel Cron at 9am daily
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret from Authorization header
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron] Starting reminder job...");

    // Get all users with reminders enabled
    const usersWithReminders = await getUsersWithRemindersEnabled();
    console.log(`[Cron] Found ${usersWithReminders.length} users with reminders enabled`);

    const results = {
      processed: 0,
      sent: 0,
      skipped: 0,
      errors: 0,
      details: [] as { email: string; occasion: string; daysBefore: number; status: string }[],
    };

    // Process each user
    for (const userSettings of usersWithReminders) {
      const { userId, daysBefore, user } = userSettings;

      if (!user || !user.email) {
        console.warn(`[Cron] Skipping user ${userId} - no email found`);
        continue;
      }

      // Check each reminder interval the user has enabled
      for (const days of daysBefore) {
        // Get occasions that are exactly this many days away
        const upcomingOccasions = await getOccasionsForReminders(days);

        // Filter to only this user's occasions
        const userOccasions = upcomingOccasions.filter(
          (occasion) => occasion.userId === userId
        );

        for (const occasion of userOccasions) {
          results.processed++;

          // Skip if we already sent a reminder for this occasion/interval
          const alreadySent = await hasReminderBeenSent(occasion.id, days);
          if (alreadySent) {
            console.log(
              `[Cron] Skipping - already sent reminder for occasion ${occasion.id} at ${days} days`
            );
            results.skipped++;
            results.details.push({
              email: user.email,
              occasion: `${occasion.recipient?.name}'s ${occasion.occasionType}`,
              daysBefore: days,
              status: "skipped - already sent",
            });
            continue;
          }

          try {
            // Calculate the occasion date for display
            const occasionDate = new Date(occasion.date);
            let displayDate: Date;

            if (occasion.isAnnual) {
              // For annual occasions, show the next occurrence in current/next year
              const today = new Date();
              const thisYearOccasion = new Date(
                today.getFullYear(),
                occasionDate.getMonth(),
                occasionDate.getDate()
              );

              if (thisYearOccasion >= today) {
                displayDate = thisYearOccasion;
              } else {
                displayDate = new Date(
                  today.getFullYear() + 1,
                  occasionDate.getMonth(),
                  occasionDate.getDate()
                );
              }
            } else {
              displayDate = occasionDate;
            }

            // Send appropriate email based on days until
            if (days === 0) {
              // Day-of reminder - no gift ideas needed
              await sendEmail({
                to: user.email,
                subject: `Today is ${occasion.recipient?.name}'s ${occasion.occasionType}!`,
                react: DayOfReminderEmail({
                  recipientName: occasion.recipient?.name || "Someone",
                  occasionType: occasion.occasionType,
                  viewUrl: APP_URL,
                }),
              });
            } else {
              // Advance reminder - include gift ideas
              const giftIdeas = occasion.recipientId
                ? await getGiftIdeasForRecipient(occasion.recipientId)
                : [];

              await sendEmail({
                to: user.email,
                subject: `Reminder: ${occasion.recipient?.name}'s ${occasion.occasionType} is in ${days} day${days === 1 ? "" : "s"}`,
                react: ReminderEmail({
                  recipientName: occasion.recipient?.name || "Someone",
                  occasionType: occasion.occasionType,
                  occasionDate: format(displayDate, "MMMM d, yyyy"),
                  daysUntil: days,
                  giftIdeas: giftIdeas.map((idea) => ({
                    id: idea.id,
                    title: idea.title,
                    price: idea.price,
                    url: idea.url,
                  })),
                  viewUrl: `${APP_URL}/recipients/${occasion.recipientId}`,
                }),
              });
            }

            // Log that we sent this reminder
            await logSentReminder(userId, occasion.id, days);

            console.log(
              `[Cron] Sent ${days === 0 ? "day-of" : days + "-day"} reminder to ${user.email} for ${occasion.recipient?.name}'s ${occasion.occasionType}`
            );
            results.sent++;
            results.details.push({
              email: user.email,
              occasion: `${occasion.recipient?.name}'s ${occasion.occasionType}`,
              daysBefore: days,
              status: "sent",
            });
          } catch (emailError) {
            console.error(
              `[Cron] Failed to send email to ${user.email}:`,
              emailError
            );
            results.errors++;
            results.details.push({
              email: user.email,
              occasion: `${occasion.recipient?.name}'s ${occasion.occasionType}`,
              daysBefore: days,
              status: `error: ${emailError instanceof Error ? emailError.message : "Unknown error"}`,
            });
          }
        }
      }
    }

    console.log(
      `[Cron] Job complete. Processed: ${results.processed}, Sent: ${results.sent}, Skipped: ${results.skipped}, Errors: ${results.errors}`
    );

    return NextResponse.json({
      success: true,
      summary: {
        processed: results.processed,
        sent: results.sent,
        skipped: results.skipped,
        errors: results.errors,
      },
      details: results.details,
    });
  } catch (error) {
    console.error("[Cron] Fatal error in reminder job:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
