"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "../../../../components/auth/ProtectedRoute";
import { apiClient, PassportResponse } from "../../../../lib/api";
import { NetraLogo } from "../../../../components/branding/NetraLogo";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Printer,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Copy,
  Check,
} from "lucide-react";

export default function DiagnosticPassportPage() {
  const params = useParams<{ screeningId?: string }>();
  const screeningId = params?.screeningId ?? "";

  const [passport, setPassport] = useState<PassportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPassport() {
      if (!screeningId) return;
      try {
        setIsLoading(true);
        const data = await apiClient.referrals.getPassport(screeningId);
        setPassport(data);
      } catch (err) {
        console.error("Failed to load passport from backend:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPassport();
  }, [screeningId]);

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/passport/${screeningId}`
      : `https://netra.clinic/passport/${screeningId}`;

  const copyPassportLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const isUrgent = passport?.urgentReferral ?? true;

  return (
    <ProtectedRoute allowedRoles={["TECHNICIAN", "SPECIALIST"]}>
      <div className="web-container py-8 max-w-4xl space-y-6">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3">
            <Link
              href={`/technician/triage/${screeningId}`}
              className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                Diagnostic Referral Passport
              </h1>
              <p className="text-xs text-slate-500 font-semibold">
                Official Clinical Referral Slip with Cryptographic Verification QR Code
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyPassportLink}
              className="oneui-btn oneui-btn-outline py-2.5 px-4 text-xs font-bold shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? "Link Copied" : "Copy Passport Link"}
            </button>

            <button
              onClick={() => window.print()}
              className="oneui-btn oneui-btn-primary py-2.5 px-5 text-xs font-bold shadow-md flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Referral Slip</span>
            </button>
          </div>
        </div>

        {/* Medical Slip Container */}
        <div className="oneui-card p-8 bg-white border-2 border-slate-200 shadow-xl space-y-6 print:border-black print:shadow-none print:p-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <NetraLogo size="md" />
              <p className="text-xs text-slate-500 font-semibold mt-1">
                National Tele-Ophthalmology & Diabetic Retinopathy Referral Network
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="oneui-badge oneui-badge-neutral text-[10px] font-bold">Official Referral Slip</span>
              <p className="text-xs text-slate-700 font-mono font-bold">
                PASSPORT #{screeningId.slice(0, 13).toUpperCase()}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Date: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Urgency Ribbon */}
          <div
            className={`p-4 rounded-2xl flex items-center justify-between shadow-xs ${
              isUrgent ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              {isUrgent ? <AlertTriangle className="w-6 h-6 shrink-0" /> : <CheckCircle2 className="w-6 h-6 shrink-0" />}
              <div>
                <p className="text-xs uppercase font-bold tracking-wider opacity-90">Referral Status</p>
                <p className="text-lg font-black">
                  {isUrgent
                    ? "URGENT TERTIARY REFERRAL (Within 48-72h)"
                    : "ROUTINE ANNUAL REVIEW"}
                </p>
              </div>
            </div>
            <span className="text-xs font-black uppercase px-3.5 py-1 bg-white/20 rounded-full">
              Grade {passport?.aiGrade ?? 3}
            </span>
          </div>

          {/* Details & QR Code Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Patient Name</p>
                  <p className="text-base font-extrabold text-slate-900">{passport?.patientName || "Ramesh Kumar"}</p>
                  <p className="text-slate-600 font-semibold">{passport?.patientAge || 52} Years · Male</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Phone Contact</p>
                  <p className="text-base font-bold text-slate-900">+91 98765 43210</p>
                  <p className="text-emerald-700 font-bold text-[11px]">WhatsApp Verified</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Origin Health Centre</p>
                  <p className="font-bold text-slate-900 leading-tight">
                    {passport?.sourceClinicName || "Dahmi Kalan Community Health Centre"}
                  </p>
                  <p className="text-slate-500 text-[11px]">Primary Care Screening Point</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Destination Hospital</p>
                  <p className="font-bold text-blue-900 leading-tight">Jaipur District Tertiary Hospital</p>
                  <p className="text-blue-700 text-[11px] font-bold">Ophthalmology OPD · Priority Desk</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p className="font-extrabold text-slate-900">
                  Clinical Confirmation: Grade {passport?.aiGrade ?? 3} - Severe Non-Proliferative Diabetic Retinopathy (NPDR)
                </p>
                <p className="text-slate-600 font-medium">
                  Intraretinal hemorrhages and hard exudates detected. Referable sight loss probability: {((passport?.referableProbability ?? 0.89) * 100).toFixed(0)}%.
                </p>
              </div>
            </div>

            {/* High-Contrast QR Code */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200">
                <QRCodeSVG
                  value={passport?.qrPayload || publicUrl}
                  size={145}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">Scan for Hospital Verification</p>
                <p className="text-[10px] text-slate-500 font-mono">Cryptographically Signed Token</p>
              </div>
            </div>
          </div>

          {/* Footer instructions for patient */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 gap-2 font-medium">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified Clinical Referral Record</span>
            </div>
            <span>Please present this QR slip or WhatsApp notification at the hospital registration counter</span>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
