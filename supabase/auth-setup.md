# Supabase Auth Yapılandırma Rehberi

Bu rehber, MediFlow uygulaması için Supabase Authentication'ı nasıl yapılandıracağınızı açıklar.

## 1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. Proje ayarlarından şunları not edin:
   - Project URL
   - Anon (public) key
   - Service role key (güvenli tutun, sadece server-side kullanın)

## 2. Environment Variables

`.env.local` dosyasına şunları ekleyin:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI (mevcut)
OPENAI_API_KEY=your-openai-key
```

## 3. Auth Yapılandırması

### Supabase Dashboard > Authentication > Settings

#### Email Auth
- ✅ Enable email signup: Açık
- ✅ Confirm email: İsteğe bağlı (development için kapatılabilir)
- ✅ Secure email change: Açık

#### Password Requirements
- Minimum length: 6 karakter (veya daha fazla)
- Require uppercase: İsteğe bağlı
- Require lowercase: İsteğe bağlı
- Require numbers: İsteğe bağlı
- Require special characters: İsteğe bağlı

#### Email Templates
- Customize email templates (isteğe bağlı)
- Default templates kullanılabilir

## 4. Auth Providers (İsteğe Bağlı)

Şu an için sadece Email/Password kullanıyoruz. İleride eklenebilir:
- Google OAuth
- GitHub OAuth
- vs.

## 5. Database Schema

`supabase/schema.sql` dosyasını Supabase Dashboard > SQL Editor'de çalıştırın.

Bu şunları oluşturur:
- `profiles` tablosu
- `handle_new_user()` fonksiyonu
- `on_auth_user_created` trigger (yeni kullanıcı kaydında otomatik profile oluşturur)

## 6. Test Kullanıcı Oluşturma

### Supabase Dashboard'dan:
1. Authentication > Users > Add User
2. Email: `doctor@test.com`
3. Password: `test123`
4. Auto Confirm User: ✅

### Veya SQL ile:
```sql
-- Test kullanıcısı oluştur (Supabase Dashboard > SQL Editor)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'doctor@test.com',
  crypt('test123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Test Doktor", "role": "doctor"}'::jsonb
);
```

## 7. AuthContext Güncelleme

`lib/AuthContext.tsx` dosyası Supabase Auth kullanacak şekilde güncellenmelidir.

Örnek implementasyon:
- `supabase.auth.signUp()` - Kayıt
- `supabase.auth.signInWithPassword()` - Giriş
- `supabase.auth.signOut()` - Çıkış
- `supabase.auth.getUser()` - Mevcut kullanıcı
- `supabase.auth.onAuthStateChange()` - Auth state değişikliklerini dinle

## 8. Güvenlik Notları

1. **Service Role Key**: Asla client-side'da kullanmayın
2. **RLS Policies**: Tüm tablolarda Row Level Security aktif
3. **Storage Policies**: Storage bucket'ları için de RLS aktif
4. **Email Verification**: Production'da email doğrulama açık olmalı

## 9. Migration (LocalStorage'dan Supabase'e)

Mevcut localStorage verilerini Supabase'e taşımak için:

1. `lib/storage.ts` dosyasını Supabase client kullanacak şekilde güncelleyin
2. `lib/userStorage.ts` dosyasını Supabase Auth kullanacak şekilde güncelleyin
3. Mevcut verileri export edip import eden bir migration script'i oluşturun (isteğe bağlı)

## 10. Troubleshooting

### "Missing Supabase environment variables" hatası
- `.env.local` dosyasını kontrol edin
- Environment variables'ların doğru olduğundan emin olun
- Next.js dev server'ı yeniden başlatın

### "Row Level Security policy violation" hatası
- RLS policies'lerin doğru yapılandırıldığından emin olun
- Kullanıcının authenticated olduğundan emin olun
- `auth.uid()` fonksiyonunun çalıştığından emin olun

### Profile oluşturulmuyor
- `handle_new_user()` fonksiyonunun çalıştığından emin olun
- Trigger'ın aktif olduğundan emin olun
- Supabase Dashboard > Database > Functions'da kontrol edin

