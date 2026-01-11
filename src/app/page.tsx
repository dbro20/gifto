import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Gift,
  Calendar,
  Bell,
  Users,
  Link as LinkIcon,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Heart,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Gift className="size-6 text-primary" />
            <span className="text-xl font-bold">Gifto</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
          {/* Decorative background elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 right-0 size-80 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-40 left-0 size-80 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="mx-auto max-w-4xl text-center">
            {/* Icon arrangement */}
            <div className="mb-8 flex items-center justify-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <Gift className="size-6 text-primary" />
              </div>
              <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10">
                <Heart className="size-7 text-primary" />
              </div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="size-6 text-primary" />
              </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Never forget a gift
              <span className="block text-primary">again</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Track everyone you buy gifts for, save gift ideas from anywhere,
              set up occasions with automatic reminders, and never miss an
              important date. Gift-giving made simple.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                asChild
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Free to use. No credit card required.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border bg-muted/30 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything you need to be a thoughtful gift-giver
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Gifto helps you stay organized and never miss an opportunity to
                show you care.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="size-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Track Recipients
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Keep track of everyone you buy gifts for - family, friends,
                  coworkers, and more. All in one place.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                  <Calendar className="size-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Never Miss a Date
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Set up birthdays, anniversaries, holidays, and any special
                  occasion. We&apos;ll make sure you remember.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                  <LinkIcon className="size-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Save Gift Ideas
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Paste any link to save gift ideas. Amazon links automatically
                  convert to affiliate links to help support us.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                  <Bell className="size-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Get Reminded
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Receive email reminders 1 month, 2 weeks, 1 week, and the day
                  of any occasion. Never be caught off guard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                How it works
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Get started in minutes with three simple steps.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-3">
              {/* Step 1 */}
              <div className="relative text-center">
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Add your people
                </h3>
                <p className="mt-3 text-muted-foreground">
                  Create a list of everyone you want to remember with gifts -
                  family, friends, coworkers, anyone special.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative text-center">
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  2
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Set up occasions
                </h3>
                <p className="mt-3 text-muted-foreground">
                  Add birthdays, anniversaries, holidays, and any other dates
                  you want to remember for each person.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative text-center">
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Save ideas & relax
                </h3>
                <p className="mt-3 text-muted-foreground">
                  Save gift ideas as you come across them. We&apos;ll remind you
                  when it&apos;s time to buy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Reminder Schedule Section */}
        <section className="border-t border-border bg-muted/30 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Smart reminders, perfect timing
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Get notified at the right times so you&apos;re always prepared.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <CheckCircle className="size-5 shrink-0 text-green-600" />
                <span className="font-medium">1 month before</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <CheckCircle className="size-5 shrink-0 text-green-600" />
                <span className="font-medium">2 weeks before</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <CheckCircle className="size-5 shrink-0 text-green-600" />
                <span className="font-medium">1 week before</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <CheckCircle className="size-5 shrink-0 text-green-600" />
                <span className="font-medium">Day of</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl bg-primary px-8 py-16 text-center sm:px-16">
              <Gift className="mx-auto mb-6 size-12 text-primary-foreground" />
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Ready to become a better gift-giver?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
                Join Gifto today and never miss another important occasion.
                It&apos;s free to get started.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  asChild
                >
                  <Link href="/sign-up">
                    Get Started Free
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Gift className="size-5 text-muted-foreground" />
              <span className="font-semibold text-muted-foreground">Gifto</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Gifto. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
