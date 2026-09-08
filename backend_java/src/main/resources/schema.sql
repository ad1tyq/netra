CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    tier VARCHAR(20) NOT NULL, -- CHC, DISTRICT_HOSPITAL
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    has_specialist BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL, -- TECHNICIAN, ADMIN, SPECIALIST
    clinic_id UUID REFERENCES clinics(id),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id),
    demographics JSONB,
    rbs_level FLOAT,
    is_diabetic BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    client_uuid UUID UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE screenings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    eye VARCHAR(3), -- OD, OS
    ai_grade INT,
    referable_probability FLOAT,
    is_referable BOOLEAN NOT NULL,
    decision_threshold FLOAT DEFAULT 0.40,
    quality_status VARCHAR(20),
    status VARCHAR(20),
    performed_by UUID REFERENCES users(id),
    client_uuid UUID UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lesions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    screening_id UUID NOT NULL REFERENCES screenings(id) ON DELETE CASCADE,
    lesion_type VARCHAR(50) NOT NULL, -- HEMORRHAGE, EXUDATE, MICROANEURYSM
    box_ymin FLOAT NOT NULL,
    box_xmin FLOAT NOT NULL,
    box_ymax FLOAT NOT NULL,
    box_xmax FLOAT NOT NULL,
    confidence FLOAT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    screening_id UUID NOT NULL REFERENCES screenings(id),
    source_clinic_id UUID REFERENCES clinics(id),
    target_clinic_id UUID REFERENCES clinics(id),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, EXPIRED
    qr_token TEXT UNIQUE NOT NULL,
    referred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    channel VARCHAR(20) NOT NULL, -- WHATSAPP, SMS
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'QUEUED', -- QUEUED, SENT, FAILED, READ
    provider_message_id VARCHAR(100),
    dispatched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contributed_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES clinics(id),
    verified_by UUID REFERENCES users(id),
    image_path TEXT NOT NULL,
    ground_truth_grade INT NOT NULL,
    consent_obtained BOOLEAN NOT NULL DEFAULT true,
    review_status VARCHAR(20) NOT NULL DEFAULT 'PENDING_REVIEW', -- PENDING_REVIEW, APPROVED, REJECTED
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE mesh_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway_user_id UUID REFERENCES users(id),
    client_uuid UUID UNIQUE NOT NULL,
    payload_size_bytes INT,
    sync_status VARCHAR(20) NOT NULL,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
