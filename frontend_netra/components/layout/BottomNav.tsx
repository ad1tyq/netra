"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { Home, Camera, Stethoscope, FolderOpen } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/technician/dashboard", label: "Screening", icon: Camera },
  { href: "/specialist/queue", label: "Specialist", icon: Stethoscope },
  { href: "/admin/contribute", label: "Data Hub", icon: FolderOpen },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide nav on login page
  if (pathname === "/login") return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 border-t"
      style={{
        background: "var(--nav-bg)",
        borderColor: "var(--card-border)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <ul className="flex justify-around max-w-lg mx-auto py-2">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          const isHome = href === "/";
          const active = isHome ? pathname === "/" : isActive;

          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200",
                  active
                    ? "text-primary"
                    : "text-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "transition-all duration-200",
                    active ? "w-6 h-6" : "w-5 h-5"
                  )}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                <span
                  className={cn(
                    "text-[0.625rem] font-medium transition-all",
                    active && "font-semibold"
                  )}
                >
                  {label}
                </span>
                {active && (
                  <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
