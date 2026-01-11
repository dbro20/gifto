/**
 * Amazon Affiliate Link Utilities
 *
 * Creates clean affiliate links with the appropriate tracking tag
 * and handles multiple Amazon domains.
 */

import { extractASIN } from "./extract-asin";

// List of Amazon domains to recognize
const AMAZON_DOMAINS = [
  "amazon.com",
  "amazon.co.uk",
  "amazon.ca",
  "amazon.de",
  "amazon.fr",
  "amazon.es",
  "amazon.it",
  "amazon.co.jp",
  "amazon.in",
  "amazon.com.br",
  "amazon.com.mx",
  "amazon.com.au",
  "amazon.nl",
  "amazon.sg",
  "amazon.sa",
  "amazon.ae",
  "amazon.se",
  "amazon.pl",
  "amazon.com.tr",
  "amazon.eg",
];

// Regex to match Amazon domains (with optional www. prefix)
const AMAZON_DOMAIN_REGEX = new RegExp(
  `^(?:https?://)?(?:www\\.)?(${AMAZON_DOMAINS.map((d) =>
    d.replace(/\./g, "\\.")
  ).join("|")})`,
  "i"
);

/**
 * Check if a URL is an Amazon URL
 *
 * @param url - The URL to check
 * @returns True if the URL is from Amazon, false otherwise
 *
 * @example
 * isAmazonUrl('https://www.amazon.com/dp/B08N5WRWNW') // true
 * isAmazonUrl('https://amazon.co.uk/some-product') // true
 * isAmazonUrl('https://ebay.com/item/12345') // false
 */
export function isAmazonUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  // Also check for simple "amazon" in the hostname for edge cases
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    // Check against known domains
    if (AMAZON_DOMAIN_REGEX.test(url)) {
      return true;
    }

    // Fallback: check if hostname contains amazon
    return hostname.includes("amazon.");
  } catch {
    // If URL parsing fails, do a simple string check
    return url.toLowerCase().includes("amazon.");
  }
}

/**
 * Extract the Amazon domain from a URL
 *
 * @param url - The Amazon URL
 * @returns The Amazon domain (e.g., 'amazon.com', 'amazon.co.uk') or null
 */
export function extractAmazonDomain(url: string): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    // Remove www. prefix if present
    const cleanHostname = hostname.replace(/^www\./, "");

    // Check if it's a known Amazon domain
    const matchedDomain = AMAZON_DOMAINS.find(
      (domain) => cleanHostname === domain || cleanHostname.endsWith(`.${domain}`)
    );

    return matchedDomain ?? null;
  } catch {
    return null;
  }
}

/**
 * Convert an Amazon URL to a clean affiliate link
 *
 * Creates a minimal, clean URL with just the ASIN and affiliate tag.
 *
 * @param url - The original Amazon URL
 * @param asin - The product ASIN
 * @param affiliateTag - The affiliate tag to use (defaults to env var)
 * @returns A clean affiliate URL
 *
 * @example
 * convertToAffiliateLink('https://www.amazon.com/long-product-name/dp/B08N5WRWNW/ref=sr_1_1', 'B08N5WRWNW')
 * // Returns: 'https://www.amazon.com/dp/B08N5WRWNW?tag=gifto0a8-20'
 */
export function convertToAffiliateLink(
  url: string,
  asin: string,
  affiliateTag?: string
): string {
  const tag = affiliateTag ?? process.env.AMAZON_AFFILIATE_TAG ?? "gifto0a8-20";

  // Extract the domain from the original URL to preserve regional store
  const domain = extractAmazonDomain(url) ?? "amazon.com";

  // Create a clean, minimal affiliate URL
  return `https://www.${domain}/dp/${asin}?tag=${tag}`;
}

/**
 * Process a URL for storage
 *
 * If it's an Amazon URL with a valid ASIN, returns the affiliate link info.
 * Otherwise, returns the original URL unchanged.
 *
 * @param url - The URL to process
 * @param affiliateTag - Optional affiliate tag override
 * @returns Object with processed URL info
 */
export function processUrl(
  url: string,
  affiliateTag?: string
): {
  url: string;
  originalUrl: string;
  asin: string | null;
  isAmazon: boolean;
} {
  const isAmazon = isAmazonUrl(url);
  const asin = isAmazon ? extractASIN(url) : null;

  if (isAmazon && asin) {
    return {
      url: convertToAffiliateLink(url, asin, affiliateTag),
      originalUrl: url,
      asin,
      isAmazon: true,
    };
  }

  return {
    url,
    originalUrl: url,
    asin: null,
    isAmazon: false,
  };
}
