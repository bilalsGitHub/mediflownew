-- ============================================
-- DOCUMENTS TABLE - Doküman Yönetimi
-- ============================================
-- 
-- Bu dosya doküman kaydetme ve güncelleme için gerekli tüm SQL kodlarını içerir
-- Supabase Dashboard > SQL Editor'de çalıştırın
-- ============================================

-- 1. Documents Tablosu Oluşturma
-- ============================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('patientMessage', 'referralReason', 'referralResponse')),
  content JSONB NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indexes (Performans Optimizasyonu)
-- ============================================
-- Consultation ID'ye göre hızlı arama
CREATE INDEX IF NOT EXISTS idx_documents_consultation_id ON public.documents(consultation_id);

-- Type'a göre filtreleme (patientMessage, referralReason, referralResponse)
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(type);

-- Tarihe göre sıralama (en yeni önce)
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- Updated_at'e göre sıralama (son güncellenen önce)
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON public.documents(updated_at DESC);

-- Composite index (consultation + type) - çok sık kullanılan sorgu
CREATE INDEX IF NOT EXISTS idx_documents_consultation_type ON public.documents(consultation_id, type);

-- 3. Row Level Security (RLS) Policies
-- ============================================
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- SELECT: Doktorlar sadece kendi konsültasyonlarının dokümanlarını görebilir
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

-- INSERT: Doktorlar sadece kendi konsültasyonlarına doküman ekleyebilir
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

-- UPDATE: Doktorlar sadece kendi konsültasyonlarının dokümanlarını güncelleyebilir
-- Bu policy, AI önerisini kabul ettiğinde dokümanı güncellemek için kullanılır
DROP POLICY IF EXISTS "Doctors can update own consultation documents" ON public.documents;
CREATE POLICY "Doctors can update own consultation documents"
  ON public.documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.consultations
      WHERE consultations.id = documents.consultation_id
      AND consultations.doctor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.consultations
      WHERE consultations.id = documents.consultation_id
      AND consultations.doctor_id = auth.uid()
    )
  );

-- DELETE: Doktorlar sadece kendi konsültasyonlarının dokümanlarını silebilir
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

-- 4. Trigger for updated_at (Otomatik Güncelleme)
-- ============================================
-- Bu trigger, doküman güncellendiğinde updated_at field'ını otomatik olarak günceller
-- AI önerisini kabul ettiğinde (UPDATE yapıldığında) updated_at otomatik güncellenir

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Veri Yapısı Açıklaması
-- ============================================
-- 
-- documents tablosu şu şekilde çalışır:
-- 
-- 1. YENİ DOKÜMAN OLUŞTURMA:
--    - Kullanıcı "Neu erstellen" butonuna basar
--    - AI ile doküman oluşturur
--    - "Speichern" butonuna basar
--    - INSERT işlemi yapılır (yeni UUID oluşturulur)
-- 
-- 2. MEVCUT DOKÜMAN GÜNCELLEME (AI Önerisi):
--    - Kullanıcı mevcut bir dokümanı seçer
--    - "AI generieren" butonuna basar
--    - AI yeni bir öneri oluşturur (frontend state'inde tutulur)
--    - Kullanıcı "Übernehmen" butonuna basar
--    - UPDATE işlemi yapılır (mevcut dokümanın content'i güncellenir)
--    - updated_at otomatik olarak güncellenir (trigger sayesinde)
-- 
-- 3. DOKÜMAN SİLME:
--    - Kullanıcı doküman listesindeki çöp kutusu ikonuna basar
--    - DELETE işlemi yapılır
-- 
-- ============================================

-- 6. Test Sorguları (Opsiyonel)
-- ============================================
-- 
-- Tüm dokümanları görüntüle:
-- SELECT * FROM public.documents ORDER BY updated_at DESC;
-- 
-- Belirli bir konsültasyonun dokümanlarını görüntüle:
-- SELECT * FROM public.documents 
-- WHERE consultation_id = 'your-consultation-id' 
-- ORDER BY updated_at DESC;
-- 
-- Belirli bir tipteki dokümanları görüntüle:
-- SELECT * FROM public.documents 
-- WHERE type = 'patientMessage' 
-- ORDER BY updated_at DESC;
-- 
-- ============================================

-- ✅ TAMAMLANDI
-- ============================================
-- 
-- Bu script şunları yapar:
-- ✅ Documents tablosunu oluşturur (yoksa)
-- ✅ Performans için gerekli indexleri ekler
-- ✅ Güvenlik için RLS policies'leri ekler (SELECT, INSERT, UPDATE, DELETE)
-- ✅ updated_at otomatik güncelleme trigger'ını ekler
-- 
-- Artık:
-- ✅ Yeni dokümanlar kaydedilebilir
-- ✅ Mevcut dokümanlar güncellenebilir (AI önerisi kabul edildiğinde)
-- ✅ Dokümanlar silinebilir
-- ✅ updated_at otomatik olarak güncellenir
-- 
-- ============================================

