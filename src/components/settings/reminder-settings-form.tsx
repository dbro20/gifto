"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  updateReminderSettingsSchema,
  REMINDER_INTERVALS,
  REMINDER_INTERVAL_LABELS,
  type UpdateReminderSettingsInput,
  type ReminderInterval,
} from "@/lib/validations/reminder";

type ReminderSettingsFormProps = {
  initialSettings?: {
    daysBefore: number[];
    emailEnabled: boolean;
  };
};

export function ReminderSettingsForm({
  initialSettings,
}: ReminderSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(!initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<UpdateReminderSettingsInput>({
    resolver: zodResolver(updateReminderSettingsSchema),
    defaultValues: {
      daysBefore: initialSettings?.daysBefore ?? [30, 14, 7, 0],
      emailEnabled: initialSettings?.emailEnabled ?? true,
    },
  });

  // Fetch settings if not provided
  useEffect(() => {
    if (initialSettings) return;

    async function fetchSettings() {
      try {
        const response = await fetch("/api/settings/reminders");
        if (response.ok) {
          const data = await response.json();
          form.reset({
            daysBefore: data.daysBefore,
            emailEnabled: data.emailEnabled,
          });
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        toast.error("Failed to load reminder settings");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, [initialSettings, form]);

  const handleSubmit = async (data: UpdateReminderSettingsInput) => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/settings/reminders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      toast.success("Reminder settings saved");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save reminder settings");
    } finally {
      setIsSaving(false);
    }
  };

  const emailEnabled = form.watch("emailEnabled");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reminder Settings</CardTitle>
          <CardDescription>Loading your preferences...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reminder Settings</CardTitle>
        <CardDescription>
          Choose when and how you want to be reminded about upcoming occasions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Email Enabled Toggle */}
            <FormField
              control={form.control}
              name="emailEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Email Notifications
                    </FormLabel>
                    <FormDescription>
                      Receive email reminders for upcoming occasions
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Reminder Intervals */}
            <FormField
              control={form.control}
              name="daysBefore"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">
                      Reminder Schedule
                    </FormLabel>
                    <FormDescription>
                      Select when you want to receive reminders before each
                      occasion.
                    </FormDescription>
                  </div>
                  <div className="space-y-3">
                    {REMINDER_INTERVALS.map((interval) => (
                      <FormField
                        key={interval}
                        control={form.control}
                        name="daysBefore"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={interval}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(interval)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          interval,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== interval
                                          )
                                        );
                                  }}
                                  disabled={!emailEnabled}
                                />
                              </FormControl>
                              <FormLabel
                                className={`font-normal ${!emailEnabled ? "text-muted-foreground" : ""}`}
                              >
                                {
                                  REMINDER_INTERVAL_LABELS[
                                    interval as ReminderInterval
                                  ]
                                }
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
