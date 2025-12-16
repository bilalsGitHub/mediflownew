# Yeni UI Görüntüleri Analizi

Yeni görüntülerden çıkarılan detaylı özellikler ve implementasyon notları.

## 1. Header Section (Görüşme Başlığı)

### Mevcut Özellikler
- ✅ **Status Badge**: "Not transferred" (mavi nokta ile)
  - Mavi dairesel nokta (●)
  - Light gray text: "Not transferred"
  - Konum: Üst sol
- ✅ **Date & Time**: "Monday, December 15 at 10:13"
  - Light gray text
  - Konum: Status'un yanında
- ✅ **Consultation Title**: "asdasd" (düzenlenebilir)
  - Büyük, bold font
  - Düzenlenebilir input field
  - Konum: Status/Date'in altında
- ❌ **Top Right Actions**:
  - "Speech-to-text" butonu (mikrofon ikonu, beyaz buton)
  - "+ New con" butonu (yeşil, plus ikonu)

### Implementasyon Notları
- Status badge component'i oluşturulmalı
- Date formatı: "Monday, December 15 at 10:13" formatında
- Title düzenlenebilir olmalı (zaten var, iyileştirilmeli)
- Top bar'a action butonları eklenmeli

## 2. Note Tab - SOAP Format

### Mevcut Özellikler
- ❌ **Subjektiv (Subjective)**:
  - Label: "Subjektiv" (bold, sol tarafta)
  - Text area: "Bauchschmerzen beim Trinken von kaltem Wasser. Bauchschmerzen auch beim Trinken von heißem Wasser."
  - Düzenlenebilir text area
- ❌ **Objektiv (Objective)**:
  - Label: "Objektiv" (bold, sol tarafta)
  - Text area: Boş, mavi border (aktif input)
  - Düzenlenebilir text area
- ❌ **Beurteilung & Plan (Assessment & Plan)**:
  - Label: "Beurteilung & Plan" (bold, sol tarafta)
  - Text area: Boş
  - Düzenlenebilir text area

### Layout
- Her section yan yana: Label (sol) + Text area (sağ)
- Label'lar bold, dark gray
- Text area'lar düzenlenebilir, border ile
- Spacing: Section'lar arası boşluk

### Implementasyon Notları
- SOAP format component'i oluşturulmalı
- Her section için ayrı text area
- Label + input layout
- AI analiz sonuçlarından otomatik doldurma

## 3. Note Tab - Anamnese Section

### Mevcut Özellikler
- ❌ **Anamnese Heading**: "Anamnese" (bold, dark gray)
- ❌ **Kontaktgrund (Contact Reason)**:
  - Label: "Kontaktgrund:"
  - Value: "Bauchschmerzen"
  - Format: Label + value yan yana
- ❌ **Aktueller Zustand (Current Condition)**:
  - Label: "Aktueller Zustand:"
  - Value: "Bauchschmerzen beim Trinken von kaltem Wasser. Bauchschmerzen auch beim Trinken von heißem Wasser."
  - Multi-line text

### Layout
- Anamnese section Note tab'ının üst kısmında
- Her field: Label + value formatında
- Düzenlenebilir olmalı

### Implementasyon Notları
- Anamnese component'i oluşturulmalı
- AI analiz sonuçlarından otomatik doldurma
- Düzenlenebilir fields

## 4. ICD-10 Code Section

### Mevcut Özellikler
- ❌ **Code Addition Area**:
  - Büyük beyaz kutu
  - Merkezi "+" ikonu (büyük)
  - "Click code to add" metni
  - Açıklayıcı metin: "Tandem presents codes relevant to what was discussed in the encounter, allowing you to select the appropriate ones."
- ❌ **Code Search**:
  - Search bar: "Search codes" placeholder
  - Magnifying glass ikonu (sol tarafta)
  - Input field
- ❌ **Relevant Codes Found**:
  - Başlık: "Relevant codes found:"
  - Kod listesi:
    - Yeşil pill: "ICD-10"
    - Kod numarası: "R10.4"
    - Açıklama: "Sonstige und nicht näher bezeichnete Bauchschmerzen"
    - "+" butonu (sağ tarafta, kod eklemek için)

### Layout
- Code addition area üstte (büyük, merkezi)
- Search bar ortada
- Relevant codes found altta (liste formatında)

