-- ============================================
-- FIX DOCUMENTS TABLE - Doküman Kaydetme Sorunu
-- ============================================
-- 
-- Bu dosya doküman kaydetme sorunlarını düzeltir
-- Supabase Dashboard > SQL Editor'de çalıştırın
-- ============================================

-- 1. Documents tablosunun varlığını kontrol et ve oluştur
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('patientMessage', 'referralReason', 'referralResponse')),
  content JSONB NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indexes (performans için)
CREATE INDEX IF NOT EXISTS idx_documents_consultation_id ON public.documents(consultation_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- 3. RLS Policies (güvenlik için)
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

-- 4. Trigger for updated_at (otomatik güncelleme)
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

-- ============================================
-- FIX TAMAMLANDI
-- ============================================
-- 
-- Bu script şunları yapar:
-- ✅ Documents tablosunu oluşturur (yoksa)
-- ✅ Gerekli indexleri ekler
-- ✅ RLS policies'leri ekler (SELECT, INSERT, UPDATE, DELETE)
-- ✅ updated_at trigger'ını ekler
-- 
-- Artık dokümanlar kaydedilebilir!
-- ============================================

