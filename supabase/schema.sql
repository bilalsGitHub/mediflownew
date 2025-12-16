-- ============================================
-- SUPABASE DATABASE SCHEMA
-- MediFlow Voice App - Complete Database Setup
-- ============================================
-- 
-- Bu dosya Supabase Dashboard > SQL Editor'de çalıştırılmalıdır
-- Adım adım çalıştırılabilir (her bölüm ayrı ayrı)
--
-- ÖNEMLİ: Önce Supabase projenizi oluşturun ve environment variables'ları ayarlayın
-- ============================================

-- ============================================
-- 1. EXTENSIONS
-- ============================================
-- UUID extension (gen_random_uuid için)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. PROFILES TABLE
-- ============================================
-- Kullanıcı profilleri (Supabase Auth ile entegre)
-- auth.users tablosu otomatik oluşturulur, burada ek bilgiler saklanır

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

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================
-- 3. CONSULTATIONS TABLE
-- ============================================
-- Ana konsültasyon tablosu - tüm görüşme verilerini içerir

CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Hasta bilgileri
  patient_name TEXT,
  
  -- NOT: Ses kayıtları saklanmıyor, sadece transkript saklanıyor
  -- recording_url TEXT, -- Kullanılmıyor - ses kayıtları saklanmıyor
  
  -- Transkript ve konuşma
  transcript TEXT, -- Ham transkript (Whisper çıktısı)
  conversation JSONB, -- [{ speaker: 'Doktor' | 'Hasta', text: string }]
  
  -- AI Analiz sonuçları
  analysis JSONB, -- {
  --   patient_complaint: string,
  --   symptoms: string[],
  --   duration_frequency: string,
  --   preliminary_summary: string,
  --   doctor_notes_draft: string
  -- }
  
  -- Doktor notları
  doctor_notes TEXT, -- Düzenlenmiş final notlar
  
  -- Anamnese (Almanca tıbbi form)
  anamnese JSONB, -- {
  --   kontaktgrund?: string,
  --   aktueller_zustand?: string
  -- }
  
  -- SOAP Note (Subjektif, Objektif, Beurteilung & Plan)
  soap_note JSONB, -- {
  --   subjektiv?: string,
  --   objektiv?: string,
  --   beurteilung_plan?: string,
  --   anamnese?: string, (kurzdokumentation template için)
  --   untersuchung?: string (kurzdokumentation template için)
  -- }
  
  -- Template tipi
  template TEXT DEFAULT 'dokumentation' CHECK (template IN ('dokumentation', 'kurzdokumentation', 'standard')),
  
  -- Durum
  status TEXT DEFAULT 'not_transferred' CHECK (
    status IN (
      'draft',
      'approved',
      'rejected',
      'not_transferred',
      'transferred',
      'completed'
    )
  ),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultations indexes
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON public.consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON public.consultations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_template ON public.consultations(template);

-- ============================================
-- 4. ICD10_CODES TABLE
-- ============================================
-- ICD-10 kodları (her konsültasyona birden fazla kod eklenebilir)

CREATE TABLE IF NOT EXISTS public.icd10_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ICD10 codes indexes
CREATE INDEX IF NOT EXISTS idx_icd10_consultation_id ON public.icd10_codes(consultation_id);
CREATE INDEX IF NOT EXISTS idx_icd10_code ON public.icd10_codes(code);

