"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OCCASION_TYPES } from "@/lib/validations/occasion";
import type { Recipient } from "@/types";

// Auto-populate dates for certain holidays
const AUTO_DATES: Record<string, string> = {
  "Valentine's Day": "2000-02-14",
  "Mother's Day": "2000-05-12",
  "Father's Day": "2000-06-16",
  "Christmas": "2000-12-25",
};

const occasionSchema = z.object({
  id: z.string().optional(),
  occasionType: z.string().min(1, "Required"),
  date: z.string().min(1, "Required"),
  isAnnual: z.boolean(),
});

const recipientWithOccasionsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  notes: z.string().optional(),
  occasions: z.array(occasionSchema).min(1, "At least one date is required"),
});

type FormInput = z.infer<typeof recipientWithOccasionsSchema>;

type OccasionData = {
  id: string;
  occasionType: string;
  date: string;
  isAnnual: boolean;
};

interface RecipientFormProps {
  recipient?: Recipient;
  occasions?: OccasionData[];
  mode: "create" | "edit";
}

export function RecipientForm({ recipient, occasions, mode }: RecipientFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultOccasions = mode === "create"
    ? [{ occasionType: "Birthday", date: "", isAnnual: true }]
    : (occasions || []).map((o) => ({
        id: o.id,
        occasionType: o.occasionType,
        date: o.date,
        isAnnual: o.isAnnual,
      }));

  const form = useForm<FormInput>({
    resolver: zodResolver(recipientWithOccasionsSchema),
    defaultValues: {
      name: recipient?.name ?? "",
      notes: recipient?.notes ?? "",
      occasions: defaultOccasions.length > 0 ? defaultOccasions : [{ occasionType: "Birthday", date: "", isAnnual: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "occasions",
  });

  async function onSubmit(data: FormInput) {
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const response = await fetch("/api/recipients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            notes: data.notes,
            occasions: data.occasions,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to save");
        }

        const savedRecipient = await response.json();
        router.push(`/recipients/${savedRecipient.id}`);
        router.refresh();
      } else {
        const response = await fetch(`/api/recipients/${recipient?.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            notes: data.notes,
            occasions: data.occasions,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to save");
        }

        const savedRecipient = await response.json();
        router.push(`/recipients/${savedRecipient.id}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel style={{ color: "#8b7355", fontFamily: "'Kalam', cursive" }}>Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter their name"
                  {...field}
                  className="border-2"
                  style={{
                    borderColor: "#e8d5c4",
                    background: "#fffcf7",
                    color: "#6b5a45",
                    fontFamily: "'Kalam', cursive",
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel className="text-base" style={{ color: "#8b7355", fontFamily: "'Kalam', cursive" }}>Special Dates *</FormLabel>
          <div
            className="p-4 border-2 border-dashed rounded-lg space-y-3"
            style={{ borderColor: "#e8d5c4", background: "#fffcf7" }}
          >
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-end">
                <FormField
                  control={form.control}
                  name={`occasions.${index}.occasionType`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      {index === 0 && <FormLabel className="text-sm">Type</FormLabel>}
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (AUTO_DATES[value]) {
                            form.setValue(`occasions.${index}.date`, AUTO_DATES[value]);
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`occasions.${index}.date`}
                  render={({ field }) => {
                    const [month, day] = field.value
                      ? field.value.includes("-") && field.value.split("-").length === 3
                        ? [field.value.split("-")[1], field.value.split("-")[2]]
                        : field.value.split("-")
                      : ["", ""];

                    const updateDate = (newMonth: string, newDay: string) => {
                      if (newMonth && newDay) {
                        field.onChange(`2000-${newMonth.padStart(2, "0")}-${newDay.padStart(2, "0")}`);
                      } else if (newMonth || newDay) {
                        field.onChange(`${newMonth || ""}-${newDay || ""}`);
                      } else {
                        field.onChange("");
                      }
                    };

                    return (
                      <FormItem>
                        {index === 0 && <FormLabel className="text-sm">Date</FormLabel>}
                        <div className="flex gap-1">
                          <Select value={month} onValueChange={(m) => updateDate(m, day)}>
                            <FormControl>
                              <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Month" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[
                                { value: "01", label: "Jan" },
                                { value: "02", label: "Feb" },
                                { value: "03", label: "Mar" },
                                { value: "04", label: "Apr" },
                                { value: "05", label: "May" },
                                { value: "06", label: "Jun" },
                                { value: "07", label: "Jul" },
                                { value: "08", label: "Aug" },
                                { value: "09", label: "Sep" },
                                { value: "10", label: "Oct" },
                                { value: "11", label: "Nov" },
                                { value: "12", label: "Dec" },
                              ].map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={day} onValueChange={(d) => updateDate(month, d)}>
                            <FormControl>
                              <SelectTrigger className="w-[70px]">
                                <SelectValue placeholder="Day" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 31 }, (_, i) => {
                                const d = String(i + 1).padStart(2, "0");
                                return (
                                  <SelectItem key={d} value={d}>
                                    {i + 1}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 transition-all duration-200 hover:scale-105"
              style={{ color: "#b5a088", fontFamily: "'Kalam', cursive" }}
              onClick={() => append({ occasionType: "Birthday", date: "", isAnnual: true })}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add date
            </Button>
          </div>

          {form.formState.errors.occasions?.root && (
            <p className="text-sm" style={{ color: "#c97a7a" }}>
              {form.formState.errors.occasions.root.message}
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel style={{ color: "#8b7355", fontFamily: "'Kalam', cursive" }}>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Interests, sizes, preferences..."
                  className="min-h-20 border-2"
                  {...field}
                  value={field.value ?? ""}
                  style={{
                    borderColor: "#e8d5c4",
                    background: "#fffcf7",
                    color: "#6b5a45",
                    fontFamily: "'Kalam', cursive",
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="transition-all duration-200 hover:scale-105"
            style={{
              background: "#8b7355",
              color: "#fffcf7",
              fontFamily: "'Kalam', cursive",
            }}
          >
            {isSubmitting
              ? "Saving..."
              : mode === "create"
                ? "Add Person"
                : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="border-2 transition-all duration-200 hover:scale-105"
            style={{
              borderColor: "#e8d5c4",
              background: "#f5ebe0",
              color: "#8b7355",
              fontFamily: "'Kalam', cursive",
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
