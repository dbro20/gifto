"use client";

import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecipientFilterProps {
  recipients: Array<{ id: string; name: string; relationship: string | null }>;
  selectedRecipientId?: string;
}

export function RecipientFilter({
  recipients,
  selectedRecipientId,
}: RecipientFilterProps) {
  const router = useRouter();

  function handleValueChange(value: string) {
    if (value === "all") {
      router.push("/gifts");
    } else {
      router.push(`/gifts?recipientId=${value}`);
    }
  }

  return (
    <Select
      value={selectedRecipientId ?? "all"}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="All recipients" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All recipients</SelectItem>
        {recipients.map((recipient) => (
          <SelectItem key={recipient.id} value={recipient.id}>
            {recipient.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
