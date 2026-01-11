# Gifto - Gift Tracking Web App Implementation Plan

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Auth:** Clerk
- **Database:** PostgreSQL (Supabase)
- **Styling:** Tailwind CSS + shadcn/ui
- **Email:** Resend
- **Deployment:** Vercel (with Vercel Cron)

---

## 1. Database Schema

### Tables

```sql
-- Users (synced from Clerk webhooks)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reminder settings per user
CREATE TABLE reminder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  days_before INTEGER[] DEFAULT '{30, 14, 7, 0}', -- 1 month, 2 weeks, 1 week, day-of
  email_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Recipients (people you buy gifts for)
CREATE TABLE recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT, -- e.g., "Mom", "Friend", "Coworker"
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Occasions (birthdays, holidays, etc.)
CREATE TABLE occasions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES recipients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  occasion_type TEXT NOT NULL, -- e.g., "Birthday", "Christmas", "Anniversary"
  date DATE NOT NULL,
  is_annual BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Gift ideas
CREATE TABLE gift_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES recipients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT, -- Original or affiliate-converted URL
  original_url TEXT, -- Store original for reference
  price DECIMAL(10,2),
  asin TEXT, -- Amazon Standard Identification Number
  original_price DECIMAL(10,2), -- Price when first added
  current_price DECIMAL(10,2), -- Latest known price (for future price tracking)
  is_purchased BOOLEAN DEFAULT false,
  purchased_for_occasion_id UUID REFERENCES occasions(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Price history (for future price tracking feature)
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_idea_id UUID REFERENCES gift_ideas(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Sent reminders log (prevent duplicate emails)
CREATE TABLE sent_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  occasion_id UUID REFERENCES occasions(id) ON DELETE CASCADE,
  days_before INTEGER NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(occasion_id, days_before) -- One reminder per occasion per timing
);

-- Indexes for performance
CREATE INDEX idx_recipients_user ON recipients(user_id);
CREATE INDEX idx_occasions_user ON occasions(user_id);
CREATE INDEX idx_occasions_date ON occasions(date);
CREATE INDEX idx_gift_ideas_user ON gift_ideas(user_id);
CREATE INDEX idx_gift_ideas_recipient ON gift_ideas(recipient_id);
CREATE INDEX idx_gift_ideas_asin ON gift_ideas(asin);
```

### Entity Relationships
```
users (1) ──────────── (many) recipients
users (1) ──────────── (1) reminder_settings
recipients (1) ─────── (many) occasions
recipients (1) ─────── (many) gift_ideas
occasions (1) ──────── (many) gift_ideas (purchased_for)
gift_ideas (1) ─────── (many) price_history
```

---

## 2. Project File Structure

