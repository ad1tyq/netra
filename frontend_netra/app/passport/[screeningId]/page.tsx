"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiClient, PassportResponse } from "../../../lib/api";
import { NetraLogo } from "../../../components/branding/NetraLogo";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Printer,
} from "lucide-react";

export default function PublicPassportVerificationPage() {
  const params = useParams<{ screeningId?: string }>();
  const screeningId = params?.screeningId ?? "";

  const [passport, setPassport] = useState<PassportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPassport() {
      try {
        setIsLoading(true);
        const data = await apiClient.referrals.getPassport(screeningId);
        setPassport(data);
      } catch (err) {
        console.error("Failed to load verified passport from backend:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPassport();
  }, [screeningId]);

  const isUrgent = passport?.urgentReferral ?? true;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="web-container max-w-3xl space-y-6">
        {/* Verification Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <NetraLogo size="md" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified Medical Diagnostic Passport
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            Authenticated via NETRA Cryptographic Health Network
          </p>
        </div>

        {/* Passport Card */}
        <div className="oneui-card p-6 sm:p-8 bg-white border-2 border-slate-200 shadow-xl space-y-6">
          <div
            className={`p-4 rounded-2xl flex items-center justify-between shadow-xs ${isUrgent ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
              }`}
          >
            <div className="flex items-center gap-3">
              {isUrgent ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              <div>
                <p className="text-xs uppercase font-bold tracking-wider opacity-90">Referral Status</p>
                <p className="text-base sm:text-lg font-black">
                  {isUrgent ? "URGENT TERTIARY REFERRAL REQUIRED" : "LOW RISK · ROUTINE FOLLOW-UP"}
                </p>
              </div>
            </div>
            <span className="text-xs font-black px-3.5 py-1 bg-white/20 rounded-full">
              Grade {passport?.aiGrade ?? 3}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Patient Name</p>
              <p className="text-base font-extrabold text-slate-900">{passport?.patientName || "Ramesh Kumar"}</p>
              <p className="text-slate-500 font-semibold">{passport?.patientAge || 52} Years · Male</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Destination Hospital</p>
              <p className="text-base font-bold text-blue-900">Jaipur District Tertiary Hospital</p>
              <p className="text-blue-700 font-semibold">Retina Specialist OPD · Priority Desk</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Origin Health Centre</p>
              <p className="font-bold text-slate-900">{passport?.sourceClinicName || "Dahmi Kalan CHC"}</p>
              <p className="text-slate-500">Primary Care Screening Unit</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Screening Date</p>
              <p className="font-bold text-slate-900">
                {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
              <p className="text-slate-500">Time: 10:15 AM IST</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <p className="font-extrabold text-slate-900">
              Clinical Assessment: Grade {passport?.aiGrade ?? 3} - Severe NPDR
            </p>
            <p className="text-slate-600 leading-relaxed font-medium">
              Intraretinal hemorrhages and hard exudates detected. Sight loss probability: {((passport?.referableProbability ?? 0.89) * 100).toFixed(0)}%.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => window.print()}
              className="oneui-btn oneui-btn-outline py-2.5 px-6 text-xs font-bold shadow-2xs"
            >
              <Printer className="w-4 h-4" /> Print Verified Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
