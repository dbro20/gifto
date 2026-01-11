"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { GiftIdea, Recipient } from "@/types";

const createGiftFormSchema = z.object({
  recipientIds: z.array(z.string().uuid()).min(1, "Select at least one person"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  url: z
    .string()
    .url("Invalid URL format")
    .max(2000, "URL must be less than 2000 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
});

type FormInput = z.infer<typeof createGiftFormSchema>;

interface GiftFormProps {
  giftIdea?: GiftIdea;
  recipients: Recipient[];
  defaultRecipientId?: string;
  mode: "create" | "edit";
}

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
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<FormInput>({
    resolver: zodResolver(createGiftFormSchema),
    defaultValues: {
      recipientIds: giftIdea?.recipientId
        ? [giftIdea.recipientId]
        : defaultRecipientId
          ? [defaultRecipientId]
          : [],
      title: giftIdea?.title ?? "",
      url: giftIdea?.originalUrl ?? giftIdea?.url ?? "",
    },
  });

  const watchedUrl = form.watch("url");
  const selectedIds = form.watch("recipientIds");

  useEffect(() => {
    setIsAmazon(isAmazonUrl(watchedUrl ?? ""));
  }, [watchedUrl]);

  const filteredRecipients = useMemo(() => {
    if (!searchQuery) return recipients;
    return recipients.filter((r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recipients, searchQuery]);

  const selectedRecipients = useMemo(() => {
    return recipients.filter((r) => selectedIds.includes(r.id));
  }, [recipients, selectedIds]);

  const toggleRecipient = (recipientId: string) => {
    const current = form.getValues("recipientIds");
    if (current.includes(recipientId)) {
      form.setValue(
        "recipientIds",
        current.filter((id) => id !== recipientId),
        { shouldValidate: true }
      );
    } else {
      form.setValue("recipientIds", [...current, recipientId], {
        shouldValidate: true,
      });
    }
  };

  const removeRecipient = (recipientId: string) => {
    const current = form.getValues("recipientIds");
    form.setValue(
      "recipientIds",
      current.filter((id) => id !== recipientId),
      { shouldValidate: true }
    );
  };

  async function onSubmit(data: FormInput) {
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        // Create gift for each selected recipient
        const response = await fetch("/api/gift-ideas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientIds: data.recipientIds,
            title: data.title,
            url: data.url,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to save gift idea");
        }

        router.push("/gifts");
        router.refresh();
      } else {
        // Edit mode - update single gift
        const response = await fetch(`/api/gift-ideas/${giftIdea?.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientId: data.recipientIds[0],
            title: data.title,
            url: data.url,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to save gift idea");
        }

        const savedGiftIdea = await response.json();
        router.push(`/gifts/${savedGiftIdea.id}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving gift idea:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="recipientIds"
          render={() => (
            <FormItem>
              <FormLabel>{mode === "create" ? "People *" : "Person *"}</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between font-normal"
                    >
                      {selectedIds.length === 0
                        ? "Search and select people..."
                        : `${selectedIds.length} selected`}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search people..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>No people found.</CommandEmpty>
                      <CommandGroup>
                        {filteredRecipients.map((recipient) => (
                          <CommandItem
                            key={recipient.id}
                            value={recipient.id}
                            onSelect={() => toggleRecipient(recipient.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedIds.includes(recipient.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {recipient.name}
                            {recipient.relationship && (
                              <span className="ml-2 text-muted-foreground">
                                ({recipient.relationship})
                              </span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedRecipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedRecipients.map((recipient) => (
                    <Badge
                      key={recipient.id}
                      variant="secondary"
                      className="gap-1"
                    >
                      {recipient.name}
                      <button
                        type="button"
                        onClick={() => removeRecipient(recipient.id)}
                        className="ml-1 rounded-full hover:bg-muted-foreground/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <FormDescription>
                {mode === "create"
                  ? "Select one or more people for this gift idea."
                  : "Who is this gift idea for?"}
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
                  : "Link to the product page (optional)."}
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
                ? "Add Gift Idea"
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