```
gifto/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-out/[[...sign-out]]/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard layout with sidebar
│   │   ├── page.tsx                # Dashboard home (upcoming occasions)
│   │   ├── recipients/
│   │   │   ├── page.tsx            # List all recipients
│   │   │   ├── new/page.tsx        # Create recipient
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # View recipient detail
│   │   │       └── edit/page.tsx   # Edit recipient
│   │   ├── occasions/
│   │   │   ├── page.tsx            # Calendar/list view of occasions
│   │   │   └── [id]/
│   │   │       └── page.tsx        # View/edit occasion
│   │   ├── gifts/
│   │   │   ├── page.tsx            # All gift ideas
│   │   │   └── [id]/
│   │   │       └── page.tsx        # View/edit gift idea
│   │   └── settings/
│   │       └── page.tsx            # Reminder settings
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── clerk/route.ts      # Clerk user sync webhook
│   │   ├── recipients/
│   │   │   ├── route.ts            # GET (list), POST (create)
│   │   │   └── [id]/route.ts       # GET, PUT, DELETE
│   │   ├── occasions/
│   │   │   ├── route.ts            # GET, POST
│   │   │   └── [id]/route.ts       # GET, PUT, DELETE
│   │   ├── gift-ideas/
│   │   │   ├── route.ts            # GET, POST
│   │   │   └── [id]/route.ts       # GET, PUT, DELETE
│   │   ├── settings/
│   │   │   └── reminders/route.ts  # GET, PUT reminder settings
│   │   └── cron/
│   │       ├── reminders/route.ts  # Daily reminder check
│   │       └── prices/route.ts     # Price check (future)
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Landing page
│   └── globals.css
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── mobile-nav.tsx
│   ├── recipients/
│   │   ├── recipient-card.tsx
│   │   ├── recipient-form.tsx
│   │   └── recipient-list.tsx
│   ├── occasions/
│   │   ├── occasion-card.tsx
│   │   ├── occasion-form.tsx
│   │   └── upcoming-occasions.tsx
│   ├── gifts/
│   │   ├── gift-card.tsx
│   │   ├── gift-form.tsx
│   │   └── gift-list.tsx
│   └── settings/
│       └── reminder-settings-form.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts                # Supabase client
│   │   ├── schema.ts               # Drizzle schema definitions
│   │   └── queries/
│   │       ├── recipients.ts
│   │       ├── occasions.ts
│   │       ├── gift-ideas.ts
│   │       └── reminders.ts
│   ├── amazon/
│   │   ├── extract-asin.ts         # ASIN extraction from URLs
│   │   └── affiliate-link.ts       # Convert to affiliate link
│   ├── email/
│   │   ├── resend.ts               # Resend client
│   │   └── templates/
│   │       ├── reminder.tsx        # Upcoming reminder (30/14/7 days)
│   │       ├── day-of-reminder.tsx # Day-of "wish them well" email
│   │       └── price-drop.tsx      # Price drop email (future)
│   ├── utils.ts                    # General utilities
│   └── validations/
│       ├── recipient.ts            # Zod schemas
│       ├── occasion.ts
│       └── gift-idea.ts
├── hooks/
│   ├── use-recipients.ts
│   ├── use-occasions.ts
│   └── use-gift-ideas.ts
├── types/
│   └── index.ts                    # TypeScript types
├── middleware.ts                   # Clerk auth middleware
├── drizzle.config.ts
├── tailwind.config.ts
├── next.config.js
├── package.json
├── vercel.json                     # Cron configuration
└── .env.local
```

---

## 3. API Routes

### Authentication Webhook
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/clerk` | Sync Clerk users to DB |

### Recipients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recipients` | List user's recipients |
| POST | `/api/recipients` | Create recipient |
| GET | `/api/recipients/[id]` | Get recipient detail |
| PUT | `/api/recipients/[id]` | Update recipient |
| DELETE | `/api/recipients/[id]` | Delete recipient |

### Occasions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/occasions` | List occasions (optional: ?recipientId=) |
| POST | `/api/occasions` | Create occasion |
| GET | `/api/occasions/[id]` | Get occasion detail |
| PUT | `/api/occasions/[id]` | Update occasion |
| DELETE | `/api/occasions/[id]` | Delete occasion |

### Gift Ideas
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gift-ideas` | List gift ideas (optional: ?recipientId=) |
| POST | `/api/gift-ideas` | Create gift idea (handles Amazon link conversion) |
| GET | `/api/gift-ideas/[id]` | Get gift idea detail |
| PUT | `/api/gift-ideas/[id]` | Update gift idea |
| DELETE | `/api/gift-ideas/[id]` | Delete gift idea |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings/reminders` | Get user's reminder settings |
| PUT | `/api/settings/reminders` | Update reminder settings |

### Cron Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cron/reminders` | Process daily reminders |
| GET | `/api/cron/prices` | Check prices (future) |

---

## 4. Component Breakdown

### Layout Components
- **Sidebar** - Navigation with links to Recipients, Occasions, Gifts, Settings
- **Header** - User menu (Clerk), breadcrumbs
- **MobileNav** - Responsive bottom nav for mobile

### Page Components
- **Dashboard** - Upcoming occasions (next 30 days), quick stats
- **RecipientList** - Grid/list view with search/filter
- **RecipientDetail** - View recipient with their occasions and gift ideas
- **OccasionCalendar** - Calendar view of all occasions
- **GiftList** - All gift ideas with filters (by recipient, price range, purchased)
- **Settings** - Reminder timing configuration

