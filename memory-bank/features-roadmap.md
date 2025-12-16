# Özellik Yol Haritası

Bu dosya, görüntülerden analiz edilen özelliklerin detaylı listesini ve uygulama planını içerir.

## Analiz Edilen Özellikler

### 1. Patient/Consultation Management

#### Patient Name Field
- **Açıklama**: Görüşme başlığı olarak hasta adı gösterimi
- **Görsel**: Büyük, bold font ile "anton" gibi
- **Konum**: Görüşme header'ında, tarih/saat'in altında
- **Öncelik**: Yüksek
- **Durum**: ❌ Eksik

#### Status Management
- **Açıklama**: Görüşme durumları (Not transferred, Transferred, Completed)
- **Görsel**: Mavi nokta + "Not transferred" badge
- **Konum**: Görüşme header'ında, üst kısımda
- **Öncelik**: Yüksek
- **Durum**: ❌ Eksik

#### Three-dot Menu
- **Açıklama**: Görüşme ayarları menüsü
- **Görsel**: Ellipsis ikonu
- **Konum**: Görüşme header'ında, sağ üst
- **Öncelik**: Düşük
- **Durum**: ❌ Eksik

### 2. Transcription Tab Enhancements

#### Timestamp Display
- **Açıklama**: Transkript'te zaman gösterimi ("00:00")
- **Görsel**: Küçük font, transkript başlığının altında
- **Konum**: Transcription tab içinde
- **Öncelik**: Düşük
- **Durum**: ❌ Eksik

#### Microphone Information
- **Açıklama**: Kullanılan mikrofon bilgisi
- **Görsel**: "Microphone: Kulaklık Mikrofon Bölümü (CORSAIR HS80 MAX WIRELESS Gaming Headset) (1b1c:0a97)"
- **Konum**: Transcription tab'ının altında
- **Öncelik**: Düşük
- **Durum**: ❌ Eksik

#### Microphone Selector
- **Açıklama**: Dropdown ile mikrofon seçimi
- **Görsel**: "Kulaklık Mikrofon Bölümü (C..." dropdown
- **Konum**: Bottom toolbar'da
- **Öncelik**: Orta
- **Durum**: ❌ Eksik

### 3. Note Tab Enhancements

#### Anamnese Section
- **Açıklama**: Yapılandırılmış anamnez bölümü
- **Alanlar**:
  - Kontaktgrund (Contact reason): "Bauchschmerzen"
  - Aktueller Zustand (Current condition): "Bauchschmerzen beim Essen."
- **Konum**: Note tab içinde, üst kısım
- **Öncelik**: Yüksek
- **Durum**: ❌ Eksik

#### Code Addition Section
- **Açıklama**: ICD-10 kod ekleme bölümü
- **Görsel**: Büyük beyaz kutu, "+" ikonu, "Click code to add" metni
- **Açıklayıcı Metin**: "Tandem presents codes relevant to what was discussed in the encounter, allowing you to select the appropriate ones."
- **Konum**: Note tab içinde
- **Öncelik**: Yüksek
- **Durum**: ❌ Eksik

#### Code Search
- **Açıklama**: ICD-10 kod arama
- **Görsel**: Search bar, "Search codes" placeholder, magnifying glass ikonu
- **Konum**: Code addition section'ın altında
- **Öncelik**: Yüksek
- **Durum**: ❌ Eksik

#### Relevant Codes Found
- **Açıklama**: AI ile önerilen ICD-10 kodları
- **Görsel**: Liste formatında, her kod için "+" butonu
- **Örnek**: "ICD-10 R10.4 Sonstige und nicht näher bezeichnete Bauchschmerzen"
- **Konum**: Code search'ün altında
- **Öncelik**: Yüksek
- **Durum**: ❌ Eksik

### 4. Patient Message Tab

#### Message Editor
- **Açıklama**: Hasta mesajı yazma ve düzenleme
- **Görsel**: Sol tarafta düzenlenebilir metin, sağ tarafta preview
- **Konum**: "Nachricht an den Patienten" tab'ında
- **Öncelik**: Orta
- **Durum**: ❌ Eksik

#### Regenerate Function
- **Açıklama**: AI ile mesajı yeniden oluşturma
- **Görsel**: "Regenerate" butonu (circular arrow ikonu)
- **Konum**: Bottom toolbar'da
- **Öncelik**: Yüksek
- **Durum**: ❌ Eksik

### 5. Referral Tabs

#### Überweisungsgrund (Referral Reason)
- **Açıklama**: Sevk nedeni formu
- **Form Fields**:
  - Datum (Date): "2025-12-15"
  - Diagnose/Klinische Fragestellung: "Bauchschmerzen nach dem Essen."
  - Erbetene Maßnahme: "Abklärung."
  - Anamnese und Befunde: Multi-line text area
- **Konum**: "Überweisungsgrund" tab'ında
- **Öncelik**: Orta
- **Durum**: ❌ Eksik

