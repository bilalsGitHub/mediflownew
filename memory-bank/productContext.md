# Ürün Bağlamı

## Neden Bu Proje Var?

Doktorlar, hasta görüşmelerinde iki zorlu görevi aynı anda yapmak zorunda:
1. Hastayı dikkatle dinlemek ve empati kurmak
2. Önemli bilgileri not almak

Bu ikili görev, hem doktorun hasta ile bağlantısını zayıflatıyor hem de görüşme sonrası notları düzenlemek için ekstra zaman gerektiriyor.

## Çözdüğü Problemler

### Ana Problem
- **Zaman Kaybı**: Görüşme sırasında not alma + sonrasında düzenleme
- **Dikkat Dağınıklığı**: Not alırken hasta ile göz teması ve empati kaybı
- **Hata Riski**: Manuel yazım hataları, eksik bilgiler
- **Bilişsel Yük**: Dinleme + yazma + düzenleme süreçleri

### Çözüm Yaklaşımı
1. **Otomatik Kayıt**: Doktor sadece dinler, sistem kaydeder
2. **AI Dönüşüm**: Ses → metin → yapılandırılmış not
3. **Hızlı Düzenleme**: Doktor sadece kontrol eder ve düzenler
4. **Geçmiş Erişimi**: Tüm notlar merkezi veritabanında

## Nasıl Çalışmalı?

### Kullanıcı Deneyimi Akışı

```
1. Doktor giriş yapar
   ↓
2. "Yeni Görüşme" butonuna tıklar
   ↓
3. Mikrofonu aktif eder (büyük, net buton)
   ↓
4. Görüşme boyunca kayıt devam eder
   - Dil seçimi (varsayılan: Türkçe)
   - "Beğenmedim / Tekrar al" seçenekleri
   ↓
5. Kayıt bitince "Analiz Et" butonu
   ↓
6. AI analiz sonuçları gösterilir:
   - Hasta şikâyeti
   - Semptomlar
   - Süre/sıklık
   - Ön tanı (sadece özet, yorum değil)
   - Doktor notu taslağı
   ↓
7. Doktor tab'lar arasında gezinir:
   - Transcription: Ham transkript görüntüleme
   - Analysis: AI analiz sonuçları
   - Notes: Doktor notları
   ↓
8. Doktor notu oluşturur (ses kaydı ile veya yazarak)
   ↓
9. AI ile düzenler (Regenerate, Add or adjust)
   ↓
10. ICD-10 kodları ekler (AI önerileri veya manuel arama)
   ↓
11. Onaylar ve kaydeder
```

### UI/UX Prensipleri

1. **Doktor Odaklı Tasarım**
   - Her ekran doktorun iş akışına uygun
   - Minimum tıklama ile maksimum işlevsellik

2. **Görsel Tasarım**
   - Büyük ve net butonlar
   - Düz, pastel ve sade renkler
   - Göz yormayan, minimal tasarım
   - "Tek iş, tek ekran" yaklaşımı

3. **Etkileşim Tasarımı**
   - Ses kaydı için büyük, merkezi buton
   - Durum göstergeleri (kayıt devam ediyor, analiz ediliyor)
   - Hızlı geri bildirim

## Kullanıcı Hedefleri

### Doktorlar İçin
- Görüşme sırasında sadece hastaya odaklanabilmek
- Not alma süresini minimize etmek
- Hızlı ve doğru notlar oluşturmak
- Geçmiş görüşmelere kolay erişim

### Sistem İçin
- Güvenli veri saklama
- Hızlı AI analizi
- Ölçeklenebilir altyapı
- Gizlilik standartlarına uyum

## Gelecek Vizyonu

- Çoklu dil desteği
- Hasta portalı entegrasyonu
- Gelişmiş analitik ve raporlama
- Mobil uygulama
- Ses kalitesi iyileştirme
- Gerçek zamanlı transkript

