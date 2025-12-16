-- ============================================
-- COMPLETE SUPABASE SCHEMA
-- MediFlow Voice App - Tüm Eksikler Dahil
-- ============================================
-- 
-- Bu dosya Supabase Dashboard > SQL Editor'de çalıştırılmalıdır
-- ÖNEMLİ: Mevcut schema'nıza eksik olan RLS, Indexes, Triggers ve Functions ekler
-- ============================================

-- ============================================
-- 1. EXTENSIONS
-- ===========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. TABLES (Eğer yoksa oluştur)
-- ============================================

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'doctor' CHECK (role IN ('doctor', 'patient')),
  country TEXT,
  age INTEGER,
  language TEXT DEFAULT 'de',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultations table
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT,
  transcript TEXT,
  conversation JSONB,
  analysis JSONB,
  doctor_notes TEXT,
  anamnese JSONB,
  soap_note JSONB,
  template TEXT DEFAULT 'dokumentation' CHECK (template IN ('dokumentation', 'kurzdokumentation', 'standard')),
  status TEXT DEFAULT 'not_transferred' CHECK (
    status IN ('draft', 'approved', 'rejected', 'not_transferred', 'transferred', 'completed')
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ICD10 codes table
CREATE TABLE IF NOT EXISTS public.icd10_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('patientMessage', 'referralReason', 'referralResponse')),
  content JSONB NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  patient_number TEXT,
  problem TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. INDEXES (Performans için)
-- ============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Consultations indexes
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON public.consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON public.consultations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_template ON public.consultations(template);

-- ICD10 codes indexes
CREATE INDEX IF NOT EXISTS idx_icd10_consultation_id ON public.icd10_codes(consultation_id);
CREATE INDEX IF NOT EXISTS idx_icd10_code ON public.icd10_codes(code);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_consultation_id ON public.documents(consultation_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icd10_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Consultations RLS Policies
DROP POLICY IF EXISTS "Doctors can view own consultations" ON public.consultations;
CREATE POLICY "Doctors can view own consultations"
  ON public.consultations FOR SELECT
  USING (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Doctors can create own consultations" ON public.consultations;
CREATE POLICY "Doctors can create own consultations"
  ON public.consultations FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Doctors can update own consultations" ON public.consultations;
CREATE POLICY "Doctors can update own consultations"
  ON public.consultations FOR UPDATE
  USING (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Doctors can delete own consultations" ON public.consultations;
CREATE POLICY "Doctors can delete own consultations"
  ON public.consultations FOR DELETE
  USING (auth.uid() = doctor_id);

-- ICD10 Codes RLS Policies
DROP POLICY IF EXISTS "Doctors can view own consultation codes" ON public.icd10_codes;
CREATE POLICY "Doctors can view own consultation codes"
  ON public.icd10_codes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.consultations
      WHERE consultations.id = icd10_codes.consultation_id
      AND consultations.doctor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Doctors can create own consultation codes" ON public.icd10_codes;
CREATE POLICY "Doctors can create own consultation codes"
  ON public.icd10_codes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.consultations
      WHERE consultations.id = icd10_codes.consultation_id
      AND consultations.doctor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Doctors can update own consultation codes" ON public.icd10_codes;
CREATE POLICY "Doctors can update own consultation codes"
  ON public.icd10_codes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.consultations
      WHERE consultations.id = icd10_codes.consultation_id
      AND consultations.doctor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Doctors can delete own consultation codes" ON public.icd10_codes;
CREATE POLICY "Doctors can delete own consultation codes"
  ON public.icd10_codes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.consultations
      WHERE consultations.id = icd10_codes.consultation_id
      AND consultations.doctor_id = auth.uid()
    )
  );

-- Documents RLS Policies
DROP POLICY IF EXISTS "Doctors can view own consultation documents" ON public.documents;
CREATE POLICY "Doctors can view own consultation documents"
  ON public.documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.consultations
      WHERE consultations.id = documents.consultation_id
      AND consultations.doctor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Doctors can create own consultation documents" ON public.documents;
CREATE POLICY "Doctors can create own consultation documents"
  ON public.documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.consultations
      WHERE consultations.id = documents.consultation_id
      AND consultations.doctor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Doctors can update own consultation documents" ON public.documents;
CREATE POLICY "Doctors can update own consultation documents"
  ON public.documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.consultations
      WHERE consultations.id = documents.consultation_id
      AND consultations.doctor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Doctors can delete own consultation documents" ON public.documents;
CREATE POLICY "Doctors can delete own consultation documents"
  ON public.documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.consultations
      WHERE consultations.id = documents.consultation_id
      AND consultations.doctor_id = auth.uid()
    )
  );

-- Appointments RLS Policies
DROP POLICY IF EXISTS "Doctors can view own appointments" ON public.appointments;
CREATE POLICY "Doctors can view own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Doctors can create own appointments" ON public.appointments;
CREATE POLICY "Doctors can create own appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Doctors can update own appointments" ON public.appointments;
CREATE POLICY "Doctors can update own appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Doctors can delete own appointments" ON public.appointments;
CREATE POLICY "Doctors can delete own appointments"
  ON public.appointments FOR DELETE
  USING (auth.uid() = doctor_id);

-- ============================================
-- 5. FUNCTIONS
-- ============================================

-- Updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profile oluşturma fonksiyonu (signup trigger için)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'doctor')
  )
  ON CONFLICT (id) DO NOTHING; -- Eğer profile zaten varsa hata verme
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. TRIGGERS
-- ============================================

-- Updated_at triggers (her tablo için)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consultations_updated_at ON public.consultations;
CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 7. COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE public.profiles IS 'Kullanıcı profilleri - Supabase Auth ile entegre';
COMMENT ON TABLE public.consultations IS 'Doktor-hasta görüşmeleri - tüm transkript, analiz ve notlar';
COMMENT ON TABLE public.icd10_codes IS 'ICD-10 tanı kodları - her konsültasyona birden fazla kod';
COMMENT ON TABLE public.documents IS 'AI-generated dokümanlar (Patient Message, Referral Reason, Referral Response)';
COMMENT ON TABLE public.appointments IS 'Randevu takvimi';

-- ============================================
-- SCHEMA TAMAMLANDI
-- ============================================
-- 
-- Bu schema şunları içerir:
-- ✅ Tüm tablolar (profiles, consultations, icd10_codes, documents, appointments)
-- ✅ Tüm indexler (performans için)
-- ✅ Tüm RLS policies (güvenlik için - SELECT, INSERT, UPDATE, DELETE)
-- ✅ Tüm functions (update_updated_at_column, handle_new_user)
-- ✅ Tüm triggers (updated_at otomatik güncelleme, auto-create profile)
-- 
-- ============================================

