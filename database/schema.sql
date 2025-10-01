-- Healthcare Management Database Schema for Netlify DB (Neon PostgreSQL)

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    national_id VARCHAR(20) PRIMARY KEY,
    name_ar VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),
    age INTEGER,
    sex VARCHAR(10),
    admission_date DATE,
    area_id VARCHAR(50),
    phone VARCHAR(20),
    address TEXT,
    medical_diagnosis TEXT,
    braden_score INTEGER,
    status VARCHAR(20) DEFAULT 'active',
    tags TEXT[], -- Array of tags
    contact_attempts JSONB DEFAULT '[]'::jsonb,
    assessments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    name_ar VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),
    profession_ar VARCHAR(100), -- المهنة
    profession_en VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    area_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members junction table
CREATE TABLE IF NOT EXISTS team_members (
    team_id VARCHAR(50) REFERENCES teams(id) ON DELETE CASCADE,
    staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, staff_id)
);

-- Visits table
CREATE TABLE IF NOT EXISTS visits (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(20) REFERENCES patients(national_id) ON DELETE CASCADE,
    team_id VARCHAR(50) REFERENCES teams(id),
    visit_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'Scheduled', -- Scheduled, DoctorCompleted, NurseCompleted, Completed
    doctor_note JSONB,
    nurse_note JSONB,
    pt_note JSONB,
    sw_note JSONB,
    doctor_sign VARCHAR(200),
    nurse_sign VARCHAR(200),
    pt_sign VARCHAR(200),
    sw_sign VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id, visit_date)
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id VARCHAR(100) PRIMARY KEY,
    patient_id VARCHAR(20) REFERENCES patients(national_id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL, -- Doctor, Nurse, PhysicalTherapist, SocialWorker
    assessment_data JSONB NOT NULL,
    created_by VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom patient lists
CREATE TABLE IF NOT EXISTS custom_lists (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    patient_ids TEXT[], -- Array of patient national IDs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity log for auditing
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    user_email VARCHAR(100),
    user_name VARCHAR(200),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date DATE DEFAULT CURRENT_DATE
);

-- Areas/Regions table
CREATE TABLE IF NOT EXISTS areas (
    id VARCHAR(50) PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    description TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_area_id ON patients(area_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_tags ON patients USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_visits_patient_date ON visits(patient_id, visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX IF NOT EXISTS idx_assessments_patient ON assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_assessments_role ON assessments(role);
CREATE INDEX IF NOT EXISTS idx_activity_log_date ON activity_log(date);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_email);

-- Insert default areas (based on your existing data)
INSERT INTO areas (id, name_ar, name_en) VALUES 
('area1', 'المنطقة الأولى', 'Area 1'),
('area2', 'المنطقة الثانية', 'Area 2'),
('area3', 'المنطقة الثالثة', 'Area 3'),
('area4', 'المنطقة الرابعة', 'Area 4'),
('area5', 'المنطقة الخامسة', 'Area 5')
ON CONFLICT (id) DO NOTHING;