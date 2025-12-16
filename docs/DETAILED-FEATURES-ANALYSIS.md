# Detaylı Özellik Analizi - Yeni Görüntüler

Görüntülerden çıkarılan detaylı özellikler ve eksikler.

## 1. Patient/Consultation Header

### Mevcut Özellikler
- ✅ Status badge: "Not transferred" (mavi nokta ile)
- ✅ Tarih ve saat gösterimi: "Monday, December 15 at 09:51"
- ❌ **Patient name gösterimi**: "anton" - başlık olarak büyük font
- ❌ **Three-dot menu**: Ellipsis ikonu (muhtemelen görüşme ayarları)

### Eksiklerimiz
- Patient name field'ı yok
- Görüşme başlığı düzenlenebilir değil
- Three-dot menu yok

## 2. Transcription Tab

### Mevcut Özellikler
- ✅ Transkript metni gösterimi
- ❌ **Timestamp**: "00:00" formatında gösterim
- ❌ **Microphone bilgisi**: "Microphone: Kulaklık Mikrofon Bölümü (CORSAIR HS80 MAX WIRELESS Gaming Headset) (1b1c:0a97)"
- ❌ **Microphone selector**: Dropdown ile mikrofon seçimi

### Eksiklerimiz
- Timestamp gösterimi yok
- Microphone bilgisi gösterimi yok
- Microphone selector yok

## 3. Note Tab

### Mevcut Özellikler
- ✅ Yapılandırılmış not formatı
- ❌ **Anamnese bölümü**:
  - "Kontaktgrund" (Contact reason): "Bauchschmerzen"
  - "Aktueller Zustand" (Current condition): "Bauchschmerzen beim Essen."
- ❌ **Code Addition Section**:
  - Büyük beyaz kutu
  - "+" ikonu ve "Click code to add" metni
  - Açıklayıcı metin: "Tandem presents codes relevant to what was discussed in the encounter, allowing you to select the appropriate ones."
- ❌ **Code Search**:
  - Search bar: "Search codes" placeholder
  - Magnifying glass ikonu
- ❌ **Relevant Codes Found**:
  - Başlık: "Relevant codes found:"
  - ICD-10 kod listesi
  - Her kod için "+" butonu
  - Kod açıklaması: "ICD-10 R10.4 Sonstige und nicht näher bezeichnete Bauchschmerzen"

### Eksiklerimiz
- Anamnese bölümü yok (sadece genel analiz var)
- Code addition section yok
- Code search yok
- Relevant codes found listesi yok

## 4. Nachricht an den Patienten Tab (Patient Message)

### Mevcut Özellikler
- ❌ **Message Editor**: 
  - Sol tarafta düzenlenebilir metin alanı
  - Sağ tarafta boş text area (muhtemelen preview)
- ❌ **Action Buttons**:
  - "Regenerate" butonu (circular arrow ikonu)
  - "Add or adjust" butonu (yeşil, mikrofon ikonu)
  - "Copy note" butonu (siyah, doküman ikonu)
- ❌ **Inline Actions**:
  - Microphone ikonu (text area içinde)
  - Copy butonu (text area içinde)

### Eksiklerimiz
- Patient message tab'ı yok
- Message editor yok
- Regenerate fonksiyonu yok

## 5. Überweisungsgrund Tab (Referral Reason)

### Mevcut Özellikler
- ❌ **Form Fields**:
  - "Datum" (Date): "2025-12-15"
  - "Diagnose/Klinische Fragestellung" (Diagnosis/Clinical Question): "Bauchschmerzen nach dem Essen."
  - "Erbetene Maßnahme" (Requested Measure): "Abklärung."
- ❌ **Anamnese und Befunde** (Anamnesis and Findings):
  - Büyük text area
  - Düzenlenebilir içerik
  - Edit/delete ikonları (trash can, square icon)
  - Microphone ve Copy butonları text area içinde
- ❌ **Content**:
  - Multi-line text
  - Signature: "Bilal Aslan"
  - Clinic name: "asdasdasd"

### Eksiklerimiz
- Referral reason tab'ı yok
- Form fields yok
- Anamnese und Befunde section yok

## 6. Überweisungsantwort Tab (Referral Answer)

### Mevcut Özellikler
- ❌ **Referral Answer Text**:
  - Düzenlenebilir metin alanı
  - Signature: "Bilal Aslan"
  - Clinic name: "asdasdasd"
  - Date: "Montag, 15. Dezember 2025"
- ❌ **Action Buttons**:
  - "Regenerate" butonu
  - "Add or adjust" butonu (yeşil)
  - "Copy note" butonu (siyah)
- ❌ **Inline Actions**:
  - Microphone ikonu
  - Copy butonu

### Eksiklerimiz
- Referral answer tab'ı yok
- Signature ve date otomatik ekleme yok
- Regenerate fonksiyonu yok

## 7. Bottom Toolbar

