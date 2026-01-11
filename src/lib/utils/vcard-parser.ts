export interface ParsedContact {
  name: string;
  birthday: string | null;
  email?: string;
}

/**
 * Parse a vCard file content and extract contacts with birthdays
 */
export function parseVCard(content: string): ParsedContact[] {
  const contacts: ParsedContact[] = [];
  const vcards = content.split("END:VCARD");

  for (const vcard of vcards) {
    if (!vcard.includes("BEGIN:VCARD")) continue;

    let name = "";
    let birthday: string | null = null;
    let email: string | undefined;

    const lines = vcard.split(/\r?\n/);

    for (const line of lines) {
      // Parse name (FN = Formatted Name)
      if (line.startsWith("FN:") || line.startsWith("FN;")) {
        name = line.split(":").slice(1).join(":").trim();
      }

      // Parse name from N field if FN not found
      if (!name && (line.startsWith("N:") || line.startsWith("N;"))) {
        const parts = line.split(":").slice(1).join(":").split(";");
        const lastName = parts[0]?.trim() || "";
        const firstName = parts[1]?.trim() || "";
        name = `${firstName} ${lastName}`.trim();
      }

      // Parse birthday (BDAY)
      if (line.startsWith("BDAY:") || line.startsWith("BDAY;")) {
        const bdayValue = line.split(":").slice(1).join(":").trim();
        birthday = parseBirthday(bdayValue);
      }

      // Parse email
      if (line.startsWith("EMAIL:") || line.startsWith("EMAIL;")) {
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
  // Remove any dashes and whitespace
  const cleaned = value.replace(/[-\s]/g, "");

  // Format: YYYYMMDD
  if (/^\d{8}$/.test(cleaned)) {
    const year = cleaned.slice(0, 4);
    const month = cleaned.slice(4, 6);
    const day = cleaned.slice(6, 8);
    return `${year}-${month}-${day}`;
  }

  // Format: --MMDD (year unknown, common in Apple Contacts)
  if (/^--?\d{4}$/.test(value.replace(/\s/g, ""))) {
    const digits = value.replace(/[^0-9]/g, "");
    const month = digits.slice(0, 2);
    const day = digits.slice(2, 4);
    return `2000-${month}-${day}`; // Use 2000 as placeholder year
  }

  // Format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  // Try to parse as date
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  } catch {
    // Ignore parse errors
  }

  return null;
}
