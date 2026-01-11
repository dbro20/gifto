"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { parseVCard, ParsedContact } from "@/lib/utils/vcard-parser";
import { Upload, Loader2, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ImportContact extends ParsedContact {
  selected: boolean;
}

export default function ImportContactsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [contacts, setContacts] = useState<ImportContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Google contacts data from URL
  useEffect(() => {
    const source = searchParams.get("source");
    const data = searchParams.get("data");

    if (source === "google" && data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data));
        setContacts(
          parsed.map((c: ParsedContact) => ({ ...c, selected: true }))
        );
      } catch {
        setError("Failed to parse contacts data");
      }
    }
  }, [searchParams]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const content = await file.text();
      const parsed = parseVCard(content);
      const withBirthdays = parsed.filter((c) => c.birthday);

      if (withBirthdays.length === 0) {
        setError("No contacts with birthdays found in the file");
        setContacts([]);
      } else {
        setContacts(withBirthdays.map((c) => ({ ...c, selected: true })));
      }
    } catch {
      setError("Failed to parse vCard file");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleContact = (index: number) => {
    setContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, selected: !c.selected } : c))
    );
  };

  const toggleAll = () => {
    const allSelected = contacts.every((c) => c.selected);
    setContacts((prev) => prev.map((c) => ({ ...c, selected: !allSelected })));
  };

  const handleImport = async () => {
    const selected = contacts.filter((c) => c.selected);
    if (selected.length === 0) return;

    setIsImporting(true);
    setError(null);

    try {
      const response = await fetch("/api/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: selected }),
      });

      if (!response.ok) {
        throw new Error("Import failed");
      }

      setImportComplete(true);
      setTimeout(() => {
        router.push("/recipients");
      }, 1500);
    } catch {
      setError("Failed to import contacts");
    } finally {
      setIsImporting(false);
    }
  };

  const selectedCount = contacts.filter((c) => c.selected).length;

  if (importComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-green-100 p-4 mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Import Complete!</h2>
        <p className="text-muted-foreground">
          Redirecting to recipients...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/recipients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Import Birthdays</h2>
          <p className="text-muted-foreground">
            Import birthdays from Apple Contacts
          </p>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div>
          {/* Apple Contacts (vCard) */}
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Apple Contacts
              </CardTitle>
              <CardDescription>
                Export your contacts as a vCard file and upload it here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">How to export from Apple Contacts:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Open Contacts app on Mac</li>
                  <li>Select contacts or press Cmd+A for all</li>
                  <li>File → Export → Export vCard</li>
                  <li>Upload the .vcf file below</li>
                </ol>
              </div>
              <label className="block">
                <input
                  type="file"
                  accept=".vcf,.vcard"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button variant="outline" className="w-full" asChild>
                  <span>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload vCard File
                  </span>
                </Button>
              </label>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Select Contacts to Import</CardTitle>
                <CardDescription>
                  {contacts.length} contacts with birthdays found
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={toggleAll}>
                {contacts.every((c) => c.selected) ? "Deselect All" : "Select All"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {contacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                  onClick={() => toggleContact(index)}
                >
                  <Checkbox
                    checked={contact.selected}
                    onCheckedChange={() => toggleContact(index)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">
                      🎂 {formatBirthday(contact.birthday!)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <p className="text-sm text-destructive mt-4">{error}</p>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setContacts([])}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={selectedCount === 0 || isImporting}
                className="flex-1"
              >
                {isImporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Import {selectedCount} Contact{selectedCount !== 1 ? "s" : ""}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && contacts.length === 0 && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

function formatBirthday(date: string): string {
  try {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  } catch {
    return date;
  }
}
