import axios from "axios";

// Using relative path by default so Next.js rewrite proxy handles it smoothly without CORS issues
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 45000,
});

// Automatically inject JWT token from localStorage into Authorization header
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("jwt");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// TypeScript interfaces matching Spring Boot DTOs and entities
export interface Clinic {
  id: string;
  name: string;
  tier: string;
  latitude: number;
  longitude: number;
  hasSpecialist: boolean;
}

export interface PatientRegistrationRequest {
  clinicId: string;
  createdBy?: string;
  demographics: {
    name: string;
    age: number;
    gender: string;
    phone: string;
    village?: string;
  };
  rbsLevel?: number;
  isDiabetic?: boolean;
  clientUuid?: string;
}

export interface PatientResponse {
  id: string;
  clinicId: string;
  demographics: {
    name: string;
    age: number;
    gender: string;
    phone: string;
    village?: string;
  };
  rbsLevel?: number;
  isDiabetic?: boolean;
  createdBy: string;
  createdAt: string;
}

export interface LesionResponse {
  id: string;
  lesionType: "HEMORRHAGE" | "EXUDATE" | "COTTON_WOOL_SPOT" | "MICROANEURYSM";
  boxYmin: number;
  boxXmin: number;
  boxYmax: number;
  boxXmax: number;
  confidence: number;
}

export interface ScreeningResponse {
  id: string;
  patientId: string;
  eye: "OD" | "OS";
  aiGrade: number; // 0 to 4
  referableProbability: number;
  isReferable: boolean;
  qualityStatus: string;
  status: string;
  performedBy: string;
  createdAt: string;
  lesions?: LesionResponse[];
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  clinicName?: string;
}

export interface PassportResponse {
  screeningId: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  screeningDate: string;
  sourceClinicName: string;
  aiGrade: number;
  referableProbability: number;
  isReferable: boolean;
  urgentReferral: boolean;
  qrPayload: string;
}

export interface ClinicDistanceResponse {
  clinic: Clinic;
  distanceKm: number;
}

export interface NotificationResponse {
  id: string;
  channel: "WHATSAPP" | "SMS" | "SMS_FALLBACK";
  status: "QUEUED" | "SENT" | "FAILED" | "DELIVERED";
  providerMessageId?: string;
  payload: Record<string, any>;
  dispatchedAt?: string;
}

export interface ContributedRecord {
  id: string;
  contributorId?: string;
  imageUrl?: string;
  imagePath?: string;
  hospital?: {
    id: string;
    name: string;
    tier: string;
  };
  groundTruthGrade: number;
  lesionAnnotations?: string;
  metadata?: Record<string, any>;
  reviewStatus: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "PENDING" | "ACCEPTED";
  verifiedBy?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  fullName: string;
  role: "TECHNICIAN" | "SPECIALIST" | "ADMIN";
  clinicId?: string;
  email?: string;
}

// Typed API services
export const apiClient = {
  // Auth
  auth: {
    login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
      const res = await api.post("/api/v1/auth/login", credentials);
      return res.data;
    },
  },

  // Clinics
  clinics: {
    getAll: async (): Promise<Clinic[]> => {
      const res = await api.get("/api/v1/clinics");
      return res.data;
    },
  },

  // Patients
  patients: {
    getAll: async (): Promise<PatientResponse[]> => {
      const res = await api.get("/api/v1/patients");
      return res.data;
    },
    register: async (data: PatientRegistrationRequest): Promise<PatientResponse> => {
      const res = await api.post("/api/v1/patients/register", data);
      return res.data;
    },
    getById: async (id: string): Promise<PatientResponse> => {
      const res = await api.get(`/api/v1/patients/${id}`);
      return res.data;
    },
  },

  // Screenings
  screenings: {
    getAll: async (): Promise<ScreeningResponse[]> => {
      const res = await api.get("/api/v1/screenings");
      return res.data;
    },
    upload: async (formData: FormData): Promise<ScreeningResponse> => {
      const res = await api.post("/api/v1/screenings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    getById: async (id: string): Promise<ScreeningResponse> => {
      const res = await api.get(`/api/v1/screenings/${id}`);
      return res.data;
    },
    getLesions: async (screeningId: string): Promise<LesionResponse[]> => {
      const res = await api.get(`/api/v1/screenings/${screeningId}/lesions`);
      return res.data;
    },
  },

  // Passport & Referrals
  referrals: {
    getPassport: async (screeningId: string): Promise<PassportResponse> => {
      const res = await api.get(`/api/v1/referrals/${screeningId}/passport`);
      return res.data;
    },
  },

  // Routing
  routing: {
    getNearestSpecialist: async (lat: number, lng: number): Promise<ClinicDistanceResponse> => {
      const res = await api.get("/api/v1/routing/nearest-specialist", {
        params: { lat, lng },
      });
      return res.data;
    },
  },

  // Notifications (WhatsApp & SMS)
  notifications: {
    dispatch: async (screeningId: string, channel: "WHATSAPP" | "SMS"): Promise<NotificationResponse> => {
      const res = await api.post("/api/v1/notifications/dispatch", {
        screeningId,
        channel,
      });
      return res.data;
    },
    getStatus: async (notificationId: string): Promise<NotificationResponse> => {
      const res = await api.get(`/api/v1/notifications/${notificationId}/status`);
      return res.data;
    },
  },

  // Admin Data Contribution
  contributions: {
    getQueue: async (): Promise<ContributedRecord[]> => {
      const res = await api.get("/api/v1/contributions/queue");
      return res.data;
    },
    addManual: async (data: any): Promise<ContributedRecord> => {
      const res = await api.post("/api/v1/contributions/manual", data);
      return res.data;
    },
    addBulk: async (data: any): Promise<ContributedRecord[]> => {
      const res = await api.post("/api/v1/contributions/bulk-upload", data);
      return res.data;
    },
    updateReviewStatus: async (
      id: string,
      reviewStatus: "APPROVED" | "REJECTED" | "ACCEPTED",
      verifiedBy?: string
    ): Promise<ContributedRecord> => {
      // Map ACCEPTED to APPROVED for backend enum compatibility
      const backendStatus = reviewStatus === "ACCEPTED" ? "APPROVED" : reviewStatus;
      const res = await api.put(
        `/api/v1/contributions/${id}/review`,
        { reviewStatus: backendStatus },
        { params: verifiedBy ? { verifiedBy } : {} }
      );
      return res.data;
    },
  },

  // Offline Sync
  sync: {
    processOfflineSync: async (payload: any) => {
      const res = await api.post("/api/v1/sync/offline", payload);
      return res.data;
    },
  },
};

export default api;
