# 🚀 Hızlı Başlangıç - Supabase Kurulumu

Projeniz hazır! Şimdi sadece birkaç adım kaldı.

## ✅ Tamamlanan Adımlar

- ✅ `.env.local` dosyası oluşturuldu
- ✅ Supabase URL ve API key'ler eklendi
- ✅ Supabase client dosyaları hazır

## 📋 Yapılacaklar

### 1. OpenAI API Key Ekleme

`.env.local` dosyasını açın ve `OPENAI_API_KEY` değerini güncelleyin:

```env
OPENAI_API_KEY=sk-your-actual-openai-key-here
```

### 2. Database Schema Kurulumu

1. [Supabase Dashboard](https://app.supabase.com) > Projenize gidin
2. Sol menüden **SQL Editor**'e tıklayın
3. **New Query** butonuna tıklayın
4. `supabase/schema.sql` dosyasının **tüm içeriğini** kopyalayın
5. SQL Editor'e yapıştırın
6. **Run** butonuna tıklayın (veya `Ctrl+Enter`)
7. Başarılı olduğunu doğrulayın ✅

**Önemli:** Tüm SQL komutları başarıyla çalışmalı. Hata varsa, hata mesajını kontrol edin.

### 3. Storage Bucket (OPSİYONEL - GEREKMEZ)

⚠️ **NOT:** Bu uygulamada ses kayıtları saklanmıyor! Sadece transkript (metin) veritabanında saklanıyor.

Storage bucket kurulumu **gerekmez**. Ses kayıtları sadece transkript için kullanılıyor ve kaydedilmiyor.

Eğer gelecekte ses kayıtlarını saklamak isterseniz, `supabase/storage-setup.sql` dosyasına bakabilirsiniz.

### 3. Test Kullanıcı Oluşturma

1. Supabase Dashboard > **Authentication** > **Users**
2. **Add User** butonuna tıklayın
3. Ayarlar:
   - **Email**: `doctor@test.com`
   - **Password**: `test123`
   - **Auto Confirm User**: ✅ (işaretli)
4. **Create User** butonuna tıklayın

### 4. Uygulamayı Başlatma

Terminal'de:

```bash
npm run dev
```

Tarayıcıda `http://localhost:3000` adresine gidin.

## ✅ Kontrol Listesi

- [ ] `.env.local` dosyasında OpenAI API key var mı?
- [ ] Database schema çalıştırıldı mı? (Supabase Dashboard > SQL Editor)
- [ ] Test kullanıcı oluşturuldu mu? (`doctor@test.com` / `test123`)
- [ ] Uygulama çalışıyor mu? (`npm run dev`)

**Not:** Storage bucket kurulumu gerekmez - ses kayıtları saklanmıyor, sadece transkript saklanıyor.

## 🎉 Hazırsınız!

Artık Supabase'e bağlı bir uygulamanız var. Kod güncellemeleri için:

- `lib/AuthContext.tsx` - Supabase Auth kullanacak şekilde güncellenmeli
- `lib/storage.ts` - Supabase database kullanacak şekilde güncellenmeli

Bu güncellemeler için ayrı bir implementasyon gerekebilir.

## 🐛 Sorun mu var?

### "Missing Supabase environment variables"

- `.env.local` dosyasını kontrol edin
- Next.js dev server'ı yeniden başlatın: `npm run dev`

### "Row Level Security policy violation"

- RLS policies'lerin doğru yapılandırıldığından emin olun
- Kullanıcının authenticated olduğundan emin olun

### Schema hatası

- SQL dosyasını adım adım çalıştırın
- Hata mesajlarını kontrol edin
- Supabase Dashboard > Database > Tables'da tabloların oluştuğunu doğrulayın

---

**Not:** Yeni Supabase API key formatı (`sb_publishable_...`) kullanılıyor. Bu format destekleniyor.
