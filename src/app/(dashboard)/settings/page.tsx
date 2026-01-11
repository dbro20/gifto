import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getOrCreateReminderSettings } from "@/lib/db/queries/reminders";
import { ReminderSettingsForm } from "@/components/settings/reminder-settings-form";

export const metadata = {
  title: "Settings - Gifto",
  description: "Manage your Gifto settings and preferences",
};

export default async function SettingsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await getUserByClerkId(user.id);

  if (!dbUser) {
    redirect("/sign-in");
  }

  // Get or create the user's reminder settings
  const reminderSettings = await getOrCreateReminderSettings(dbUser.id);

  return (
    <div className="container mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        <ReminderSettingsForm
          initialSettings={{
            daysBefore: reminderSettings.daysBefore,
            emailEnabled: reminderSettings.emailEnabled,
          }}
        />
      </div>
    </div>
  );
}
