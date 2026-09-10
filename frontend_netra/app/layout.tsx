import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";
import { AuthProvider } from "../context/AuthContext";
import { Navbar } from "../components/layout/Navbar";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NETRA · Intelligent Tele-Ophthalmology Platform",
  description:
    "AI-powered Diabetic Retinopathy screening and closed-loop referral system engineered for rural community health workers and ASHA professionals.",
  keywords: [
    "Diabetic Retinopathy",
    "ASHA Worker",
    "Tele-Ophthalmology",
    "YOLOv8 Fundus Detection",
    "Diagnostic Passport",
    "Rural Healthcare India",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>
          <Providers>
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
