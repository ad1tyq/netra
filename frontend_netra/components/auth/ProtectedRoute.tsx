"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { ShieldAlert, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"TECHNICIAN" | "SPECIALIST" | "ADMIN">;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center border border-sky-100 animate-pulse">
          <Loader2 className="w-6 h-6 text-sky-600 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-500">Verifying medical session credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect in useEffect
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const roleRoutes: Record<string, string> = {
      TECHNICIAN: "/technician/dashboard",
      SPECIALIST: "/specialist/queue",
      ADMIN: "/admin/contribute",
    };

    return (
      <div className="web-container py-16 flex justify-center">
        <div className="oneui-card max-w-lg w-full text-center p-8 border-rose-100 bg-rose-50/20">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Restricted Access Portal</h2>
          <p className="text-slate-600 text-sm mb-6">
            Your current account role (<strong>{user.role}</strong>) does not have authorization to view this clinical
            route. Please navigate to your designated department hub.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={roleRoutes[user.role] || "/"}
              className="oneui-btn oneui-btn-primary"
            >
              Go to My Portal <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="oneui-btn oneui-btn-outline">
              Switch Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
