"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "../../../components/auth/ProtectedRoute";
import { apiClient, ContributedRecord } from "../../../lib/api";
import {
  ArrowLeft,
  Check,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function AdminReviewQueuePage() {
  const [queue, setQueue] = useState<ContributedRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadQueue() {
      try {
        setIsLoading(true);
        const data = await apiClient.contributions.getQueue();
        setQueue(data || []);
      } catch (err) {
        console.error("Failed to load contribution queue from backend:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadQueue();
  }, []);

  const handleDecision = async (id: string, decision: "APPROVED" | "REJECTED" | "ACCEPTED") => {
    try {
      await apiClient.contributions.updateReviewStatus(id, decision);
    } catch (err) {
      console.error("Failed to update status in backend:", err);
    }
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, reviewStatus: decision } : item))
    );
    setMessage(`Record ${id} marked as ${decision}.`);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="web-container py-8 max-w-4xl space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/contribute"
              className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dataset Review Queue</h1>
              <p className="text-xs text-slate-500 font-medium">
                Verify and approve clinical study submissions before retraining the YOLOv8 model weights
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3 animate-fadeInUp">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-semibold">Loading contribution queue from server...</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="oneui-card p-12 bg-white text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-900 text-lg">No Contributions Pending Review</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All ground-truth datasets submitted by clinical research teams have been verified and processed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map((record) => (
              <div
                key={record.id}
                className="oneui-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        record.reviewStatus === "APPROVED" || record.reviewStatus === "ACCEPTED"
                          ? "oneui-badge oneui-badge-success"
                          : record.reviewStatus === "REJECTED"
                          ? "oneui-badge oneui-badge-danger"
                          : "oneui-badge oneui-badge-warning"
                      }
                    >
                      {record.reviewStatus === "PENDING_REVIEW" ? "PENDING REVIEW" : record.reviewStatus}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-bold">
                      Case #{record.id.slice(0, 13)} · Ground Truth: Grade {record.groundTruthGrade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold">{record.imagePath || record.lesionAnnotations || "Fundus Photography Study"}</p>
                  <p className="text-[11px] text-slate-400">
                    Hospital: {record.hospital?.name || "Community Health Centre"} · Anonymized Field Record
                  </p>
                </div>

                {(record.reviewStatus === "PENDING" || record.reviewStatus === "PENDING_REVIEW") && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDecision(record.id, "APPROVED")}
                      className="oneui-btn oneui-btn-primary py-2 px-4 text-xs font-bold shadow-sm"
                    >
                      <Check className="w-4 h-4" /> Approve for Retraining
                    </button>

                    <button
                      onClick={() => handleDecision(record.id, "REJECTED")}
                      className="oneui-btn oneui-btn-outline py-2 px-3 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
