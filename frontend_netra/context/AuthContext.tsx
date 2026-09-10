"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface UserSession {
  userId: string;
  fullName: string;
  role: "TECHNICIAN" | "SPECIALIST" | "ADMIN";
  clinicId?: string;
  email?: string;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  clinicName: string;
  login: (authResponse: {
    token: string;
    userId: string;
    fullName: string;
    role: string;
    clinicId?: string;
    email?: string;
  }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("jwt");
      const savedUser = localStorage.getItem("netra_user");

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to restore auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (data: {
    token: string;
    userId: string;
    fullName: string;
    role: string;
    clinicId?: string;
    email?: string;
  }) => {
    const session: UserSession = {
      userId: data.userId,
      fullName: data.fullName,
      role: data.role as "TECHNICIAN" | "SPECIALIST" | "ADMIN",
      clinicId: data.clinicId,
      email: data.email,
    };

    setToken(data.token);
    setUser(session);

    if (typeof window !== "undefined") {
      localStorage.setItem("jwt", data.token);
      localStorage.setItem("netra_user", JSON.stringify(session));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("jwt");
      localStorage.removeItem("netra_user");
    }
    router.push("/login");
  };

  const clinicName =
    user?.role === "SPECIALIST"
      ? "Jaipur District Tertiary Hospital"
      : "Dahmi Kalan Community Health Centre";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        clinicName,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
