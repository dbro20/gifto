"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { navItems } from "./sidebar";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-72 p-0 border-r-2 border-dashed"
        style={{
          background: "linear-gradient(180deg, #faf6f1 0%, #f5ebe0 100%)",
          borderColor: "#e8d5c4",
        }}
      >
        <SheetHeader className="px-6 py-4 border-b-2 border-dashed border-[#e8d5c4]">
          <SheetTitle className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-[#8b7355]" />
            <span
              className="text-2xl font-bold text-[#8b7355]"
             
            >
              Gifto
            </span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SheetClose key={item.href} asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 transition-all duration-200",
                    isActive
                      ? "bg-[#f5ebe0] text-[#8b7355] border-2 border-[#e8d5c4] shadow-sm"
                      : "text-[#b5a088] hover:text-[#8b7355] hover:bg-[#f5ebe0]"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span style={{  fontWeight: isActive ? 700 : 400 }}>
                      {item.title}
                    </span>
                  </Link>
                </Button>
              </SheetClose>
            );
          })}
        </nav>

      </SheetContent>
    </Sheet>
  );
}