### Mevcut Özellikler
- ❌ **Template Selector** (sol):
  - "Template: Kurzdokumenta..." (dropdown)
  - "Template: Dokumentation P..." (dropdown)
- ❌ **Action Buttons**:
  - "Regenerate" butonu (circular arrow ikonu)
  - "+ Add entry" butonu
  - "Add or adjust" butonu (yeşil, mikrofon ikonu)
  - "Copy note" butonu (siyah, doküman ikonu)
- ❌ **Microphone Selector**:
  - "Kulaklık Mikrofon Bölümü (C..." (dropdown)
  - Mikrofon listesi

### Eksiklerimiz
- Bottom toolbar yok
- Template selector yok
- Regenerate butonu yok
- Microphone selector yok

## 8. Additional Features

### Mevcut Özellikler
- ❌ **Help Button**: 
  - Sağ alt köşe
  - Siyah circular button
  - Beyaz question mark ikonu
- ❌ **Top Bar Actions**:
  - "Speech-to-text" butonu (mikrofon ikonu) - her zaman erişilebilir
  - "+ New consultation" butonu (yeşil, dropdown)
- ❌ **Status Management**:
  - "Not transferred" badge
  - Transfer durumu yönetimi

### Eksiklerimiz
- Help button yok
- Top bar'da speech-to-text butonu yok
- Status management yok

## 9. Tab Structure

### Mevcut Tab'lar (Tandem'de)
1. **Transcription** - Ham transkript
2. **Note** - Yapılandırılmış not
3. **Nachricht an den Patienten** - Hasta mesajı
4. **Überweisungsgrund** - Sevk nedeni
5. **Überweisungsantwort** - Sevk cevabı
6. **Create document +** - Doküman oluşturma

### Bizim Tab'larımız
1. ✅ **Transcription** - Transkript görüntüleme
2. ✅ **Analysis** - AI analiz sonuçları
3. ✅ **Notes** - Doktor notları

### Eksik Tab'larımız
- ❌ Patient Message tab
- ❌ Referral Reason tab
- ❌ Referral Answer tab
- ❌ Create Document tab

## 10. Text Editing Features

### Mevcut Özellikler
- ❌ **Inline Editing**:
  - Text area içinde mikrofon ikonu
  - Text area içinde copy butonu
  - Edit/delete ikonları
- ❌ **Regenerate Function**:
  - AI ile metni yeniden oluşturma
  - Circular arrow ikonu
- ❌ **Add or Adjust**:
  - Ses kaydı ile metin ekleme/düzenleme
  - Yeşil buton, mikrofon ikonu

### Eksiklerimiz
- Inline editing yok
- Regenerate fonksiyonu yok
- Add or adjust butonu yok

## 11. Data Structure

### Mevcut Veri Yapısı (Tandem'de)
- Patient name
- Status (Not transferred, Transferred, etc.)
- Date fields (Datum)
- Diagnosis field
- Requested measure field
- Anamnesis and findings (multi-line)
- Signature
- Clinic name
- ICD-10 codes array

### Bizim Veri Yapımız
- ✅ Transcript
- ✅ Conversation (speaker identification)
- ✅ Analysis (patient_complaint, symptoms, etc.)
- ✅ Doctor notes
- ❌ Patient name
- ❌ Status management
- ❌ ICD-10 codes
- ❌ Signature
- ❌ Clinic name
- ❌ Referral data

## Özet: Eksik Özellikler

### Yüksek Öncelik
1. **Patient Name Field** - Görüşme başlığı olarak
2. **Status Management** - "Not transferred" gibi durumlar
3. **Anamnese Section** - Kontaktgrund, Aktueller Zustand
4. **ICD-10 Code Integration** - Code addition, search, suggestions
5. **Bottom Toolbar** - Template, actions, microphone selector
6. **Regenerate Function** - AI ile metin yeniden oluşturma
7. **Add or Adjust Button** - Ses kaydı ile metin ekleme

### Orta Öncelik
1. **Patient Message Tab** - Hasta mesajlaşma
2. **Referral Tabs** - Überweisungsgrund, Überweisungsantwort
3. **Microphone Selector** - Mikrofon seçimi
4. **Template System** - Not şablonları
5. **Signature & Date** - Otomatik imza ve tarih ekleme
6. **Help Button** - Yardım ve destek

### Düşük Öncelik
1. **Create Document Tab** - Doküman oluşturma
2. **Three-dot Menu** - Görüşme ayarları
3. **Timestamp Display** - Transkript'te zaman gösterimi
4. **Microphone Info** - Kullanılan mikrofon bilgisi

## Önerilen Uygulama Sırası

### Phase 1: Core Features
1. Patient name field
2. Status management
3. Anamnese section (Note tab'ında)
4. Bottom toolbar (temel)
5. Regenerate function

### Phase 2: Advanced Features
1. ICD-10 code integration
2. Patient message tab
3. Referral tabs
4. Template system
5. Microphone selector

### Phase 3: Polish
1. Help button
2. Three-dot menu
3. Timestamp display
4. Create document tab