-- ============================================
-- 5. DOCUMENTS TABLE
-- ============================================
-- AI-generated documents (Patient Message, Referral Reason, Referral Response)

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
  
  -- Document type
  type TEXT NOT NULL CHECK (type IN ('patientMessage', 'referralReason', 'referralResponse')),
  
  -- Document content (JSONB - type'a göre farklı yapılar)
  content JSONB NOT NULL,
  
  -- Metadata
  title TEXT, -- Opsiyonel başlık
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_consultation_id ON public.documents(consultation_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- ============================================
-- 6. APPOINTMENTS TABLE
-- ============================================
-- Randevu takvimi

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Randevu bilgileri
  name TEXT NOT NULL, -- Termin ismi
  patient_name TEXT NOT NULL, -- Hasta ismi
  patient_number TEXT, -- Hasta numarası
  problem TEXT, -- İsteğe bağlı problem açıklaması
  
  -- Zaman bilgileri
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 25, -- Dakika cinsinden (default 25)
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
-- DATE() fonksiyonu immutable değil, bu yüzden index'te kullanılamaz
-- Bunun yerine start_time üzerinde index var, tarih sorguları için yeterli
-- CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(DATE(start_time));

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi profillerini görebilir
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Kullanıcılar kendi profillerini oluşturabilir (signup sırasında)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Kullanıcılar kendi profillerini güncelleyebilir
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Consultations RLS
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Doktorlar sadece kendi görüşmelerini görebilir
DROP POLICY IF EXISTS "Doctors can view own consultations" ON public.consultations;
CREATE POLICY "Doctors can view own consultations"
  ON public.consultations FOR SELECT
  USING (auth.uid() = doctor_id);

-- Doktorlar sadece kendi görüşmelerini oluşturabilir
DROP POLICY IF EXISTS "Doctors can create own consultations" ON public.consultations;
CREATE POLICY "Doctors can create own consultations"
  ON public.consultations FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

-- Doktorlar sadece kendi görüşmelerini güncelleyebilir
DROP POLICY IF EXISTS "Doctors can update own consultations" ON public.consultations;
CREATE POLICY "Doctors can update own consultations"
  ON public.consultations FOR UPDATE
  USING (auth.uid() = doctor_id);

-- Doktorlar sadece kendi görüşmelerini silebilir
DROP POLICY IF EXISTS "Doctors can delete own consultations" ON public.consultations;
CREATE POLICY "Doctors can delete own consultations"
  ON public.consultations FOR DELETE
  USING (auth.uid() = doctor_id);

-- ICD10 Codes RLS
ALTER TABLE public.icd10_codes ENABLE ROW LEVEL SECURITY;

-- Doktorlar sadece kendi konsültasyonlarının kodlarını görebilir
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

-- Doktorlar sadece kendi konsültasyonlarına kod ekleyebilir
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

-- Doktorlar sadece kendi konsültasyonlarının kodlarını güncelleyebilir
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

-- Doktorlar sadece kendi konsültasyonlarının kodlarını silebilir
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

-- Documents RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Doktorlar sadece kendi konsültasyonlarının dokümanlarını görebilir
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

-- Doktorlar sadece kendi konsültasyonlarına doküman ekleyebilir
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

-- Doktorlar sadece kendi konsültasyonlarının dokümanlarını güncelleyebilir
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

-- Doktorlar sadece kendi konsültasyonlarının dokümanlarını silebilir
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

-- Appointments RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Doktorlar sadece kendi randevularını görebilir
DROP POLICY IF EXISTS "Doctors can view own appointments" ON public.appointments;
CREATE POLICY "Doctors can view own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = doctor_id);

-- Doktorlar sadece kendi randevularını oluşturabilir
DROP POLICY IF EXISTS "Doctors can create own appointments" ON public.appointments;
CREATE POLICY "Doctors can create own appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

-- Doktorlar sadece kendi randevularını güncelleyebilir
DROP POLICY IF EXISTS "Doctors can update own appointments" ON public.appointments;
CREATE POLICY "Doctors can update own appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = doctor_id);

-- Doktorlar sadece kendi randevularını silebilir
DROP POLICY IF EXISTS "Doctors can delete own appointments" ON public.appointments;
CREATE POLICY "Doctors can delete own appointments"
  ON public.appointments FOR DELETE
  USING (auth.uid() = doctor_id);

-- ============================================
-- 8. FUNCTIONS
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. TRIGGERS
-- ============================================

-- Updated_at triggers
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
-- 10. COMMENTS (Documentation)
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
-- Sonraki adımlar:
-- 1. Storage bucket oluştur (supabase/storage-setup.sql dosyasına bakın)
-- 2. Environment variables ayarla (.env.local)
-- 3. AuthContext'i Supabase'e bağla
-- 4. Storage helper'ları Supabase'e bağla
-- 
-- ============================================

