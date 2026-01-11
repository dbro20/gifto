"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Gift,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    title: "Home",
    href: "/home",
    icon: Home,
  },
  {
    title: "Friends & Fam",
    href: "/recipients",
    icon: Users,
  },
  {
    title: "Gifts",
    href: "/gifts",
    icon: Gift,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex h-screen w-64 flex-col border-r-2 border-dashed sticky top-0"
      style={{
        background: "#faf6f1",
        borderColor: "#e8d5c4",
      }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b-2 border-dashed border-[#e8d5c4]">
        <Link href="/" className="flex items-center gap-2 group">
          <Gift className="h-6 w-6 text-[#8b7355] group-hover:rotate-12 transition-transform" />
          <span
            className="text-2xl font-bold text-[#8b7355]"
            style={{ fontFamily: "'Kalam', cursive" }}
          >
            Gifty
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 transition-all duration-200",
                isActive
                  ? "bg-[#f5ebe0] text-[#8b7355] border-2 border-[#e8d5c4] shadow-sm"
                  : "text-[#b5a088] hover:text-[#8b7355] hover:bg-[#f5ebe0] hover:scale-[1.02]"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                <span style={{ fontFamily: "'Kalam', cursive", fontWeight: isActive ? 700 : 400 }}>
                  {item.title}
                </span>
              </Link>
            </Button>
          );
        })}
      </nav>

    </aside>
  );
}

export { navItems };
