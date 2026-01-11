"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  occasionFormSchema,
  OCCASION_TYPES,
  type OccasionFormInput,
} from "@/lib/validations/occasion";
import { cn } from "@/lib/utils";

// Parse YYYY-MM-DD string to local Date to avoid timezone issues
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

type Recipient = {
  id: string;
  name: string;
  relationship: string | null;
};

type OccasionFormProps = {
  recipients?: Recipient[];
  defaultValues?: Partial<OccasionFormInput>;
  onSubmit: (data: OccasionFormInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
};

export function OccasionForm({
  recipients = [],
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Create Occasion",
}: OccasionFormProps) {
  const [showCustomType, setShowCustomType] = useState(false);
  const [customType, setCustomType] = useState("");

  const form = useForm<OccasionFormInput>({
    resolver: zodResolver(occasionFormSchema),
    defaultValues: {
      recipientId: defaultValues?.recipientId ?? "",
      occasionType: defaultValues?.occasionType ?? "",
      date: defaultValues?.date ?? "",
      isAnnual: defaultValues?.isAnnual ?? false,
      notes: defaultValues?.notes ?? "",
    },
  });

  // Check if the default occasion type is a custom one
  useEffect(() => {
    if (
      defaultValues?.occasionType &&
      !OCCASION_TYPES.includes(
        defaultValues.occasionType as (typeof OCCASION_TYPES)[number]
      )
    ) {
      setShowCustomType(true);
      setCustomType(defaultValues.occasionType);
    }
  }, [defaultValues?.occasionType]);

  const handleOccasionTypeChange = (value: string) => {
    if (value === "Other") {
      setShowCustomType(true);
      form.setValue("occasionType", customType || "");
    } else {
      setShowCustomType(false);
      setCustomType("");
      form.setValue("occasionType", value);
    }
  };

  const handleCustomTypeChange = (value: string) => {
    setCustomType(value);
    form.setValue("occasionType", value);
  };

  const handleFormSubmit = async (data: OccasionFormInput) => {
    await onSubmit(data);
  };

  const selectedOccasionType = form.watch("occasionType");
  const isPresetType = OCCASION_TYPES.includes(
    selectedOccasionType as (typeof OCCASION_TYPES)[number]
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        {/* Recipient Select */}
        <FormField
          control={form.control}
          name="recipientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a recipient" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {recipients.length === 0 ? (
                    <SelectItem value="no-recipients" disabled>
                      No recipients found. Add one first.
                    </SelectItem>
                  ) : (
                    recipients.map((recipient) => (
                      <SelectItem key={recipient.id} value={recipient.id}>
                        {recipient.name}
                        {recipient.relationship &&
                          ` (${recipient.relationship})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Occasion Type Select */}
        <FormField
          control={form.control}
          name="occasionType"
          render={() => (
            <FormItem>
              <FormLabel>Occasion Type</FormLabel>
              <Select
                onValueChange={handleOccasionTypeChange}
                defaultValue={isPresetType ? selectedOccasionType : "Other"}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an occasion type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {OCCASION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showCustomType && (
                <Input
                  placeholder="Enter custom occasion type"
                  value={customType}
                  onChange={(e) => handleCustomTypeChange(e.target.value)}
                  className="mt-2"
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Picker */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(parseLocalDate(field.value), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? parseLocalDate(field.value) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(format(date, "yyyy-MM-dd"));
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Is Annual Checkbox */}
        <FormField
          control={form.control}
          name="isAnnual"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Annual Occasion</FormLabel>
                <FormDescription>
                  Check this if the occasion repeats every year (e.g., birthday,
                  anniversary)
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional notes about this occasion..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
