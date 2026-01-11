export interface ParsedContact {
  name: string;
  birthday: string | null;
  email?: string;
}

/**
 * Unfold vCard lines (lines can be folded by starting continuation with space/tab)
 */
function unfoldLines(content: string): string {
  return content.replace(/\r?\n[ \t]/g, "");
}

/**
 * Parse a vCard or ICS file content and extract contacts with birthdays
 */
export function parseVCard(content: string): ParsedContact[] {
  // Check if this is an ICS (iCalendar) file
  if (content.includes("BEGIN:VCALENDAR") || content.includes("BEGIN:VEVENT")) {
    return parseICS(content);
  }

  // Unfold lines first (handle line continuations)
  const unfoldedContent = unfoldLines(content);

  const contacts: ParsedContact[] = [];
  const vcards = unfoldedContent.split("END:VCARD");

  for (const vcard of vcards) {
    if (!vcard.includes("BEGIN:VCARD")) continue;

    let name = "";
    let birthday: string | null = null;
    let email: string | undefined;

    const lines = vcard.split(/\r?\n/);

    for (const line of lines) {
      // Normalize the line - get the property name
      // Handle itemN. prefixes that Apple uses (e.g., "item1.BDAY:")
      const upperLine = line.toUpperCase();
      const normalizedLine = upperLine.replace(/^ITEM\d+\./, "");

      // Parse name (FN = Formatted Name)
      if (normalizedLine.startsWith("FN:") || normalizedLine.startsWith("FN;")) {
        name = line.split(":").slice(1).join(":").trim();
      }

      // Parse name from N field if FN not found
      if (!name && (normalizedLine.startsWith("N:") || normalizedLine.startsWith("N;"))) {
        const parts = line.split(":").slice(1).join(":").split(";");
        const lastName = parts[0]?.trim() || "";
        const firstName = parts[1]?.trim() || "";
        name = `${firstName} ${lastName}`.trim();
      }

      // Parse birthday (BDAY) - case insensitive, handle Apple prefixes
      if (normalizedLine.startsWith("BDAY:") || normalizedLine.startsWith("BDAY;")) {
        const bdayValue = line.split(":").slice(1).join(":").trim();
        birthday = parseBirthday(bdayValue);
      }

      // Parse email
      if (normalizedLine.startsWith("EMAIL:") || normalizedLine.startsWith("EMAIL;")) {
        email = line.split(":").slice(1).join(":").trim();
      }
    }

    if (name) {
      contacts.push({ name, birthday, email });
    }
  }

  return contacts;
}

/**
 * Parse various birthday formats into YYYY-MM-DD
 */
function parseBirthday(value: string): string | null {
  // Remove any dashes and whitespace for initial parsing
  const cleaned = value.replace(/[-\s]/g, "");

  // Format: YYYYMMDD
  if (/^\d{8}$/.test(cleaned)) {
    const year = cleaned.slice(0, 4);
    const month = cleaned.slice(4, 6);
    const day = cleaned.slice(6, 8);
    // Apple uses 1604 as a placeholder year when year is unknown
    if (year === "1604") {
      return `2000-${month}-${day}`;
    }
    return `${year}-${month}-${day}`;
  }

  // Format: --MMDD (year unknown, common in Apple Contacts)
  if (/^--?\d{4}$/.test(value.replace(/\s/g, ""))) {
    const digits = value.replace(/[^0-9]/g, "");
    const month = digits.slice(0, 2);
    const day = digits.slice(2, 4);
    return `2000-${month}-${day}`; // Use 2000 as placeholder year
  }

  // Format: --MM-DD (ISO 8601 with unknown year)
  if (/^--\d{2}-\d{2}$/.test(value)) {
    const month = value.slice(2, 4);
    const day = value.slice(5, 7);
    return `2000-${month}-${day}`;
  }

  // Format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const year = value.slice(0, 4);
    // Apple uses 1604 as a placeholder year when year is unknown
    if (year === "1604") {
      return `2000-${value.slice(5)}`;
    }
    return value;
  }

  // Try to parse as date
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      // Apple uses 1604 as a placeholder year when year is unknown
      if (year === 1604) {
        return `2000-${month}-${day}`;
      }
      return `${year}-${month}-${day}`;
    }
  } catch {
    // Ignore parse errors
  }

  return null;
}

/**
 * Parse ICS (iCalendar) file for birthday events
 */
function parseICS(content: string): ParsedContact[] {
  const contacts: ParsedContact[] = [];

  // Unfold lines first
  const unfoldedContent = unfoldLines(content);
  const events = unfoldedContent.split("END:VEVENT");

  for (const event of events) {
    if (!event.includes("BEGIN:VEVENT")) continue;

    let name = "";
    let birthday: string | null = null;

    const lines = event.split(/\r?\n/);

    for (const line of lines) {
      const upperLine = line.toUpperCase();

      // Parse SUMMARY (contains the person's name for birthday events)
      if (upperLine.startsWith("SUMMARY:") || upperLine.startsWith("SUMMARY;")) {
        const summary = line.split(":").slice(1).join(":").trim();
        // Apple format: "John Doe's Birthday" or "Birthday - John Doe"
        name = summary
          .replace(/'s Birthday$/i, "")
          .replace(/^Birthday\s*[-–—]\s*/i, "")
          .replace(/\s*Birthday$/i, "")
          .trim();
      }

      // Parse DTSTART (the birthday date)
      if (upperLine.startsWith("DTSTART:") || upperLine.startsWith("DTSTART;")) {
        const dateValue = line.split(":").slice(1).join(":").trim();
        birthday = parseBirthday(dateValue);
      }
    }

    if (name && birthday) {
      contacts.push({ name, birthday });
    }
  }

  return contacts;
}
