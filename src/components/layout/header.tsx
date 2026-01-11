"use client";

import { useState } from "react";
import { Menu, Gift } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Home" }: HeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b-2 border-dashed px-4 md:px-6"
        style={{
          background: "linear-gradient(90deg, #faf6f1 0%, #f5ebe0 100%)",
          borderColor: "#e8d5c4",
        }}
      >
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-[#8b7355] hover:bg-[#f5ebe0]"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2">
          <Gift className="h-5 w-5 text-[#8b7355]" />
          <span
            className="text-xl font-bold text-[#8b7355]"
           
          >
            Gifto
          </span>
        </div>

        {/* Page title / Breadcrumbs area */}
        <div className="flex-1 hidden md:block">
          <h1
            className="text-lg font-semibold md:text-xl text-[#8b7355]"
           
          >
            {title}
          </h1>
        </div>

        {/* User button */}
        <div className="flex items-center gap-4 ml-auto">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 border-2 border-[#e8d5c4]",
              },
            }}
          />
        </div>
      </header>

      {/* Mobile navigation */}
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </>
  );
}
