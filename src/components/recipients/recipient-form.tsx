"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createRecipientSchema,
  RELATIONSHIP_OPTIONS,
  type CreateRecipientInput,
} from "@/lib/validations/recipient";
import type { Recipient } from "@/types";

interface RecipientFormProps {
  recipient?: Recipient;
  mode: "create" | "edit";
}

export function RecipientForm({ recipient, mode }: RecipientFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomRelationship, setShowCustomRelationship] = useState(false);

  const form = useForm<CreateRecipientInput>({
    resolver: zodResolver(createRecipientSchema),
    defaultValues: {
      name: recipient?.name ?? "",
      relationship: recipient?.relationship ?? "",
      notes: recipient?.notes ?? "",
    },
  });

  // Check if the current relationship is a custom value
  const currentRelationship = form.watch("relationship");
  const isCustomRelationship =
    currentRelationship &&
    !RELATIONSHIP_OPTIONS.some((opt) => opt.value === currentRelationship);

  async function onSubmit(data: CreateRecipientInput) {
    setIsSubmitting(true);

    try {
      const url =
        mode === "create"
          ? "/api/recipients"
          : `/api/recipients/${recipient?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save recipient");
      }

      const savedRecipient = await response.json();
      router.push(`/recipients/${savedRecipient.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error saving recipient:", error);
      // Could add toast notification here
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
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter recipient's name" {...field} />
              </FormControl>
              <FormDescription>
                The name of the person you want to track gifts for.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="relationship"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship</FormLabel>
              {showCustomRelationship || isCustomRelationship ? (
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder="Enter custom relationship"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCustomRelationship(false);
                      field.onChange("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Select
                  onValueChange={(value) => {
                    if (value === "__custom__") {
                      setShowCustomRelationship(true);
                      field.onChange("");
                    } else {
                      field.onChange(value);
                    }
                  }}
                  defaultValue={field.value ?? undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select relationship type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="__custom__">
                      + Custom relationship
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
              <FormDescription>
                How this person is related to you.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any notes about this person (interests, sizes, preferences...)"
                  className="min-h-24"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Optional notes to help you remember gift preferences.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
                ? "Create Recipient"
                : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