### Form Components
- **RecipientForm** - Name, relationship dropdown, notes textarea
- **OccasionForm** - Type (preset + custom), date picker, annual toggle
- **GiftForm** - Title, description, URL input (with Amazon detection), price
- **ReminderSettingsForm** - Multi-select for reminder days, email toggle

### Card Components
- **RecipientCard** - Avatar (initials), name, relationship, occasion count
- **OccasionCard** - Type icon, date, days until, gift ideas count
- **GiftCard** - Title, price, thumbnail (if available), affiliate badge, purchased toggle

---

## 5. Amazon Affiliate Link System

### ASIN Extraction Logic
```typescript
// lib/amazon/extract-asin.ts
const AMAZON_URL_PATTERNS = [
  /amazon\.(com|co\.uk|ca|de|fr|es|it|co\.jp|in|com\.au)\/.*\/dp\/([A-Z0-9]{10})/,
  /amazon\.(com|co\.uk|ca|de|fr|es|it|co\.jp|in|com\.au)\/dp\/([A-Z0-9]{10})/,
  /amazon\.(com|co\.uk|ca|de|fr|es|it|co\.jp|in|com\.au)\/gp\/product\/([A-Z0-9]{10})/,
  /amzn\.to\/([A-Za-z0-9]+)/, // Short URLs need expansion
  /amazon\.(com|co\.uk|ca|de|fr|es|it|co\.jp|in|com\.au)\/.*\?.*asin=([A-Z0-9]{10})/,
];

export function extractASIN(url: string): string | null {
  for (const pattern of AMAZON_URL_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return match[2] || match[1]; // ASIN is in different capture groups
    }
  }
  return null;
}
```

### Affiliate Link Conversion
```typescript
// lib/amazon/affiliate-link.ts
const AFFILIATE_TAG = process.env.AMAZON_AFFILIATE_TAG;

export function convertToAffiliateLink(url: string, asin: string): string {
  // Detect which Amazon domain
  const domainMatch = url.match(/amazon\.(com|co\.uk|ca|de|fr|es|it|co\.jp|in|com\.au)/);
  const domain = domainMatch ? domainMatch[0] : 'amazon.com';

  // Create clean affiliate link
  return `https://www.${domain}/dp/${asin}?tag=${AFFILIATE_TAG}`;
}
```

### Gift Idea Creation Flow
1. User enters URL in gift form
2. Frontend detects if URL contains "amazon"
3. On submit, API extracts ASIN if Amazon URL
4. If ASIN found:
   - Store `original_url` as entered URL
   - Store `url` as converted affiliate link
   - Store `asin` for future price tracking
5. If not Amazon, store URL as-is

---

## 6. Email Reminder System

### Vercel Cron Configuration
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 9 * * *"  // Daily at 9 AM UTC
    }
  ]
}
```

### Reminder Logic
```typescript
// api/cron/reminders/route.ts
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Get all users with email reminders enabled
  const users = await getUsersWithReminders();

  for (const user of users) {
    const { days_before } = user.reminder_settings;

    // For each reminder interval (e.g., 14, 7 days)
    for (const daysBefore of days_before) {
      const targetDate = addDays(new Date(), daysBefore);

      // Find occasions on target date
      const occasions = await getOccasionsOnDate(user.id, targetDate);

      for (const occasion of occasions) {
        // Check if reminder already sent
        const alreadySent = await checkReminderSent(occasion.id, daysBefore);
        if (alreadySent) continue;

        // Get gift ideas for this recipient
        const giftIdeas = await getGiftIdeasForRecipient(occasion.recipient_id);

        // Send reminder email
        await sendReminderEmail(user.email, {
          recipientName: occasion.recipient.name,
          occasionType: occasion.occasion_type,
          date: occasion.date,
          daysUntil: daysBefore,
          giftIdeas: giftIdeas,
        });

        // Log sent reminder
        await logSentReminder(user.id, occasion.id, daysBefore);
      }
    }
  }

  return Response.json({ success: true });
}
```

### Email Templates (React Email + Resend)

