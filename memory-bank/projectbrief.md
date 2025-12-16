# Proje Tanımı – Doktor Görüşme Asistanı

## Genel Bakış

Doktor–hasta görüşmelerinde, doktorların görüşme sırasında hastanın anlattıklarını dinleyip aynı anda not alması; sonrasında bu notları tekrar düzenlemesi ciddi bir zaman ve dikkat kaybına yol açmaktadır. Bu süreç; tekrar yazma, hatırlama, özetleme ve manuel düzenleme gibi gereksiz bilişsel yükler içerir.

## Problem

- Doktorlar görüşme sırasında hem dinlemek hem not almak zorunda
- Görüşme sonrası notları düzenlemek zaman alıyor
- Manuel yazma ve düzenleme süreci hataya açık
- Bilişsel yük artıyor, hasta odaklılık azalıyor

## Çözüm

Doktor–hasta görüşmelerini otomatik olarak kaydeden, yapay zekâ ile analiz eden ve yapılandırılmış tıbbi notlara dönüştüren bir web uygulaması.

## Temel Akış

1. **Ses Kaydı**: Doktor mikrofonu aktif eder, görüşme kaydedilir
2. **AI Analizi**: Ses → metin → yapılandırılmış tıbbi özet
3. **Doktor Onayı**: Düzenleme, onaylama veya yeniden analiz
4. **Veri Kaydı**: Onaylanan içerik veritabanına kaydedilir

## Kapsam (V1)

### Dahil Olanlar
- Ses kaydı alma
- AI ile analiz (speech-to-text + metin analizi)
- Veritabanına kayıt
- Basit dashboard (kayıt listesi)
- Doktor authentication

### Dahil Olmayanlar (Gelecek Versiyonlar)
- Hasta portalı
- Randevu yönetimi
- Çoklu dil desteği (ilk versiyon tek dil)
- Gelişmiş raporlama
- Mobil uygulama

## Temel Prensipler

1. **Gizlilik ve Güvenlik**: Tıbbi verilerin güvenliği en öncelikli konu
2. **AI Sınırları**: AI tıbbi yorum yapmaz, tanı koymaz, sadece duyulan bilgiyi düzenler ve özetler
3. **Doktor Odaklı**: Tüm tasarım doktorun iş akışını kolaylaştırmak için
4. **Minimal UI**: Dikkat dağıtmayan, sade, pastel renkler
5. **Tek İş, Tek Ekran**: Her ekran tek bir göreve odaklanır

## Başarı Kriterleri

- Doktorlar görüşme sırasında sadece dinleyebilmeli
- Not alma süresi %80+ azalmalı
- AI çıktıları doktor tarafından kolayca düzenlenebilmeli
- Sistem güvenli ve gizlilik standartlarına uygun olmalı

