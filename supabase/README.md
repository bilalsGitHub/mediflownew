# Supabase Kurulum Rehberi

Bu klasör, MediFlow uygulaması için Supabase database, authentication ve storage yapılandırmasını içerir.

## 📁 Dosyalar

- **`schema.sql`** - Tüm database tabloları, RLS policies, triggers ve functions
- **`storage-setup.sql`** - Storage bucket yapılandırması (referans)
- **`auth-setup.md`** - Authentication yapılandırma rehberi
- **`migration-guide.md`** - LocalStorage'dan Supabase'e geçiş rehberi

## 🚀 Hızlı Başlangıç

### 1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. Project URL ve API keys'leri not edin

### 2. Environment Variables

Proje root'unda `.env.local` dosyası oluşturun:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI (mevcut)
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Database Schema Kurulumu

1. Supabase Dashboard > SQL Editor'e gidin
2. `schema.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'de çalıştırın
4. Başarılı olduğunu doğrulayın

### 4. Storage Bucket Kurulumu

1. Supabase Dashboard > Storage'a gidin
2. "New Bucket" butonuna tıklayın
3. Ayarlar:
   - **Name**: `recordings`
   - **Public**: `false` (private)
   - **File size limit**: `100MB`
   - **Allowed MIME types**: `audio/*`, `video/webm`, `audio/webm`
4. Storage policies ekleyin (detaylar için `storage-setup.sql` dosyasına bakın)

### 5. Test Kullanıcı Oluşturma

Supabase Dashboard > Authentication > Users > Add User:

- Email: `doctor@test.com`
- Password: `test123`
- Auto Confirm User: ✅

## 📊 Database Yapısı

### Tablolar

1. **`profiles`** - Kullanıcı profilleri (auth.users ile entegre)
2. **`consultations`** - Doktor-hasta görüşmeleri
3. **`icd10_codes`** - ICD-10 tanı kodları
4. **`documents`** - AI-generated dokümanlar
5. **`appointments`** - Randevu takvimi

### Güvenlik

- Tüm tablolarda **Row Level Security (RLS)** aktif
- Kullanıcılar sadece kendi verilerine erişebilir
- Storage bucket'ları private ve RLS ile korumalı

## 🔐 Authentication

Supabase Auth kullanılıyor:

- Email/Password authentication
- Otomatik profile oluşturma (trigger ile)
- Session management

Detaylar için `auth-setup.md` dosyasına bakın.

## 📦 Storage

⚠️ **NOT:** Bu uygulamada ses kayıtları saklanmıyor! Sadece transkript (metin) veritabanında saklanıyor.

Storage bucket kurulumu gerekmez. Eğer gelecekte ses kayıtlarını saklamak isterseniz, `storage-setup.sql` dosyasına bakabilirsiniz.

## 🔄 Migration

Mevcut localStorage tabanlı sistemi Supabase'e geçirmek için:

- `migration-guide.md` dosyasına bakın

## 📚 Detaylı Dokümantasyon

- **Database Schema**: `schema.sql` içindeki yorumlar
- **Auth Setup**: `auth-setup.md`
- **Storage Setup**: `storage-setup.sql`
- **Migration**: `migration-guide.md`

## ⚠️ Önemli Notlar

1. **Service Role Key**: Asla client-side'da kullanmayın
2. **RLS Policies**: Tüm tablolarda aktif, production'da kapatmayın
3. **Email Verification**: Production'da açık olmalı
4. **Backup**: Düzenli database backup'ları alın

## 🐛 Troubleshooting

### "Missing Supabase environment variables" hatası

- `.env.local` dosyasını kontrol edin
- Next.js dev server'ı yeniden başlatın

### "Row Level Security policy violation" hatası

- RLS policies'lerin doğru yapılandırıldığından emin olun
- Kullanıcının authenticated olduğundan emin olun

### Profile oluşturulmuyor

- `handle_new_user()` fonksiyonunun çalıştığından emin olun
- Trigger'ın aktif olduğundan emin olun

## 📞 Destek

Sorun yaşarsanız:

1. Supabase Dashboard > Logs'u kontrol edin
2. Browser console'da hataları kontrol edin
3. Supabase dokümantasyonuna bakın: https://supabase.com/docs
