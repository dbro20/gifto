# Gifto - Session Context for Continuation

## Project Status: 98% Complete

### What's Built
- Next.js 16 app with App Router
- Full CRUD for Recipients (called "Friends & Fam"), Occasions, Gift Ideas
- Amazon affiliate link conversion (tag: `gifto0a8-20`)
- Email reminders via Resend (30, 14, 7, 0 days before)
- Vercel Cron job for daily reminders
- Landing page, home calendar, loading states, error handling
- Apple Contacts import via vCard file upload
- Calendar view on home page with emoji icons for occasions

### Tech Stack
- Next.js 16.1.1
- Clerk for auth
- Neon PostgreSQL
- Drizzle ORM
- Tailwind + shadcn/ui
- Resend for email

### Recent Changes (This Session)
1. **Fixed Clerk Auth** - Added proper redirect URLs, created `/home` route
2. **Renamed Dashboard to Home** - Route is now `/home`, sidebar shows "Home"
3. **Renamed Recipients to "Friends & Fam"** - Friendlier naming throughout UI
4. **Added Calendar View** - Home page shows a monthly calendar with emoji icons on days with occasions
5. **Added Contact Import** - Apple Contacts vCard import at `/recipients/import`
6. **Updated Add Person Form** - Now requires at least one special date (birthday, etc.) with ability to add more
7. **Removed Google Calendar integration** - User decided against it
8. **Auto-create user in DB** - Uses `getOrCreateUser` instead of relying on webhook

### Route Structure
- `/` - Landing page (redirects to `/home` if signed in)
- `/home` - Calendar view with occasions (main dashboard)
- `/recipients` - Friends & Fam list
- `/recipients/new` - Add person with required date(s)
- `/recipients/import` - Import from Apple Contacts (vCard)
- `/recipients/[id]` - View person details
- `/occasions` - All occasions list
- `/gifts` - Gift ideas list
- `/settings` - User settings

### Key Files Modified This Session
- `src/app/home/page.tsx` - Home page with calendar
- `src/components/dashboard/occasions-calendar.tsx` - Calendar component
- `src/components/recipients/recipient-form.tsx` - Form with required dates
- `src/app/api/recipients/route.ts` - Creates occasions with recipient
- `src/components/layout/sidebar.tsx` - "Home" and "Friends & Fam" nav
- `src/app/(dashboard)/recipients/import/page.tsx` - vCard import UI
- `src/lib/utils/vcard-parser.ts` - Parses Apple Contacts vCard files

### Environment Variables (.env.local)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_REPLACE_AFTER_CREATING_WEBHOOK
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Gifto <onboarding@resend.dev>
AMAZON_AFFILIATE_TAG=gifto0a8-20
CRON_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database
- **Provider:** Neon (neon.tech)
- **Schema pushed:** Yes
- **Tables:** users, recipients, occasions, gift_ideas, reminder_settings, price_history, sent_reminders

### What Works
- Sign up / Sign in with Clerk
- Auto-create user in database on first visit
- Add person with required birthday/date
- Calendar shows occasions with emoji icons (birthday, anniversary, christmas, etc.)
- Import contacts from Apple Contacts vCard file
- Full CRUD for all entities
- Email reminders (needs Clerk webhook for production)

### Next Steps to Complete
1. **Set up Clerk webhook** - In Clerk Dashboard, create webhook pointing to `/api/webhooks/clerk` for user sync
2. **Deploy to Vercel** - Connect GitHub repo
3. **Add environment variables to Vercel** - All the .env.local vars
4. **Update NEXT_PUBLIC_APP_URL** - Change to production URL after deploy
5. **Test full flow in production** - Sign up, add person, verify calendar, test reminders

### Commands
```bash
npm run dev          # Start dev server (runs on port 3000)
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
npm run build        # Build for production
```

### GitHub Repo
https://github.com/dbro20/gifto
