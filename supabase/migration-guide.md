# Supabase Migration Rehberi

Bu rehber, mevcut localStorage tabanlı sistemi Supabase'e nasıl geçireceğinizi açıklar.

## Adım 1: Supabase Projesi Kurulumu

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. Project URL ve API keys'leri not edin

## Adım 2: Database Schema Kurulumu

1. Supabase Dashboard > SQL Editor'e gidin
2. `supabase/schema.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'de çalıştırın
4. Başarılı olduğunu doğrulayın (herhangi bir hata olmamalı)

## Adım 3: Storage Bucket (OPSİYONEL - GEREKMEZ)

⚠️ **ÖNEMLİ:** Bu uygulamada ses kayıtları saklanmıyor! Sadece transkript (metin) veritabanında saklanıyor.

Storage bucket kurulumu **gerekmez**. Ses kayıtları sadece transkript için kullanılıyor ve kaydedilmiyor.

Eğer gelecekte ses kayıtlarını saklamak isterseniz, `supabase/storage-setup.sql` dosyasına bakabilirsiniz.

## Adım 4: Environment Variables

`.env.local` dosyasına ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Adım 5: Code Migration

### 5.1 AuthContext Güncelleme

`lib/AuthContext.tsx` dosyasını Supabase Auth kullanacak şekilde güncelleyin:

```typescript
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

// Supabase Auth kullanarak login, register, logout implementasyonu
```

### 5.2 Storage Helper Güncelleme

`lib/storage.ts` dosyasını Supabase database kullanacak şekilde güncelleyin:

```typescript
import { supabase } from "@/lib/supabase/client";

// Consultations için Supabase CRUD operations
// Appointments için Supabase CRUD operations
```

### 5.3 API Routes Güncelleme

API route'larında Supabase client kullanın:

```typescript
import { createClient } from "@/lib/supabase/server";

// Server-side Supabase client kullanarak veri işlemleri
```

## Adım 6: Veri Migration (İsteğe Bağlı)

Mevcut localStorage verilerini Supabase'e taşımak için:

1. Browser console'da localStorage verilerini export edin
2. Bir migration script'i oluşturun
3. Verileri Supabase'e import edin

**Not**: Production'da bu adım gerekli değildir çünkü yeni sistemle başlayacaksınız.

## Adım 7: Test

1. Yeni kullanıcı kaydı oluşturun
2. Giriş yapın
3. Yeni konsültasyon oluşturun
4. Verilerin Supabase'de göründüğünü doğrulayın
5. RLS policies'lerin çalıştığını test edin

## Adım 8: Production Deployment

1. Environment variables'ları production ortamına ekleyin
2. Supabase project'in production modunda olduğundan emin olun
3. Email verification'ı açın (güvenlik için)
4. Rate limiting ayarlarını kontrol edin

## Troubleshooting

### Schema hatası

- SQL dosyasını adım adım çalıştırın
- Hata mesajlarını kontrol edin
- Supabase Dashboard > Database > Tables'da tabloların oluştuğunu doğrulayın

### RLS policy hatası

- Policies'lerin doğru yapılandırıldığından emin olun
- `auth.uid()` fonksiyonunun çalıştığını test edin
- Supabase Dashboard > Authentication > Users'da kullanıcının olduğunu doğrulayın

### Storage upload hatası

- Storage bucket kurulumu gerekmez - ses kayıtları saklanmıyor

## Sonraki Adımlar

1. ✅ Database schema kuruldu
2. ⏭️ Storage bucket gerekmez (ses kayıtları saklanmıyor)
3. ⏳ AuthContext güncelleniyor
4. ⏳ Storage helper'lar güncelleniyor
5. ⏳ API routes güncelleniyor
6. ⏳ Test ediliyor
7. ⏳ Production'a deploy ediliyor
