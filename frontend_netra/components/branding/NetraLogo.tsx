"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";

interface NetraLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
}

export function NetraLogo({
  className = "",
  size = "md",
  href,
}: NetraLogoProps) {
  const { user, isAuthenticated } = useAuth();

  // Dynamic destination:
  // If user is authenticated, logo goes directly to their portal dashboard.
  // If unauthenticated, user explicitly requested: "let it so that tapping the logo goes back to the main login dasboard".
  let destination = href;
  if (!destination) {
    if (isAuthenticated && user) {
      destination =
        user.role === "SPECIALIST"
          ? "/specialist/queue"
          : user.role === "ADMIN"
          ? "/admin/contribute"
          : "/technician/dashboard";
    } else {
      destination = "/login";
    }
  }

  const heightMap = {
    sm: 44,
    md: 58,
    lg: 74,
    xl: 100,
  };

  const h = heightMap[size];
  const w = Math.round(h * 2.56); // aspect ratio ~ 1600 / 625 = 2.56

  const content = (
    <div className={`inline-flex items-center select-none cursor-pointer transition-transform duration-200 hover:opacity-90 active:scale-98 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo_final.png"
        alt="NETRA"
        width={w}
        height={h}
        className="object-contain"
        style={{ height: `${h}px`, width: "auto" }}
      />
    </div>
  );

  return (
    <Link href={destination} className="focus:outline-none flex items-center">
      {content}
    </Link>
  );
}
