-- Insert Seed Clinics
INSERT INTO clinics (id, name, tier, latitude, longitude, has_specialist) VALUES
('a0000000-0000-0000-0000-000000000001', 'Dahmi Kalan Community Health Centre', 'CHC', 26.8500, 75.5600, false),
('a0000000-0000-0000-0000-000000000002', 'Jaipur District Tertiary Hospital', 'DISTRICT_HOSPITAL', 26.9124, 75.7873, true);

-- Insert Seed Users (Technician and Specialist)
INSERT INTO users (id, full_name, role, clinic_id, email, password_hash) VALUES
('b0000000-0000-0000-0000-000000000001', 'Priya Sharma', 'TECHNICIAN', 'a0000000-0000-0000-0000-000000000001', 'priya.tech@netra.ai', '$2a$10$7qiK3s3f.7R7K3s3f.7R7K3s3f.7R7K3s3f.7R7K3s3f.7R7K3s3'),
('b0000000-0000-0000-0000-000000000002', 'Dr. Rameshwar Sharma', 'SPECIALIST', 'a0000000-0000-0000-0000-000000000002', 'dr.sharma@netra.ai', '$2a$10$7qiK3s3f.7R7K3s3f.7R7K3s3f.7R7K3s3f.7R7K3s3f.7R7K3s3');

-- Insert Seed Patient (Ramesh)
INSERT INTO patients (id, clinic_id, demographics, rbs_level, is_diabetic, created_by, client_uuid) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '{"name": "Ramesh Kumar", "age": 52, "gender": "Male", "phone": "+919876543210"}'::jsonb, 240.0, true, 'b0000000-0000-0000-0000-000000000001', 'c1111111-1111-1111-1111-111111111111');

-- Insert Seed Screening (Severe NPDR triggering threshold 0.40)
INSERT INTO screenings (id, patient_id, eye, ai_grade, referable_probability, is_referable, decision_threshold, quality_status, status, performed_by, client_uuid) VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'OD', 3, 0.89, true, 0.40, 'GRADABLE', 'GRADED', 'b0000000-0000-0000-0000-000000000001', 'd1111111-1111-1111-1111-111111111111');

-- Insert Lesions (Bounding Boxes for Visual Explainability)
INSERT INTO lesions (id, screening_id, lesion_type, box_ymin, box_xmin, box_ymax, box_xmax, confidence) VALUES
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'HEMORRHAGE', 0.42, 0.31, 0.50, 0.37, 0.91),
('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'EXUDATE', 0.61, 0.55, 0.68, 0.62, 0.85);

-- Insert Referral (Closed-Loop Diagnostic Passport)
INSERT INTO referrals (id, patient_id, screening_id, source_clinic_id, target_clinic_id, status, qr_token) VALUES
('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'PENDING', 'NETRA-PASSPORT-RAMESH-52-OD-GRADE3');

-- Insert Notification Queue Log
INSERT INTO notifications (id, patient_id, channel, payload, status) VALUES
('f1111111-1111-1111-1111-111111111111', 'c0000000-0000-0000-0000-000000000001', 'WHATSAPP', '{"template": "netra_urgent_referral", "language": "hi", "params": ["Ramesh Kumar", "Jaipur District Tertiary Hospital"]}'::jsonb, 'QUEUED');
