/**
 * Amazon ASIN Extraction Utilities
 *
 * ASINs (Amazon Standard Identification Numbers) are always 10 alphanumeric characters.
 * They typically start with B0 for products or numbers for books (ISBNs).
 */

// ASIN regex pattern - 10 alphanumeric characters
const ASIN_PATTERN = /^[A-Z0-9]{10}$/i;

// Various Amazon URL patterns that contain ASINs
const ASIN_URL_PATTERNS = [
  // /dp/ASIN - most common product page format
  /\/dp\/([A-Z0-9]{10})/i,
  // /gp/product/ASIN - older product page format
  /\/gp\/product\/([A-Z0-9]{10})/i,
  // /gp/aw/d/ASIN - mobile product pages
  /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
  // /exec/obidos/ASIN/ - legacy format
  /\/exec\/obidos\/ASIN\/([A-Z0-9]{10})/i,
  // /o/ASIN/ - another legacy format
  /\/o\/([A-Z0-9]{10})/i,
  // /product-reviews/ASIN - review pages
  /\/product-reviews\/([A-Z0-9]{10})/i,
  // ASIN= query parameter
  /[?&]ASIN=([A-Z0-9]{10})/i,
];

/**
 * Extract ASIN from an Amazon URL
 *
 * @param url - The Amazon URL to extract ASIN from
 * @returns The ASIN if found, null otherwise
 *
 * @example
 * extractASIN('https://www.amazon.com/dp/B08N5WRWNW') // 'B08N5WRWNW'
 * extractASIN('https://www.amazon.co.uk/gp/product/B08N5WRWNW') // 'B08N5WRWNW'
 * extractASIN('https://amazon.de/Some-Product-Name/dp/B08N5WRWNW/ref=sr_1_1') // 'B08N5WRWNW'
 */
export function extractASIN(url: string): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  // Try to parse as URL to handle various formats
  let urlPath: string;
  try {
    const parsedUrl = new URL(url);
    urlPath = parsedUrl.pathname + parsedUrl.search;
  } catch {
    // If not a valid URL, try to extract from the string directly
    urlPath = url;
  }

  // Try each pattern
  for (const pattern of ASIN_URL_PATTERNS) {
    const match = urlPath.match(pattern);
    if (match && match[1]) {
      const asin = match[1].toUpperCase();
      // Validate it looks like an ASIN
      if (ASIN_PATTERN.test(asin)) {
        return asin;
      }
    }
  }

  return null;
}

/**
 * Validate if a string is a valid ASIN format
 *
 * @param asin - The string to validate
 * @returns True if valid ASIN format, false otherwise
 */
export function isValidASIN(asin: string): boolean {
  return ASIN_PATTERN.test(asin);
}
