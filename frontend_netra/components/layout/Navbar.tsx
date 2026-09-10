"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { NetraLogo } from "../branding/NetraLogo";
import {
  LogIn,
  LogOut,
  Building2,
  Menu,
  X,
  PlusCircle,
  FolderOpen,
  Eye,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated, logout, clinicName } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const technicianLinks = [
    { href: "/technician/dashboard", label: "Screening Hub", icon: Eye },
    { href: "/technician/patient-intake", label: "New Patient", icon: PlusCircle },
  ];

  const specialistLinks = [
    { href: "/specialist/queue", label: "Specialist Queue", icon: Eye },
  ];

  const adminLinks = [
    { href: "/admin/contribute", label: "Contribute Data", icon: FolderOpen },
    { href: "/admin/review-queue", label: "Review Queue", icon: CheckCircle2 },
  ];

  const currentPortalLinks =
    user?.role === "SPECIALIST"
      ? specialistLinks
      : user?.role === "ADMIN"
      ? adminLinks
      : user?.role === "TECHNICIAN"
      ? technicianLinks
      : [];

  const dashboardUrl =
    user?.role === "SPECIALIST"
      ? "/specialist/queue"
      : user?.role === "ADMIN"
      ? "/admin/contribute"
      : "/technician/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xs transition-all">
      <div className="web-container flex items-center justify-between h-20">
        {/* Brand Logo: Clicking navigates to dashboard if logged in, or /login if logged out */}
        <div className="flex items-center gap-8">
          <NetraLogo size="md" />

          {/* If Authenticated and NOT on public landing page: Show portal navigation */}
          {isAuthenticated && pathname !== "/" && (
            <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-full border border-slate-200">
              {currentPortalLinks.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                        : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-blue-600" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* If on Landing Page: Show Anchor Links */}
          {pathname === "/" && (
            <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
              <a href="#how-it-works" className="hover:text-blue-700 transition-colors">
                How It Works
              </a>
              <a href="#clinical-grades" className="hover:text-blue-700 transition-colors">
                Clinical DR Triage
              </a>
              <a href="#dispatch-engine" className="hover:text-blue-700 transition-colors">
                WhatsApp & SMS
              </a>
              <a href="#impact" className="hover:text-blue-700 transition-colors">
                Rural Impact
              </a>
            </nav>
          )}
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* If on landing page, show quick "Return to Dashboard" button */}
              {pathname === "/" && (
                <Link
                  href={dashboardUrl}
                  className="oneui-btn oneui-btn-primary text-xs py-2 px-4 shadow-sm hidden sm:inline-flex items-center gap-1.5"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}

              {/* Clinic Indicator Pill */}
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 rounded-full border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="truncate max-w-[190px]">{clinicName}</span>
              </div>

              {/* User Profile Pill */}
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-blue-50 text-blue-950 rounded-full border border-blue-200 text-xs font-bold shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {user.fullName ? user.fullName.charAt(0) : "U"}
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="font-bold text-slate-900">{user.fullName}</span>
                  <span className="text-[10px] text-blue-700 font-semibold uppercase tracking-wider mt-0.5">
                    {user.role === "TECHNICIAN" ? "ASHA Technician" : user.role}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors border border-transparent hover:border-rose-100"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="oneui-btn oneui-btn-primary text-xs py-2.5 px-5 shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                Clinical Portal Sign In
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-5 py-4 space-y-3">
          {isAuthenticated ? (
            <>
              <div className="py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Active Clinical Session
                </p>
                <p className="font-bold text-slate-900 text-sm">{user?.fullName}</p>
                <p className="text-xs text-blue-700 font-semibold">{clinicName}</p>
              </div>
              <div className="space-y-1">
                <Link
                  href={dashboardUrl}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-blue-50 text-blue-900 text-sm font-bold"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {currentPortalLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-semibold"
                    >
                      <Icon className="w-4 h-4 text-blue-600" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-rose-600 bg-rose-50 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 font-semibold text-sm"
              >
                How It Works
              </a>
              <a
                href="#clinical-grades"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 font-semibold text-sm"
              >
                Clinical DR Triage
              </a>
              <a
                href="#dispatch-engine"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 font-semibold text-sm"
              >
                WhatsApp & SMS
              </a>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 oneui-btn oneui-btn-primary mt-2 text-sm font-bold"
              >
                <LogIn className="w-4 h-4" />
                Sign In to Clinical Portal
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
