"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { NetraLogo } from "../components/branding/NetraLogo";
import {
  Camera,
  ShieldCheck,
  Send,
  MessageSquare,
  QrCode,
  ArrowRight,
  Activity,
  CheckCircle2,
  Building2,
  Users,
  Cpu,
} from "lucide-react";

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeGradeIndex, setActiveGradeIndex] = useState(3);

  const dashboardUrl =
    user?.role === "SPECIALIST"
      ? "/specialist/queue"
      : user?.role === "ADMIN"
      ? "/admin/contribute"
      : "/technician/dashboard";

  const drStages = [
    {
      grade: 0,
      name: "No DR (Normal Retina)",
      image: "/no.jpeg",
      urgency: "Low Risk",
      urgencyColor: "success",
      badgeClass: "oneui-badge-success",
      prob: "0.04",
      referral: "Routine annual follow-up at community health centre.",
      lesions: "Clear fundus with healthy fovea and sharp optic disc margins.",
      lesionItems: [],
    },
    {
      grade: 1,
      name: "Mild NPDR",
      image: "/mild.jpeg",
      urgency: "Moderate Risk",
      urgencyColor: "info",
      badgeClass: "oneui-badge-info",
      prob: "0.18",
      referral: "Repeat screening in 6 to 12 months with glycemic control monitoring.",
      lesions: "Isolated microaneurysms detected in macula periphery.",
      lesionItems: ["Microaneurysms (x2)"],
    },
    {
      grade: 2,
      name: "Moderate NPDR",
      image: "/moderate.jpeg",
      urgency: "Specialist Review Required",
      urgencyColor: "warning",
      badgeClass: "oneui-badge-warning",
      prob: "0.45",
      referral: "Tele-ophthalmology consult within 30 days. Diet and insulin titration.",
      lesions: "Multiple microaneurysms, dot-and-blot hemorrhages, and hard exudates.",
      lesionItems: ["Hemorrhages (x4)", "Hard Exudates (x2)"],
    },
    {
      grade: 3,
      name: "Severe NPDR",
      image: "/severe.jpeg",
      urgency: "URGENT REFERRAL REQUIRED",
      urgencyColor: "danger",
      badgeClass: "oneui-badge-danger",
      prob: "0.89",
      referral: "Urgent referral to Tertiary Eye Hospital within 48-72 hours. Anti-VEGF / Laser evaluation.",
      lesions: "Dense hemorrhages in 4 quadrants, venous beading, cotton wool spots.",
      lesionItems: ["Flame Hemorrhages (x8)", "Exudates (x5)", "Cotton Wool Spots (x3)"],
    },
    {
      grade: 4,
      name: "Proliferative DR (PDR)",
      image: "/proli.jpeg",
      urgency: "CRITICAL EMERGENCY",
      urgencyColor: "danger",
      badgeClass: "oneui-badge-danger",
      prob: "0.98",
      referral: "Immediate surgical intervention required to prevent permanent vitreous hemorrhage or retinal detachment.",
      lesions: "Extensive neovascularization of disc (NVD), pre-retinal fibrovascular proliferation.",
      lesionItems: ["Neovascularization", "Vitreous Fibrosis", "Dense Exudates"],
    },
  ];

  const currentStage = drStages[activeGradeIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/60">
        <div className="web-container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Main Headline */}
            <h1 className="oneui-heading-hero">
              Intelligent Eye Screening for <span className="text-blue-700">Rural Primary Care</span>
            </h1>

            {/* Subtitle */}
            <p className="oneui-heading-subtitle max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-medium">
              Equipping frontline healthcare workers with real-time fundus AI triage,
              explainable lesion localization, and closed-loop WhatsApp & SMS diagnostic referral passports.
            </p>

            {/* Action CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={isAuthenticated ? dashboardUrl : "/login"}
                className="oneui-btn oneui-btn-primary text-base py-3.5 px-8 shadow-md hover:shadow-lg w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <span>{isAuthenticated ? "Go to My Clinical Dashboard" : "Launch Clinical Portal"}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <a
                href="#how-it-works"
                className="oneui-btn oneui-btn-outline text-base py-3.5 px-8 w-full sm:w-auto font-bold"
              >
                Clinical Workflow
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                5-Stage DR Classification (Grade 0-4)
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-600" />
                YOLOv8 Lesion Detection (1.4s)
              </span>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Instant WhatsApp & SMS Referrals
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-600" />
                District Hospital Closed-Loop
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Clinical DR Triage Demo ─── */}
      <section id="clinical-grades" className="py-16 md:py-24 border-b border-slate-200 bg-white">
        <div className="web-container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="oneui-badge oneui-badge-info mb-3">Interactive Diagnostic Demo</span>
            <h2 className="oneui-heading-title">Explainable 5-Grade DR Classification</h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2 font-medium">
              Select any stage below to examine how retinal fundus images are analyzed, highlighting microvascular
              lesions and generating clinical referral guidance.
            </p>
          </div>

          {/* Grade Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 max-w-2xl mx-auto bg-slate-100 rounded-2xl mb-10 border border-slate-200">
            {drStages.map((stage, idx) => (
              <button
                key={stage.grade}
                onClick={() => setActiveGradeIndex(idx)}
                className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeGradeIndex === idx
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                Grade {stage.grade}
              </button>
            ))}
          </div>

          {/* Inspection Card */}
          <div className="max-w-4xl mx-auto oneui-card p-6 sm:p-8 bg-slate-50/50 border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Fundus Retinal Real Photography Display */}
              <div className="md:col-span-6 flex flex-col items-center">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-950 flex items-center justify-center group ring-1 ring-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentStage.image}
                    alt={currentStage.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider">
                    Fundus Photography
                  </div>
                  <div className="absolute bottom-3 inset-x-0 mx-auto w-fit px-3.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-bold shadow-md">
                    OD · {currentStage.name}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3.5 font-semibold text-center max-w-sm">
                  {currentStage.lesions}
                </p>
              </div>

              {/* Assessment Details */}
              <div className="md:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={currentStage.badgeClass}>
                    {currentStage.urgency}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    AI Probability: {(Number(currentStage.prob) * 100).toFixed(0)}%
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    Grade {currentStage.grade}: {currentStage.name}
                  </h3>
                  <p className="text-sm text-slate-700 mt-1 leading-relaxed font-medium">
                    {currentStage.referral}
                  </p>
                </div>

                {/* Detected Lesion Tags */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    YOLOv8 Localized Lesions:
                  </span>
                  {currentStage.lesionItems.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {currentStage.lesionItems.map((item, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Healthy microvasculature. No lesions identified.
                    </span>
                  )}
                </div>

                {/* Simulated Notification Preview */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 font-bold">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Dispatch Preview
                    </span>
                    <span className="text-[10px] text-slate-400">Instant SMS Fallback</span>
                  </div>
                  <p className="text-slate-800 font-mono text-[11px] leading-relaxed">
                    &quot;NETRA Clinical Alert: Ramesh Kumar, your eye screening indicates {currentStage.name}.
                    Recommended: Jaipur Tertiary Hospital. Passport: netra.clinic/passport/d000...&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4-Step Clinical Workflow ─── */}
      <section id="how-it-works" className="py-16 md:py-24 border-b border-slate-200 bg-slate-50">
        <div className="web-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="oneui-badge oneui-badge-info mb-3">Standard Operating Procedure</span>
            <h2 className="oneui-heading-title">Frontline Clinical Workflow in the Field</h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2 font-medium">
              Designed for community health workers with limited internet connectivity. Screenings take less than
              two minutes from patient intake to referral passport generation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="oneui-card p-6 bg-white space-y-4 hover:border-blue-400 border-t-4 border-t-blue-600">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-extrabold text-lg border border-blue-100">
                1
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Patient Registration</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Log demographics, RBS glucose level, and village address in under 45 seconds with offline auto-caching.
              </p>
              <div className="pt-2 text-xs font-bold text-blue-700 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> POST /api/v1/patients/register
              </div>
            </div>

            {/* Step 2 */}
            <div className="oneui-card p-6 bg-white space-y-4 hover:border-emerald-400 border-t-4 border-t-emerald-600">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-lg border border-emerald-100">
                2
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Fundus Image Capture</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Capture optical fundus through portable ophthalmoscope. Real-time edge quality check prevents ungradable blur.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" /> OD / OS Eye Selection
              </div>
            </div>

            {/* Step 3 */}
            <div className="oneui-card p-6 bg-white space-y-4 hover:border-amber-400 border-t-4 border-t-amber-500">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-extrabold text-lg border border-amber-100">
                3
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">AI Triage & Lesions</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                YOLOv8 detects microvascular lesions (exudates, hemorrhages) in 1.4s, assigning a verified DR Grade (0-4).
              </p>
              <div className="pt-2 text-xs font-bold text-amber-700 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> Decision Threshold: 0.40
              </div>
            </div>

            {/* Step 4 */}
            <div className="oneui-card p-6 bg-white space-y-4 hover:border-rose-400 border-t-4 border-t-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-extrabold text-lg border border-rose-100">
                4
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Referral Passport</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Auto-generates signed QR Diagnostic Passport. Dispatches instant WhatsApp & SMS to patient and family.
              </p>
              <div className="pt-2 text-xs font-bold text-rose-700 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5" /> Closed-Loop Referral
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WhatsApp & SMS Reporting Engine ─── */}
      <section id="dispatch-engine" className="py-16 md:py-24 border-b border-slate-200 bg-white">
        <div className="web-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="oneui-badge oneui-badge-success">Dual-Engine Delivery</span>
              <h2 className="oneui-heading-title">
                Reliable WhatsApp & SMS Delivery for Rural Health
              </h2>
              <p className="text-slate-600 text-base leading-relaxed font-medium">
                In rural and peri-urban field setups, external servers may experience network interruptions. NETRA
                uses a <strong>Dual-Engine Architecture</strong> guaranteeing patient notification under any condition:
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Engine 1: Direct 1-Click Field Dispatch</h4>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      Send the report directly from the phone or tablet via WhatsApp Web or App
                      using pre-formatted clinical referral templates with zero server dependency.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Engine 2: Automated Cloud Gateway</h4>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      Backend queue triggers automated WhatsApp messages upon completion of screening, with automated
                      fallback to SMS if WhatsApp delivery fails.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Cryptographic QR Diagnostic Passport</h4>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      Each referral includes a signed cryptographic token that the district tertiary hospital can
                      scan offline without needing physical paper records.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Preview */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="oneui-card w-full max-w-md p-6 bg-slate-50 border-slate-200 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs">
                      WA
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">NETRA Clinical Bot</p>
                      <p className="text-[10px] text-emerald-700 font-bold">Verified Medical Channel</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">10:42 AM</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2.5 shadow-2xs">
                  <p className="font-extrabold text-slate-900">
                    *NETRA Eye Screening Clinical Alert*
                  </p>
                  <p className="text-slate-600 font-medium">
                    Hello <strong>Ramesh Kumar</strong>, your recent eye checkup at <em>Dahmi Kalan CHC</em> has
                    been processed.
                  </p>
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                    <p className="font-extrabold">⚠️ Screening Result: Grade 3 (Severe NPDR)</p>
                    <p className="text-[11px] font-semibold">Recommendation: Urgent Ophthalmologist Consultation within 48h.</p>
                  </div>
                  <div className="space-y-1 text-slate-700 text-[11px] font-medium">
                    <p>🏥 <strong>Target Clinic:</strong> Jaipur District Tertiary Hospital</p>
                    <p>📍 <strong>Distance:</strong> 26.4 km from your CHC</p>
                    <p>
                      🔗 <strong>Diagnostic Passport:</strong>{" "}
                      <span className="text-blue-600 underline font-bold">https://netra.clinic/passport/d000...</span>
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1 font-medium">
                    Show this message or the QR code at the registration counter for priority triage.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 oneui-btn oneui-btn-whatsapp py-2.5 text-xs font-bold">
                    <MessageSquare className="w-4 h-4" /> Open in WhatsApp
                  </button>
                  <button className="oneui-btn oneui-btn-outline py-2.5 text-xs font-bold">
                    <QrCode className="w-4 h-4" /> View QR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Impact Statistics ─── */}
      <section id="impact" className="py-16 md:py-20 border-b border-slate-200 bg-slate-100/60">
        <div className="web-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="oneui-card p-6 bg-white">
              <p className="text-3xl sm:text-4xl font-black text-blue-700">77M+</p>
              <p className="text-xs sm:text-sm font-bold text-slate-600 mt-1">
                Diabetic Population in India
              </p>
            </div>

            <div className="oneui-card p-6 bg-white">
              <p className="text-3xl sm:text-4xl font-black text-rose-600">82%</p>
              <p className="text-xs sm:text-sm font-bold text-slate-600 mt-1">
                Rural Lack of Eye Care Access
              </p>
            </div>

            <div className="oneui-card p-6 bg-white">
              <p className="text-3xl sm:text-4xl font-black text-emerald-600">&lt; 1.5s</p>
              <p className="text-xs sm:text-sm font-bold text-slate-600 mt-1">
                YOLOv8 Edge Inference Time
              </p>
            </div>

            <div className="oneui-card p-6 bg-white">
              <p className="text-3xl sm:text-4xl font-black text-amber-600">100%</p>
              <p className="text-xs sm:text-sm font-bold text-slate-600 mt-1">
                Offline-First Screening Cache
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA Banner (Fixed high contrast colors!) ─── */}
      <section className="py-16 bg-white">
        <div className="web-container">
          <div className="oneui-card-dark rounded-3xl p-8 sm:p-14 text-center space-y-6">
            <div className="max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Ready to Screen Patients?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
                Access the clinical portal to register patients, perform edge fundus AI assessments, and
                dispatch diagnostic referral passports.
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <Link
                href={isAuthenticated ? dashboardUrl : "/login"}
                className="oneui-btn bg-white text-slate-950 hover:bg-slate-100 py-3.5 px-8 text-sm font-extrabold shadow-lg flex items-center gap-2"
              >
                <span>{isAuthenticated ? "Go to My Clinical Dashboard" : "Sign In to Clinical Portal"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="pt-10 pb-8 border-t border-slate-200 bg-slate-50 text-slate-500 text-xs font-semibold">
        <div className="web-container flex flex-col md:flex-row items-center justify-between gap-4">
          <NetraLogo size="sm" />
          <p>© 2026 NETRA Tele-Ophthalmology Network. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
