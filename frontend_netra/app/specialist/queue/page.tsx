"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "../../../components/auth/ProtectedRoute";
import { useAuth } from "../../../context/AuthContext";
import { apiClient } from "../../../lib/api";
import {
  ChevronRight,
  Stethoscope,
  CheckCircle2,
  Search,
  Loader2,
} from "lucide-react";

interface QueueItem {
  screeningId: string;
  patientName: string;
  patientAge: number;
  patientPhone: string;
  sourceClinic: string;
  aiGrade: number;
  gradeName: string;
  referableProbability: number;
  eye: string;
  timeAgo: string;
  urgent: boolean;
  lesionSummary: string;
}

const GRADE_NAMES = [
  "Normal Retina",
  "Mild NPDR",
  "Moderate NPDR",
  "Severe NPDR",
  "Proliferative DR",
];

export default function SpecialistQueuePage() {
  const { clinicName } = useAuth();
  const [filter, setFilter] = useState<"ALL" | "URGENT" | "PENDING">("ALL");
  const [search, setSearch] = useState("");
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadQueue() {
      try {
        setIsLoading(true);
        const data = await apiClient.screenings.getAll();
        const mapped: QueueItem[] = data.map((s) => ({
          screeningId: s.id,
          patientName: s.patientName || "Ramesh Kumar",
          patientAge: s.patientAge || 52,
          patientPhone: s.patientPhone || "+919876543210",
          sourceClinic: s.clinicName || "Dahmi Kalan Community Health Centre",
          aiGrade: s.aiGrade,
          gradeName: GRADE_NAMES[s.aiGrade] || `Grade ${s.aiGrade}`,
          referableProbability: s.referableProbability,
          eye: s.eye,
          timeAgo: s.createdAt
            ? new Date(s.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
            : "Recent",
          urgent: s.aiGrade >= 3,
          lesionSummary:
            s.lesions && s.lesions.length > 0
              ? s.lesions.map((l) => `${l.lesionType} (${(l.confidence * 100).toFixed(0)}%)`).join(", ")
              : "Retinal microaneurysms detected",
        }));
        setQueueItems(mapped);
      } catch (err) {
        console.error("Failed to load specialist queue from backend:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadQueue();
  }, []);

  const urgentCount = queueItems.filter((item) => item.urgent).length;
  const moderateCount = queueItems.filter((item) => !item.urgent).length;

  const filteredItems = queueItems.filter((item) => {
    const matchesSearch =
      item.patientName.toLowerCase().includes(search.toLowerCase()) ||
      item.patientPhone.includes(search);
    if (filter === "URGENT") return matchesSearch && item.urgent;
    if (filter === "PENDING") return matchesSearch && !item.urgent;
    return matchesSearch;
  });

  return (
    <ProtectedRoute allowedRoles={["SPECIALIST"]}>
      <div className="web-container py-8 space-y-6">
        {/* Header Strip */}
        <div className="oneui-hero-banner-sky p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-800/80 text-sky-200 text-xs font-bold uppercase tracking-wider border border-sky-400/30">
              <Stethoscope className="w-3.5 h-3.5 text-sky-300" />
              Retina Department · {clinicName}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-xs">
              Specialist Tele-Triage Review Queue
            </h1>
            <p className="text-sky-100 text-sm max-w-xl font-medium leading-relaxed">
              High-priority referrals from rural Community Health Centres awaiting ophthalmologist verification,
              anti-VEGF planning, and surgical slot scheduling.
            </p>
          </div>

          <div className="flex items-center gap-4 text-center">
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
              <p className="text-2xl font-extrabold text-white">{urgentCount}</p>
              <p className="text-[11px] font-semibold text-rose-300">Urgent Cases</p>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
              <p className="text-2xl font-extrabold text-white">{queueItems.length}</p>
              <p className="text-[11px] font-semibold text-sky-200">Total Referrals</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="oneui-card p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setFilter("ALL")}
              className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all ${filter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
            >
              All Referrals ({queueItems.length})
            </button>
            <button
              onClick={() => setFilter("URGENT")}
              className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all ${filter === "URGENT" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Urgent Referrals ({urgentCount})
            </button>
            <button
              onClick={() => setFilter("PENDING")}
              className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all ${filter === "PENDING" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Moderate Risk ({moderateCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient name..."
              className="oneui-input pl-9 py-2 text-xs"
            />
          </div>
        </div>

        {/* Queue Items List */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
            <p className="text-sm font-semibold">Loading specialist referral queue from clinic network...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="oneui-card p-12 bg-white text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-900 text-lg">No Referrals Pending Review</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All diabetic retinopathy screenings across regional CHCs have been reviewed or triaged.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <Link
                key={item.screeningId}
                href={`/specialist/review/${item.screeningId}`}
                className="block oneui-card p-6 bg-white hover:border-sky-400 transition-all hover:shadow-md"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          item.urgent
                            ? "oneui-badge oneui-badge-danger"
                            : "oneui-badge oneui-badge-warning"
                        }
                      >
                        {item.urgent ? "🚨 Urgent Tertiary Referral" : "Moderate Risk Review"}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {item.eye} Eye · {item.timeAgo}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{item.patientName}</h3>
                      <p className="text-xs text-slate-500">
                        {item.patientAge} Years · {item.patientPhone} · Origin: {item.sourceClinic}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      <span className="font-bold text-slate-700">AI Assessment:</span> Grade {item.aiGrade} ({item.gradeName}) · Probability: {(item.referableProbability * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      Lesions: {item.lesionSummary}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="oneui-btn oneui-btn-primary text-xs py-2 px-4 shadow-sm">
                      Open Clinical Case <ChevronRight className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
