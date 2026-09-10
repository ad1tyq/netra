"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "../../../components/auth/ProtectedRoute";
import { useAuth } from "../../../context/AuthContext";
import { apiClient, Clinic, PatientRegistrationRequest } from "../../../lib/api";
import {
  ArrowLeft,
  UserPlus,
  Building2,
  Phone,
  MapPin,
  AlertCircle,
  Loader2,
  Camera,
  HeartPulse,
} from "lucide-react";

export default function PatientIntakePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState(user?.clinicId || "");

  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("+91");
  const [village, setVillage] = useState("");

  const [rbsLevel, setRbsLevel] = useState<number | "">("");
  const [isDiabetic, setIsDiabetic] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClinics() {
      try {
        const data = await apiClient.clinics.getAll();
        if (data && data.length > 0) {
          setClinics(data);
          if (!selectedClinicId) {
            setSelectedClinicId(user?.clinicId || data[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load clinics from backend:", e);
      }
    }
    loadClinics();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const activeUserId =
      user?.userId ||
      (typeof window !== "undefined"
        ? (() => {
            try {
              return JSON.parse(localStorage.getItem("netra_user") || "{}")?.userId;
            } catch {
              return null;
            }
          })()
        : null) ||
      "b0000000-0000-0000-0000-000000000001";

    try {
      const clientUuid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : undefined;

      const clinicToAssign =
        selectedClinicId ||
        user?.clinicId ||
        (clinics[0]?.id) ||
        "a0000000-0000-0000-0000-000000000001";

      const payload: PatientRegistrationRequest = {
        clinicId: clinicToAssign,
        createdBy: activeUserId,
        demographics: {
          name,
          age: Number(age) || 45,
          gender,
          phone,
          village,
        },
        rbsLevel: rbsLevel ? Number(rbsLevel) : undefined,
        isDiabetic,
      };

      if (clientUuid) {
        payload.clientUuid = clientUuid;
      }

      const registeredPatient = await apiClient.patients.register(payload);
      router.push(`/technician/capture/${registeredPatient.id}`);
    } catch (err: unknown) {
      console.error("Patient registration failed:", err);
      const apiErr = err as { response?: { data?: { message?: string } | string } };
      const serverMsg =
        apiErr?.response?.data && typeof apiErr.response.data === "object" && "message" in apiErr.response.data
          ? (apiErr.response.data as { message: string }).message
          : typeof apiErr?.response?.data === "string"
          ? apiErr.response.data
          : null;
      setError(serverMsg || "Failed to register patient in clinic database. Please verify the entered data.");
    } finally {
      setIsLoading(false);
    }
  };

  const rbsNum = Number(rbsLevel);

  return (
    <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
      <div className="web-container py-8 max-w-4xl space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link
            href="/technician/dashboard"
            className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">New Patient Registration</h1>
            <p className="text-xs text-slate-500 font-semibold">
              Step 1 of 3: Primary Clinical Intake & Glycemic Status
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Health Centre Card */}
          <div className="oneui-card p-6 bg-white space-y-4 border-l-4 border-l-blue-600">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Screening Centre Selection</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Primary / Community Health Centre (CHC / PHC)
              </label>
              <select
                value={selectedClinicId}
                onChange={(e) => setSelectedClinicId(e.target.value)}
                className="oneui-input cursor-pointer font-bold text-slate-800"
              >
                {clinics.length === 0 ? (
                  <option value="a0000000-0000-0000-0000-000000000001">
                    Dahmi Kalan Community Health Centre (CHC)
                  </option>
                ) : (
                  clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name} ({clinic.tier})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Demographics Card */}
          <div className="oneui-card p-6 sm:p-8 bg-white space-y-5 border-l-4 border-l-indigo-600">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <span>Patient Demographics</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="oneui-input font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile / WhatsApp Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="oneui-input pl-10 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Age (Years) *
                </label>
                <input
                  type="number"
                  required
                  min="5"
                  max="110"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                  placeholder="e.g. 52"
                  className="oneui-input font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="oneui-input cursor-pointer font-bold"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Village / Ward / Residence Address *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Village Dahmi Kalan, Panchayat Samiti Sanganer"
                    className="oneui-input pl-10 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Diabetic History Card */}
          <div className="oneui-card p-6 sm:p-8 bg-white space-y-5 border-l-4 border-l-amber-500">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <HeartPulse className="w-5 h-5 text-amber-600" />
              <span>Random Blood Sugar (RBS Level)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  RBS Level (mg/dL)
                </label>
                <input
                  type="number"
                  min="40"
                  max="600"
                  value={rbsLevel}
                  onChange={(e) => setRbsLevel(e.target.value ? Number(e.target.value) : "")}
                  placeholder="e.g. 240"
                  className="oneui-input font-bold"
                />

                {rbsNum > 0 && (
                  <div className="mt-2 text-xs font-bold">
                    {rbsNum > 200 ? (
                      <span className="text-rose-600 flex items-center gap-1">
                        ⚠️ High glycemic level (&gt; 200 mg/dL) - Significant risk of vascular retinal damage!
                      </span>
                    ) : rbsNum > 140 ? (
                      <span className="text-amber-600 flex items-center gap-1">
                        ⚡ Elevated blood sugar (140-200 mg/dL) - Monitoring recommended.
                      </span>
                    ) : (
                      <span className="text-emerald-600 flex items-center gap-1">
                        ✅ Normal blood sugar range (&lt; 140 mg/dL)
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Known Diabetic Status
                </label>
                <div className="flex items-center gap-4 pt-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="diabetic"
                      checked={isDiabetic}
                      onChange={() => setIsDiabetic(true)}
                      className="w-4 h-4 text-blue-600"
                    />
                    Diagnosed Diabetic
                  </label>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="diabetic"
                      checked={!isDiabetic}
                      onChange={() => setIsDiabetic(false)}
                      className="w-4 h-4 text-blue-600"
                    />
                    Non-Diabetic / Unknown
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-3 pt-2">
            <Link href="/technician/dashboard" className="oneui-btn oneui-btn-outline font-bold">
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isLoading}
              className="oneui-btn oneui-btn-primary py-3.5 px-8 text-sm font-bold shadow-lg disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Registering Patient...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" /> Proceed to Fundus Photo Capture
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