#### Überweisungsantwort (Referral Answer)
- **Açıklama**: Sevk cevabı yazma
- **İçerik**: 
  - Referral answer text
  - Signature: "Bilal Aslan"
  - Clinic name: "asdasdasd"
  - Date: "Montag, 15. Dezember 2025"
- **Konum**: "Überweisungsantwort" tab'ında
- **Öncelik**: Orta
- **Durum**: ❌ Eksik

### 6. Bottom Toolbar

#### Template Selector
- **Açıklama**: Not şablonu seçimi
- **Görsel**: "Template: Kurzdokumenta..." dropdown
- **Konum**: Bottom toolbar'ın sol tarafı
- **Öncelik**: Yüksek
- **Durum**: ❌ Eksik

#### Action Buttons
- **Regenerate**: Circular arrow ikonu
- **Add or adjust**: Yeşil buton, mikrofon ikonu
- **Copy note**: Siyah buton, doküman ikonu
- **+ Add entry**: Plus ikonu
- **Konum**: Bottom toolbar'da
- **Öncelik**: Yüksek
- **Durum**: ❌ Eksik

### 7. Additional Features

#### Help Button
- **Açıklama**: Yardım ve destek butonu
- **Görsel**: Siyah circular button, beyaz question mark
- **Konum**: Sağ alt köşe
- **Öncelik**: Düşük
- **Durum**: ❌ Eksik

#### Inline Editing
- **Açıklama**: Text area içinde mikrofon ve copy butonları
- **Görsel**: Text area'nın sağ tarafında küçük ikonlar
- **Konum**: Tüm düzenlenebilir text area'larda
- **Öncelik**: Orta
- **Durum**: ❌ Eksik

#### Signature & Date
- **Açıklama**: Otomatik imza ve tarih ekleme
- **İçerik**: Doktor adı, klinik adı, tarih
- **Konum**: Notların sonunda
- **Öncelik**: Orta
- **Durum**: ❌ Eksik

## Uygulama Planı

### Phase 1: Core Features (İlk Sprint) - GÜNCEL
1. ✅ Patient name field (düzenlenebilir başlık)
2. Status management (badge + dropdown)
3. Note tab - SOAP format (Subjektiv, Objektiv, Beurteilung & Plan)
4. Anamnese section (Kontaktgrund, Aktueller Zustand)
5. Bottom toolbar (template, actions, buttons)
6. ICD-10 code section (code addition, search, suggestions)
7. Regenerate function
8. Add or adjust button

### Phase 2: Advanced Features (İkinci Sprint)
1. ICD-10 code integration
2. Patient Message tab
3. Referral tabs
4. Template system
5. Microphone selector
6. Signature & Date

### Phase 3: Polish (Üçüncü Sprint)
1. Help button
2. Three-dot menu
3. Timestamp display
4. Microphone info
5. Inline editing
6. Create Document tab

## Teknik Notlar

### ICD-10 Code Integration
- AI ile otomatik kod önerileri (transkript analizi)
- Manuel kod arama (search bar)
- Kod ekleme/çıkarma
- Kod listesi görüntüleme

### Regenerate Function
- Mevcut metni AI'ya gönder
- Yeni versiyon oluştur
- Kullanıcıya göster, onaylat
- Eski versiyonu sakla (audit için)

### Template System
- Önceden tanımlı şablonlar
- Dropdown ile seçim
- Şablon içeriğini not alanına yükle
- Özelleştirilebilir şablonlar (gelecekte)

### Status Management
- "Not transferred" (mavi)
- "Transferred" (yeşil)
- "Completed" (gri)
- Status değiştirme butonu

## Veri Yapısı Güncellemeleri

### Consultation Interface Güncellemesi
```typescript
interface Consultation {
  // Mevcut alanlar...
  patientName?: string; // ✅ Eklendi
  status?: 'draft' | 'approved' | 'rejected' | 'not_transferred' | 'transferred' | 'completed'; // GÜNCELLENDİ
  anamnese?: { // YENİ
    kontaktgrund?: string;
    aktueller_zustand?: string;
  };
  soapNote?: { // YENİ (SOAP format)
    subjektiv?: string;
    objektiv?: string;
    beurteilung_plan?: string;
  };
  icd10Codes?: Array<{ // YENİ
    code: string;
    description: string;
  }>;
  referralReason?: { // YENİ
    datum?: string;
    diagnose?: string;
    erbetene_massnahme?: string;
    anamnese_und_befunde?: string;
  };
  referralAnswer?: string; // YENİ
  patientMessage?: string; // YENİ
  signature?: { // YENİ
    doctorName: string;
    clinicName: string;
    date: string;
  };
}
```

## Notlar

- Tüm özellikler doktor iş akışını kolaylaştırmak için
- AI entegrasyonu önemli (kod önerileri, regenerate)
- Template sistemi zaman kazandırır
- Status management workflow'u netleştirir
- Bottom toolbar hızlı erişim sağlar

