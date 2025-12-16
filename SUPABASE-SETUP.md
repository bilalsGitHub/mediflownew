# 🚀 Supabase Kurulum Rehberi - MediFlow

Bu rehber, MediFlow uygulamasını Supabase'e bağlamak için gerekli tüm adımları içerir.

## 📋 İçindekiler

1. [Hızlı Başlangıç](#hızlı-başlangıç)
2. [Dosya Yapısı](#dosya-yapısı)
3. [Adım Adım Kurulum](#adım-adım-kurulum)
4. [Kod Güncellemeleri](#kod-güncellemeleri)
5. [Test](#test)

## 🎯 Hızlı Başlangıç

### 1. Supabase Projesi Oluştur

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. Project URL ve API keys'leri not edin

### 2. Environment Variables

`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Database Schema

Supabase Dashboard > SQL Editor'de `supabase/schema.sql` dosyasını çalıştırın.

### 4. Storage Bucket

Supabase Dashboard > Storage'dan `recordings` bucket'ı oluşturun (detaylar: `supabase/storage-setup.sql`).

## 📁 Dosya Yapısı

```
supabase/
├── schema.sql              # Tüm database tabloları, RLS, triggers
├── storage-setup.sql       # Storage bucket yapılandırması
├── auth-setup.md           # Authentication yapılandırma rehberi
├── migration-guide.md      # LocalStorage'dan Supabase'e geçiş
└── README.md               # Genel dokümantasyon
```

## 📝 Adım Adım Kurulum

### Adım 1: Supabase Projesi

1. [Supabase Dashboard](https://app.supabase.com) > New Project
2. Proje bilgilerini girin
3. Database password belirleyin (güvenli tutun!)
4. Region seçin (en yakın bölgeyi seçin)
5. Proje oluşturulmasını bekleyin (2-3 dakika)

### Adım 2: API Keys

1. Supabase Dashboard > Settings > API
2. Şunları kopyalayın:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (client-side için)
   - **service_role key**: `eyJhbGc...` (sadece server-side, güvenli tutun!)

### Adım 3: Environment Variables

Proje root'unda `.env.local` dosyası oluşturun:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# OpenAI (mevcut)
OPENAI_API_KEY=sk-...
```

### Adım 4: Database Schema

1. Supabase Dashboard > SQL Editor
2. `supabase/schema.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'e yapıştırın
4. "Run" butonuna tıklayın
5. Başarılı olduğunu doğrulayın (hata olmamalı)

**Oluşturulan Tablolar:**

- ✅ `profiles` - Kullanıcı profilleri
- ✅ `consultations` - Görüşmeler
- ✅ `icd10_codes` - ICD-10 kodları
- ✅ `documents` - AI-generated dokümanlar
- ✅ `appointments` - Randevular

### Adım 5: Storage Bucket (OPSİYONEL - GEREKMEZ)

⚠️ **ÖNEMLİ:** Bu uygulamada ses kayıtları saklanmıyor! Sadece transkript (metin) veritabanında saklanıyor.

Storage bucket kurulumu **gerekmez**. Ses kayıtları sadece transkript için kullanılıyor ve kaydedilmiyor.

Eğer gelecekte ses kayıtlarını saklamak isterseniz, `supabase/storage-setup.sql` dosyasına bakabilirsiniz.

### Adım 6: Test Kullanıcı

1. Supabase Dashboard > Authentication > Users
2. "Add User" butonuna tıklayın
3. Ayarlar:
   - **Email**: `doctor@test.com`
   - **Password**: `test123`
   - **Auto Confirm User**: ✅
4. "Create User" butonuna tıklayın

## 💻 Kod Güncellemeleri

### 1. AuthContext Güncelleme

`lib/AuthContext.tsx` dosyasını Supabase Auth kullanacak şekilde güncelleyin:

```typescript
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

// Supabase Auth kullanarak:
// - signUp() - Kayıt
// - signInWithPassword() - Giriş
// - signOut() - Çıkış
// - getUser() - Mevcut kullanıcı
// - onAuthStateChange() - Auth state değişiklikleri
```

### 2. Storage Helper Güncelleme

`lib/storage.ts` dosyasını Supabase database kullanacak şekilde güncelleyin:

```typescript
import { supabase } from "@/lib/supabase/client";

// Consultations için:
// - getAll() - Tüm görüşmeleri getir
// - get(id) - Tek görüşme getir
// - save(consultation) - Görüşme kaydet/güncelle
// - delete(id) - Görüşme sil
```

### 3. API Routes Güncelleme

API route'larında server-side Supabase client kullanın:

```typescript
import { createClient } from "@/lib/supabase/server";

// Server-side operations
const supabase = await createClient();
```

## ✅ Test

### 1. Auth Test

- [ ] Yeni kullanıcı kaydı oluştur
- [ ] Giriş yap
- [ ] Çıkış yap
- [ ] Profile bilgilerini görüntüle

### 2. Database Test

- [ ] Yeni konsültasyon oluştur
- [ ] Konsültasyon listesini görüntüle
- [ ] Konsültasyon güncelle
- [ ] Konsültasyon sil

### 3. Storage Test

- [ ] Ses kaydı yükle
- [ ] Kaydı görüntüle
- [ ] Kaydı sil

### 4. RLS Test

- [ ] Başka kullanıcının verilerine erişememeli
- [ ] Sadece kendi verilerine erişebilmeli

## 📚 Detaylı Dokümantasyon

- **Database Schema**: `supabase/schema.sql`
- **Auth Setup**: `supabase/auth-setup.md`
- **Storage Setup**: `supabase/storage-setup.sql`
- **Migration Guide**: `supabase/migration-guide.md`
- **Genel README**: `supabase/README.md`

## 🐛 Troubleshooting

### "Missing Supabase environment variables"

- `.env.local` dosyasını kontrol edin
- Next.js dev server'ı yeniden başlatın (`npm run dev`)

### "Row Level Security policy violation"

- RLS policies'lerin doğru yapılandırıldığından emin olun
- Kullanıcının authenticated olduğundan emin olun
- Supabase Dashboard > Authentication > Users'da kullanıcıyı kontrol edin

### "Profile oluşturulmuyor"

- `handle_new_user()` fonksiyonunun çalıştığından emin olun
- Trigger'ın aktif olduğundan emin olun
- Supabase Dashboard > Database > Functions'da kontrol edin

### "Storage upload hatası"

- Storage bucket'ın oluşturulduğundan emin olun
- Policies'lerin doğru yapılandırıldığından emin olun
- File size limit'i kontrol edin

## 🎉 Sonraki Adımlar

1. ✅ Database schema kuruldu
2. ✅ Storage bucket kuruldu
3. ⏳ AuthContext güncelleniyor
4. ⏳ Storage helper'lar güncelleniyor
5. ⏳ API routes güncelleniyor
6. ⏳ Test ediliyor
7. ⏳ Production'a deploy ediliyor

## 📞 Yardım

Sorun yaşarsanız:

1. Supabase Dashboard > Logs'u kontrol edin
2. Browser console'da hataları kontrol edin
3. Supabase dokümantasyonuna bakın: https://supabase.com/docs

---

**Not**: Bu rehber, Supabase kurulumu için gerekli tüm adımları içerir. Kod güncellemeleri için ayrı bir implementasyon gerekebilir.
