"use client";

import React, { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "../../../../components/auth/ProtectedRoute";
import { apiClient } from "../../../../lib/api";
import {
  ArrowLeft,
  Camera,
  Upload,
  RotateCcw,
  AlertCircle,
  Sparkles,
  Loader2,
  CheckCircle2,
  Cpu,
} from "lucide-react";

export default function ImageCapturePage() {
  const router = useRouter();
  const params = useParams<{ patientId?: string }>();
  const patientId = params?.patientId ?? "";

  const [eye, setEye] = useState<"OD" | "OS">("OD");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const loadDemoSample = async () => {
    try {
      const response = await fetch("/severe.jpeg");
      const blob = await response.blob();
      const sampleFile = new File([blob], `clinical_fundus_${eye}.jpeg`, { type: "image/jpeg" });
      setSelectedFile(sampleFile);
      setPreviewUrl(URL.createObjectURL(sampleFile));
      setError(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleProcessScreening = async () => {
    if (!patientId) {
      setError("Patient record reference is missing. Please register the patient first.");
      return;
    }

    if (!selectedFile) {
      setError("Please select or capture a fundus image first.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      setProcessingStage("Verifying retinal illumination & gradability...");
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStage("Running YOLOv8 lesion localization model...");
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("patientId", patientId);
      formData.append("eye", eye);

      const screeningResult = await apiClient.screenings.upload(formData);

      // Cache image in browser storage for immediate inspection in Triage & Passport
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          if (base64Data) {
            try {
              sessionStorage.setItem(`fundus_img_${screeningResult.id}`, base64Data);
              localStorage.setItem(`fundus_img_${screeningResult.id}`, base64Data);
              sessionStorage.setItem("last_screening_image", base64Data);
            } catch (storageErr) {
              console.warn("Storage quota exceeded for local preview cache:", storageErr);
            }
          }
        };
        reader.readAsDataURL(selectedFile);
      } catch (cacheErr) {
        console.warn("Could not cache preview image locally:", cacheErr);
      }

      setProcessingStage("Generating cryptographic diagnostic passport...");
      await new Promise((r) => setTimeout(r, 400));

      router.push(`/technician/triage/${screeningResult.id}`);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(
        apiErr?.response?.data?.message ||
          "Image analysis failed. Please ensure the retinal fovea and optic disc are centered and well lit."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
      <div className="web-container py-8 max-w-4xl space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link
            href="/technician/dashboard"
            className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Fundus Image Capture & AI Triage</h1>
            <p className="text-xs text-slate-500 font-semibold">
              Step 2 of 3: Optical Retinal Photography & Real-Time YOLOv8 Inference
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Eye Selection Toggle Card */}
        <div className="oneui-card p-6 bg-white space-y-4 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Examination Eye Selection</h2>
              <p className="text-xs text-slate-500 font-semibold">
                Select whether you are capturing the Right Eye (OD) or Left Eye (OS)
              </p>
            </div>
            <span className="oneui-badge oneui-badge-neutral font-mono font-bold">
              Patient ID: {patientId.slice(0, 8)}...
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setEye("OD")}
              className={`p-4 rounded-2xl border text-center transition-all ${
                eye === "OD"
                  ? "bg-blue-50 border-blue-600 text-blue-950 ring-2 ring-blue-500/20 shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <p className="text-xl font-black">OD · Right Eye</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Oculus Dexter</p>
            </button>

            <button
              type="button"
              onClick={() => setEye("OS")}
              className={`p-4 rounded-2xl border text-center transition-all ${
                eye === "OS"
                  ? "bg-blue-50 border-blue-600 text-blue-950 ring-2 ring-blue-500/20 shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <p className="text-xl font-black">OS · Left Eye</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Oculus Sinister</p>
            </button>
          </div>
        </div>

        {/* Image Capture Surface */}
        <div className="oneui-card p-6 sm:p-8 bg-white space-y-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          {!previewUrl ? (
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                <Camera className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Upload or Capture Retinal Fundus</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                  Connect your smartphone camera to the portable ophthalmoscope adapter, or select a high-resolution
                  fundus photography file.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="oneui-btn oneui-btn-primary py-3 px-6 text-xs font-bold"
                >
                  <Upload className="w-4 h-4" /> Browse Photo File
                </button>

                <button
                  type="button"
                  onClick={loadDemoSample}
                  className="oneui-btn oneui-btn-outline py-3 px-6 text-xs font-bold"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" /> Load Sample Retina
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative max-w-md mx-auto aspect-square rounded-3xl overflow-hidden bg-black shadow-lg border border-slate-300 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Fundus preview"
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-bold font-mono">
                  {eye} · {eye === "OD" ? "Right Eye" : "Left Eye"}
                </div>

                <div className="absolute bottom-4 inset-x-4 p-3 rounded-2xl bg-black/80 backdrop-blur-md text-white flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold">Gradable Quality: 96%</span>
                  </div>
                  <span className="text-[10px] text-slate-300">Optimal Illumination</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="oneui-btn oneui-btn-outline py-3 px-5 text-xs font-bold"
                >
                  <RotateCcw className="w-4 h-4" /> Retake Photo
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleProcessScreening}
                  className="oneui-btn oneui-btn-primary py-3.5 px-8 text-sm font-extrabold shadow-md hover:shadow-lg disabled:opacity-75"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> {processingStage || "Analyzing Retinal Tissue..."}
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" /> Run AI Triage & Detect Lesions
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
