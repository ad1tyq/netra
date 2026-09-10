"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api";
import { NetraLogo } from "@/components/branding/NetraLogo";
import {
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  Stethoscope,
  Building2,
  Loader2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const { user, isAuthenticated, login } = useAuth();

  const [email, setEmail] = useState("priya.tech@netra.ai");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user is already authenticated and visits /login, redirect directly to their portal
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "SPECIALIST") {
        router.replace("/specialist/queue");
      } else if (user.role === "ADMIN") {
        router.replace("/admin/contribute");
      } else {
        router.replace("/technician/dashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  const selectPersona = (role: "TECHNICIAN" | "SPECIALIST" | "ADMIN") => {
    setError(null);
    if (role === "TECHNICIAN") {
      setEmail("priya.tech@netra.ai");
      setPassword("password123");
    } else if (role === "SPECIALIST") {
      setEmail("dr.sharma@netra.ai");
      setPassword("password123");
    } else {
      setEmail("admin@netra.ai");
      setPassword("password123");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const authData = await apiClient.auth.login({ email, password });

      login({
        token: authData.token,
        userId: authData.userId,
        fullName: authData.fullName,
        role: authData.role,
        clinicId: authData.clinicId,
        email,
      });

      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (authData.role === "SPECIALIST") {
        router.push("/specialist/queue");
      } else if (authData.role === "ADMIN") {
        router.push("/admin/contribute");
      } else {
        router.push("/technician/dashboard");
      }
    } catch (err: unknown) {
      console.error("Authentication error:", err);
      const apiErr = err as { response?: { data?: { message?: string } | string } };
      const serverMessage =
        apiErr?.response?.data && typeof apiErr.response.data === "object" && "message" in apiErr.response.data
          ? (apiErr.response.data as { message: string }).message
          : typeof apiErr?.response?.data === "string"
          ? apiErr.response.data
          : null;
      setError(
        serverMessage ||
          "Invalid credentials or unauthorized access. Please verify your login details with your clinic administrator."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 bg-slate-50/60">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center space-y-2.5">
        <div className="flex justify-center">
          <NetraLogo size="lg" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
          Sign In
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Select role or enter credentials to access your station
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="oneui-card p-6 sm:p-7 bg-white border border-slate-200 shadow-lg space-y-5">
          {/* Streamlined Role Switcher */}
          <div>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => selectPersona("TECHNICIAN")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                  email === "priya.tech@netra.ai"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ASHA Tech
              </button>

              <button
                type="button"
                onClick={() => selectPersona("SPECIALIST")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                  email === "dr.sharma@netra.ai"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Specialist
              </button>

              <button
                type="button"
                onClick={() => selectPersona("ADMIN")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                  email === "admin@netra.ai"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs font-semibold text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@netra.ai"
                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-3.5 py-2 text-xs font-bold transition-all outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl pl-3.5 pr-10 py-2 text-xs font-bold transition-all outline-none text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-1.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full oneui-btn oneui-btn-primary py-2.5 text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-75 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
