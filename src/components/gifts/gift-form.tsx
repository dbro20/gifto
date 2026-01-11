"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  createGiftIdeaSchema,
  type CreateGiftIdeaInput,
} from "@/lib/validations/gift-idea";
import type { GiftIdea, Recipient } from "@/types";

interface GiftFormProps {
  giftIdea?: GiftIdea;
  recipients: Recipient[];
  defaultRecipientId?: string;
  mode: "create" | "edit";
}

/**
 * Check if a URL appears to be an Amazon URL
 */
function isAmazonUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  return url.toLowerCase().includes("amazon.");
}

export function GiftForm({
  giftIdea,
  recipients,
  defaultRecipientId,
  mode,
}: GiftFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAmazon, setIsAmazon] = useState(false);

  const form = useForm<CreateGiftIdeaInput>({
    resolver: zodResolver(createGiftIdeaSchema),
    defaultValues: {
      recipientId: giftIdea?.recipientId ?? defaultRecipientId ?? "",
      title: giftIdea?.title ?? "",
      description: giftIdea?.description ?? "",
      url: giftIdea?.originalUrl ?? giftIdea?.url ?? "",
      price: giftIdea?.price ?? "",
    },
  });

  // Watch URL field for Amazon detection
  const watchedUrl = form.watch("url");

  useEffect(() => {
    setIsAmazon(isAmazonUrl(watchedUrl ?? ""));
  }, [watchedUrl]);

  async function onSubmit(data: CreateGiftIdeaInput) {
    setIsSubmitting(true);

    try {
      const url =
        mode === "create"
          ? "/api/gift-ideas"
          : `/api/gift-ideas/${giftIdea?.id}`;
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
        throw new Error(error.error || "Failed to save gift idea");
      }

      const savedGiftIdea = await response.json();
      router.push(`/gifts/${savedGiftIdea.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error saving gift idea:", error);
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
          name="recipientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a recipient" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {recipients.map((recipient) => (
                    <SelectItem key={recipient.id} value={recipient.id}>
                      {recipient.name}
                      {recipient.relationship && (
                        <span className="text-muted-foreground ml-2">
                          ({recipient.relationship})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Who is this gift idea for?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="Enter gift idea title" {...field} />
              </FormControl>
              <FormDescription>
                A brief name for this gift idea.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any notes about this gift idea..."
                  className="min-h-24"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Optional details like size, color, or why you think they would
                like it.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                URL
                {isAmazon && (
                  <Badge variant="secondary" className="ml-2">
                    Amazon - Affiliate Link
                  </Badge>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                {isAmazon
                  ? "Amazon URLs will be converted to affiliate links automatically."
                  : "Link to the product page."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="text"
                    placeholder="0.00"
                    className="pl-7"
                    {...field}
                    value={field.value ?? ""}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Current price of the item (optional).
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
                ? "Create Gift Idea"
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