**Upcoming Reminder (30, 14, 7 days before):**
```tsx
// lib/email/templates/reminder.tsx
export const ReminderEmail = ({ recipientName, occasionType, date, daysUntil, giftIdeas }) => (
  <Html>
    <Head />
    <Body>
      <Container>
        <Heading>Upcoming: {occasionType} for {recipientName}</Heading>
        <Text>
          {recipientName}'s {occasionType} is in {daysUntil} days on {formatDate(date)}.
        </Text>

        {giftIdeas.length > 0 && (
          <>
            <Heading as="h2">Your Gift Ideas</Heading>
            {giftIdeas.map(gift => (
              <Section key={gift.id}>
                <Text><strong>{gift.title}</strong> - ${gift.price}</Text>
                <Button href={gift.url}>View Item</Button>
              </Section>
            ))}
          </>
        )}

        <Button href={`${APP_URL}/recipients/${recipientId}`}>
          View All Ideas for {recipientName}
        </Button>
      </Container>
    </Body>
  </Html>
);
```

**Day-Of Reminder (0 days - wish them well!):**
```tsx
// lib/email/templates/day-of-reminder.tsx
export const DayOfReminderEmail = ({ recipientName, occasionType }) => (
  <Html>
    <Head />
    <Body>
      <Container>
        <Heading>Today is {recipientName}'s {occasionType}!</Heading>
        <Text>
          Don't forget to wish {recipientName} a happy {occasionType.toLowerCase()} today!
        </Text>
        <Text>
          A quick call, text, or message can make their day extra special.
        </Text>
      </Container>
    </Body>
  </Html>
);
```

---

## 7. Price Tracking (Future MVP+)

*Skipped for initial MVP. Infrastructure in place:*

- `asin` field on gift_ideas table
- `price_history` table ready
- `original_price` / `current_price` fields
- `/api/cron/prices` route placeholder
- 10% drop threshold for alerts

**Future implementation options:**
1. Keepa API integration (~$15/mo)
2. Amazon Product Advertising API (requires approval)
3. Browser extension for manual updates

---

## 8. Environment Variables

```bash
# .env.local

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Resend
RESEND_API_KEY=re_...

# Amazon
AMAZON_AFFILIATE_TAG=gifto0a8-20

# Cron
CRON_SECRET=random-secret-for-cron-auth

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 9. Implementation Order

### Phase 1: Foundation (Start Here)
1. Initialize Next.js 14 project with App Router
2. Install and configure Tailwind + shadcn/ui
3. Set up Clerk authentication
4. Configure Supabase + Drizzle ORM
5. Create database schema and migrations
6. Implement Clerk webhook for user sync
7. Create basic layout (sidebar, header)

### Phase 2: Core CRUD
8. Recipients CRUD (API + UI)
9. Occasions CRUD (API + UI)
10. Gift Ideas CRUD (API + UI)
11. Dashboard with upcoming occasions

### Phase 3: Amazon Integration
12. ASIN extraction utility
13. Affiliate link conversion
14. Integrate into gift idea creation flow
15. Display affiliate badges on gift cards

### Phase 4: Email Reminders
16. Set up Resend integration
17. Create reminder email template
18. Build reminder settings page
19. Implement cron job for daily reminder checks
20. Test end-to-end reminder flow

### Phase 5: Polish
21. Mobile responsive design
22. Loading states and error handling
23. Empty states for all lists
24. Search and filtering
25. Mark gifts as purchased flow

### Phase 6: Future (Post-MVP)
- Price tracking integration
- Price drop email alerts
- Gift wishlists / sharing
- Import from other sources

---

## 10. Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "@clerk/nextjs": "^4.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "drizzle-orm": "^0.29.0",
    "resend": "^2.0.0",
    "@react-email/components": "^0.0.12",
    "zod": "^3.22.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.300.0",
    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0"
  }
}
```

---

## Summary

This plan provides a complete implementation path for Gifto:

- **Database:** 7 tables with proper relationships and indexes
- **API:** 15 endpoints covering all CRUD operations + cron jobs
- **UI:** Dashboard, recipients, occasions, gifts, and settings pages
- **Features:** Amazon affiliate conversion, email reminders via Resend
- **Scalability:** Price tracking infrastructure ready for future addition

**Estimated scope:** ~35-40 files to create, phased implementation recommended.
