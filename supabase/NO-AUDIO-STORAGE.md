# 🎤 Ses Kayıtları Saklanmıyor

## ⚠️ Önemli Not

Bu uygulamada **ses kayıtları saklanmıyor**. Sadece **transkript (metin)** veritabanında saklanıyor.

## 🔄 Nasıl Çalışıyor?

1. Kullanıcı ses kaydı yapar (tarayıcıda)
2. Ses kaydı **sadece transkript için** OpenAI Whisper API'ye gönderilir
3. OpenAI transkripti döndürür
4. **Sadece transkript** veritabanına kaydedilir
5. Ses kaydı (blob) **silinir**, saklanmaz

## ✅ Avantajlar

- ✅ **Gizlilik**: Ses kayıtları saklanmadığı için daha güvenli
- ✅ **Depolama**: Storage maliyeti yok
- ✅ **Hız**: Daha hızlı işlem (upload yok)
- ✅ **GDPR/HIPAA**: Daha az veri saklama = daha az yasal sorumluluk

## 📋 Schema Değişiklikleri

`consultations` tablosunda:
- ❌ `recording_url` alanı **kullanılmıyor** (yorum satırı)
- ✅ `transcript` alanı **kullanılıyor** (metin transkript)
- ✅ `conversation` alanı **kullanılıyor** (JSONB - konuşmacı ayrımı)

## 🚀 Kurulum

Storage bucket kurulumu **gerekmez**. Sadece:
1. Database schema çalıştırın (`supabase/schema.sql`)
2. Test kullanıcı oluşturun
3. Uygulamayı başlatın

## 🔮 Gelecekte Ses Kayıtları Saklamak İsterseniz

Eğer gelecekte ses kayıtlarını saklamak isterseniz:
1. `supabase/storage-setup.sql` dosyasına bakın
2. Storage bucket oluşturun
3. Schema'da `recording_url` alanını aktif edin
4. Kod tarafında upload işlemini ekleyin

---

**Not:** Mevcut kod zaten ses kayıtlarını saklamıyor, sadece transkript için kullanıyor. Bu değişiklik sadece dokümantasyonu günceller.

