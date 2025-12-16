-- ============================================
-- SUPABASE STORAGE SETUP
-- MediFlow Voice App - Storage Buckets Configuration
-- ============================================
-- 
-- ⚠️ NOT: Bu uygulamada ses kayıtları saklanmıyor!
-- Sadece transkript (metin) veritabanında saklanıyor.
-- 
-- Bu dosya sadece referans amaçlıdır.
-- Eğer gelecekte ses kayıtlarını saklamak isterseniz bu dosyayı kullanabilirsiniz.
-- ============================================

-- ============================================
-- 1. RECORDINGS BUCKET (OPSİYONEL - KULLANILMIYOR)
-- ============================================
-- Ses kayıtları için bucket (şu an kullanılmıyor)

-- Bucket oluştur (Supabase Dashboard > Storage > New Bucket)
-- Bucket Name: recordings
-- Public: false (private)
-- File size limit: 100MB (ayarlanabilir)
-- Allowed MIME types: audio/*, video/webm, audio/webm

-- Storage Policies (RLS)

-- Doktorlar sadece kendi kayıtlarını yükleyebilir
-- Not: Storage policies Supabase Dashboard'dan yapılandırılmalıdır
-- Aşağıdaki SQL komutları referans içindir

-- INSERT Policy: Doktorlar kayıt yükleyebilir
-- Policy Name: "Doctors can upload recordings"
-- Policy Definition:
--   (bucket_id = 'recordings'::text) AND (auth.uid()::text = (storage.foldername(name))[1])

-- SELECT Policy: Doktorlar kendi kayıtlarını okuyabilir
-- Policy Name: "Doctors can view own recordings"
-- Policy Definition:
--   (bucket_id = 'recordings'::text) AND (auth.uid()::text = (storage.foldername(name))[1])

-- UPDATE Policy: Doktorlar kendi kayıtlarını güncelleyebilir
-- Policy Name: "Doctors can update own recordings"
-- Policy Definition:
--   (bucket_id = 'recordings'::text) AND (auth.uid()::text = (storage.foldername(name))[1])

-- DELETE Policy: Doktorlar kendi kayıtlarını silebilir
-- Policy Name: "Doctors can delete own recordings"
-- Policy Definition:
--   (bucket_id = 'recordings'::text) AND (auth.uid()::text = (storage.foldername(name))[1])

-- ============================================
-- STORAGE YAPILANDIRMA NOTLARI
-- ============================================
-- 
-- 1. Supabase Dashboard > Storage > New Bucket
--    - Name: recordings
--    - Public: false
--    - File size limit: 100MB
--    - Allowed MIME types: audio/*, video/webm, audio/webm
--
-- 2. Storage > Policies > recordings bucket
--    - Yukarıdaki policy'leri ekleyin
--    - Her policy için "For authenticated users" seçeneğini kullanın
--
-- 3. Dosya yapısı önerisi:
--    recordings/{user_id}/{consultation_id}/recording.webm
--
-- ============================================

