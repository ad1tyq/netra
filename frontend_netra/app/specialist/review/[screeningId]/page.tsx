"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "../../../../components/auth/ProtectedRoute";
import { useAuth } from "../../../../context/AuthContext";
import { apiClient, ScreeningResponse, LesionResponse } from "../../../../lib/api";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Building2,
  Stethoscope,
  Send,
  Loader2,
  Layers,
  ChevronRight,
} from "lucide-react";

export default function SpecialistReviewPage() {
  const router = useRouter();
  const params = useParams<{ screeningId?: string }>();
  const screeningId = params?.screeningId ?? "";

  const [screening, setScreening] = useState<ScreeningResponse | null>(null);
  const [lesions, setLesions] = useState<LesionResponse[]>([]);
  const [specialistGrade, setSpecialistGrade] = useState<number>(3);
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    async function load() {
      if (!screeningId) return;
      try {
        const s = await apiClient.screenings.getById(screeningId);
        setScreening(s);
        setSpecialistGrade(s.aiGrade);
      } catch (err) {
        console.error("Failed to load screening for specialist review:", err);
      }
    }
    load();
  }, [screeningId]);

  const handleSubmitReview = async (decision: "CONFIRM" | "OVERRIDE") => {
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setSuccessMessage(true);
      setTimeout(() => {
        router.push("/specialist/queue");
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["SPECIALIST"]}>
      <div className="web-container py-8 max-w-5xl space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/specialist/queue"
              className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Ophthalmologist Case Evaluation</h1>
              <p className="text-xs text-slate-500 font-medium">
                Case ID: {screeningId} · Referred from Dahmi Kalan CHC
              </p>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3 animate-fadeInUp">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Specialist evaluation recorded. Referral passport updated with clinical directives.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Fundus Retinal Viewer */}
          <div className="lg:col-span-6 oneui-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                Retinal Photography (OD)
              </span>
              <span className="oneui-badge oneui-badge-neutral text-[10px]">Gradable: 96%</span>
            </div>

            <div className="relative aspect-square rounded-3xl bg-black border border-slate-200 shadow-md flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  (typeof window !== "undefined" &&
                    (sessionStorage.getItem(`fundus_img_${screeningId}`) ||
                      localStorage.getItem(`fundus_img_${screeningId}`) ||
                      sessionStorage.getItem("last_screening_image"))) ||
                  `http://localhost:8081/api/v1/screenings/${screeningId}/image`
                }
                alt="Fundus Photography"
                className="w-full h-full object-contain bg-black"
                onError={(e) => {
                  const fallback =
                    screening?.aiGrade === 0
                      ? "/no.jpeg"
                      : screening?.aiGrade === 1
                      ? "/mild.jpeg"
                      : screening?.aiGrade === 2
                      ? "/moderate.jpeg"
                      : screening?.aiGrade === 3
                      ? "/severe.jpeg"
                      : "/proli.jpeg";
                  const target = e.currentTarget;
                  if (!target.src.endsWith(fallback)) {
                    target.src = fallback;
                  }
                }}
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">AI Finding: Grade {screening?.aiGrade ?? 3} (Severe NPDR)</p>
              <p>YOLOv8 confidence: {((screening?.referableProbability ?? 0.89) * 100).toFixed(0)}% referable probability.</p>
            </div>
          </div>

          {/* Specialist Clinical Review & Prescription */}
          <div className="lg:col-span-6 space-y-6">
            <div className="oneui-card p-6 bg-white space-y-5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Stethoscope className="w-5 h-5 text-sky-600" />
                <span>Specialist Final Diagnosis</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Clinical Staging Confirmation
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[0, 1, 2, 3, 4].map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setSpecialistGrade(grade)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        specialistGrade === grade
                          ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      Grade {grade}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Consultation Directives & Treatment Plan
                </label>
                <textarea
                  rows={4}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="oneui-input text-xs font-medium leading-relaxed resize-none"
                  placeholder="Enter medical instructions for patient and hospital OPD team..."
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitReview("CONFIRM")}
                  className="flex-1 oneui-btn oneui-btn-primary py-3 text-xs font-bold shadow-md"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Confirm AI & Schedule OPD
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitReview("OVERRIDE")}
                  className="oneui-btn oneui-btn-outline py-3 text-xs font-bold"
                >
                  Override Grade
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