### Implementasyon Notları
- ICD-10 code component'i oluşturulmalı
- AI ile otomatik kod önerileri (transkript analizi)
- Manuel kod arama (search bar)
- Kod ekleme/çıkarma fonksiyonları
- API endpoint: `/api/ai/suggest-codes` (transkript'ten kod önerileri)

## 5. Bottom Toolbar

### Mevcut Özellikler
- ❌ **Template Selector** (sol taraf):
  - "Template: Kurzdokumenta..." (dropdown)
  - "Template: Dokumentation P..." (dropdown)
  - Dropdown arrow ikonu
- ❌ **Action Buttons**:
  - "+ Add entry" butonu (plus ikonu)
  - "Add or adjust" butonu (yeşil, mikrofon ikonu)
  - "Copy note" butonu (siyah, doküman ikonu)
- ❌ **Microphone Selector** (opsiyonel):
  - Mikrofon dropdown (bottom toolbar'da)

### Layout
- Fixed position (alt kısımda)
- Sol: Template selector
- Sağ: Action butonları
- Background: Beyaz, border-top

### Implementasyon Notları
- Bottom toolbar component'i oluşturulmalı
- Template system implementasyonu
- Regenerate fonksiyonu (circular arrow ikonu)
- Add or adjust butonu (ses kaydı ile metin ekleme)
- Copy note fonksiyonu

## 6. Tab Structure

### Mevcut Tab'lar (Yeni Görüntülerde)
1. **Transcription** - Ham transkript
2. **Note** - SOAP format + Anamnese + ICD-10 codes
3. **Create document +** - Doküman oluşturma

### Bizim Tab'larımız
1. ✅ Transcription
2. ✅ Analysis (Note tab'ına dönüştürülmeli)
3. ✅ Notes (Note tab'ına birleştirilmeli)

### Önerilen Tab Yapısı
1. **Transcription** - Mevcut transkript görüntüleme
2. **Note** - SOAP format + Anamnese + ICD-10 codes
3. **Create document +** - Gelecekte eklenecek

## 7. Regenerate Function

### Mevcut Özellikler
- ❌ **Regenerate Button**:
  - Circular arrow ikonu
  - Bottom toolbar'da veya inline
  - AI ile metin yeniden oluşturma

### Implementasyon Notları
- API endpoint: `/api/ai/regenerate`
- Mevcut metni AI'ya gönder
- Yeni versiyon oluştur
- Kullanıcıya göster, onaylat

## 8. Add or Adjust Button

### Mevcut Özellikler
- ❌ **Add or Adjust Button**:
  - Yeşil buton
  - Mikrofon ikonu
  - "Add or adjust" metni
  - Ses kaydı ile metin ekleme/düzenleme

### Implementasyon Notları
- Mevcut metne ses kaydı ile ekleme
- Veya mevcut metni ses kaydı ile düzenleme
- Whisper API ile transkript
- Metne ekleme veya değiştirme

## 9. Status Management

### Mevcut Özellikler
- ❌ **Status Badge**:
  - "Not transferred" (mavi nokta)
  - "Transferred" (yeşil nokta)
  - "Completed" (gri nokta)
- ❌ **Status Dropdown**:
  - Status değiştirme menüsü
  - Renk kodlaması

### Implementasyon Notları
- Status badge component'i
- Status enum: 'not_transferred' | 'transferred' | 'completed' | 'draft'
- Status değiştirme fonksiyonu
- Renk kodlaması

## 10. Top Bar Actions

### Mevcut Özellikler
- ❌ **Speech-to-text Button**:
  - Mikrofon ikonu
  - "Speech-to-text" metni
  - Beyaz buton
  - Her zaman erişilebilir
- ❌ **New Consultation Button**:
  - "+ New con" (kısaltılmış)
  - Yeşil buton
  - Plus ikonu
  - Dropdown arrow (muhtemelen hızlı seçenekler)

### Implementasyon Notları
- TopBar component'ine eklenmeli
- Speech-to-text butonu global erişim
- New consultation butonu dropdown menü ile

## Özet: Yeni Özellikler

### Yüksek Öncelik (Phase 1)
1. **Status Management** - Badge ve status değiştirme
2. **Note Tab - SOAP Format** - Subjektiv, Objektiv, Beurteilung & Plan
3. **Anamnese Section** - Kontaktgrund, Aktueller Zustand
4. **Bottom Toolbar** - Template, actions, buttons
5. **ICD-10 Code Section** - Code addition, search, suggestions
6. **Regenerate Function** - AI ile metin yeniden oluşturma
7. **Add or Adjust Button** - Ses kaydı ile metin ekleme

### Orta Öncelik (Phase 2)
1. **Top Bar Actions** - Speech-to-text, New consultation
2. **Template System** - Not şablonları
3. **Microphone Selector** - Mikrofon seçimi
4. **Inline Editing** - Text area içinde mikrofon/copy

### Düşük Öncelik (Phase 3)
1. **Create Document Tab** - Doküman oluşturma
2. **Help Button** - Yardım ve destek
3. **Three-dot Menu** - Görüşme ayarları

## Veri Yapısı Güncellemeleri

### Consultation Interface
```typescript
interface Consultation {
  // Mevcut alanlar...
  patientName?: string; // ✅ Eklendi
  status?: 'draft' | 'approved' | 'rejected' | 'not_transferred' | 'transferred' | 'completed'; // Güncellendi
  anamnese?: { // YENİ
    kontaktgrund?: string;
    aktueller_zustand?: string;
  };
  soapNote?: { // YENİ
    subjektiv?: string;
    objektiv?: string;
    beurteilung_plan?: string;
  };
  icd10Codes?: Array<{ // YENİ
    code: string;
    description: string;
  }>;
}
```

## Uygulama Sırası

### Sprint 1: Core Note Features
1. Status management (badge + dropdown)
2. Note tab - SOAP format
3. Anamnese section
4. Bottom toolbar (temel)

### Sprint 2: Advanced Features
1. ICD-10 code integration
2. Regenerate function
3. Add or adjust button
4. Template system

### Sprint 3: Polish
1. Top bar actions
2. Microphone selector
3. Inline editing
4. Create Document tab

