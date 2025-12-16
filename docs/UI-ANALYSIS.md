# UI Analizi - Tandem Benzeri Özellikler

Görüntülerden analiz edilen özellikler ve öneriler.

## 1. Genel Layout ve Yapı

### Sol Sidebar (Navigation)

- **Home** butonu (ev ikonu)
- **User guide** (kitap ikonu) - Progress göstergesi ile ("2 steps left")
- **All encounters** (collapsible section)
  - Tarih gruplaması ("Today, 15 December")
  - Her görüşme için:
    - Saat ve başlık
    - Durum göstergesi (Paused, Not transferred)
    - Renkli nokta göstergeleri (sarı-yeşil, mavi)
- **User profile** (alt kısım)
  - Avatar (harf ile)
  - İsim
  - Settings ikonu

### Üst Bar (Top Navigation)

- **Banner/Notification**:
  - "Your free trial is ending in X day(s)"
  - "Upgrade now" linki
  - Yeşil nokta göstergesi
- **Action Buttons**:
  - "Speech-to-text" butonu (mikrofon ikonu)
  - "+ New consultation" butonu (yeşil, dropdown arrow)
- **Close button** (X ikonu)

### Ana İçerik Alanı

- **Encounter Header**:
  - Durum göstergesi (mavi nokta, "Not transferred")
  - Tarih ve saat ("Monday, December 15 at 09:38")
  - Başlık ("New consultation") - düz çizgili alt çizgi
  - Three-dot menu (ellipsis)
- **Tab Navigation**:
  - "Transcription" (aktif olduğunda vurgulu)
  - "Note"
  - "Überweisungsantwort" (Referral Response)
  - "+ Nachricht an den Patienten" (Message to Patient)
  - "Create document +"
- **Timer Display**:
  - Büyük, merkezi timer ("00:04")
  - Durum metni ("Paused")
  - "Resume encounter" butonu (büyük, gri, circular arrow ikonu)
  - Arka planda yumuşak gradient efekti (yeşil-mavi)

### Alt Bar (Bottom Toolbar)

- **Sol taraf**:
  - "Template: Dokumentation P..." (dropdown)
  - "Add additional text" (kalem ikonu)
  - "Kulaklık Mikrofon Bölümü" (mikrofon ikonu, dropdown)
- **Sağ taraf**:
  - "Finish and create note" (siyah buton)
  - "Copy note" (doküman ikonu)
  - "Add or adjust" (yeşil buton, plus ikonu)

## 2. Önemli Özellikler

### A. Encounter/Consultation Management

1. **Görüşme Listesi**:

   - Tarih bazlı gruplama
   - Saat ve başlık gösterimi
   - Durum göstergeleri (Paused, Not transferred, Completed)
   - Renkli nokta sistemleri

2. **Görüşme Durumları**:

   - Aktif görüşme (vurgulu arka plan)
   - Paused durumu
   - Transfer durumu ("Not transferred")
   - Tamamlanma durumu

3. **Timer Özelliği**:
   - Gerçek zamanlı sayaç
   - Pause/Resume fonksiyonları
   - Görsel olarak öne çıkan tasarım

### B. Tab-Based Interface

1. **Transcription Tab**:

   - Ham transkript görüntüleme
   - Chat formatında konuşma gösterimi

2. **Note Tab**:

   - Yapılandırılmış not formatı:
     - **Subjektiv** (Subjective)
     - **Objektiv** (Objective)
     - **Beurteilung & Plan** (Assessment & Plan)
   - Düzenlenebilir alanlar
   - Temiz, okunabilir format

3. **Additional Tabs**:
   - Referral Response
   - Patient Message
   - Document Creation

### C. Medical Coding Integration

1. **ICD-10 Code Suggestions**:

   - "Relevant codes found" bölümü
   - AI ile otomatik kod önerileri
   - "+" butonu ile kod ekleme
   - Açıklayıcı metin: "Tandem presents codes relevant to what was discussed"

2. **Code Search**:
   - "Q Search codes" arama çubuğu
   - Manuel kod arama özelliği

### D. Template System

1. **Template Selection**:
   - Dropdown menü
   - Önceden tanımlı şablonlar
   - "Dokumentation P..." gibi isimler

### E. Onboarding & Setup

1. **Clinic Information Form**:

   - Clinic name
   - Clinic size (radio buttons):
     - Just me
     - 2-5
     - 5-20
     - 20-50
     - 50+
   - Medical record system (dropdown)
   - Phone number (country code selector ile)

2. **Data & Privacy**:
   - GDPR uyumluluk mesajı
   - Terms of Service checkbox
   - Data Processing Agreement checkbox
   - Trust center ve Privacy policy linkleri

### F. User Experience Features

1. **Progress Indicators**:

   - User guide'da progress bar
   - "X steps left" göstergesi

2. **Status Indicators**:

   - Renkli nokta sistemleri
   - Durum metinleri
   - Visual feedback

3. **Action Buttons**:

   - Primary actions (yeşil, siyah)
   - Secondary actions (gri)
   - Icon + text kombinasyonları

4. **Help & Support**:
   - Question mark ikonu (sağ alt köşe)
   - User guide

## 3. Tasarım Özellikleri

### Renk Paleti

- **Yeşil**: Primary actions, active states
- **Siyah**: Important actions (Finish, Copy)
- **Mavi**: Status indicators, links
- **Gri**: Secondary elements, backgrounds
- **Sarı-Yeşil**: Paused/Active states

### Typography

- Bold başlıklar
- Regular body text
- Küçük fontlar durum göstergeleri için
- İtalik metinler açıklamalar için

### Spacing & Layout

- Geniş, temiz alanlar
- Sol sidebar (dar)
- Ana içerik alanı (geniş)
- Alt toolbar (fixed)
- Üst bar (fixed)

### Visual Elements

- Gradient arka planlar (timer arkasında)
- Rounded corners
- Shadow effects
- Icon + text kombinasyonları
- Dropdown arrows
- Status dots

## 4. Önerilen Özellikler (Bizim Uygulamamız İçin)

### Yüksek Öncelik

1. **Sol Sidebar Navigation**

   - Home
   - Görüşme listesi (tarih gruplu)
   - User profile

2. **Tab-Based Interface**

   - Transcription tab
   - Note tab
   - Analysis tab (bizim mevcut analiz sonuçları)

3. **Timer Display**

   - Görüşme süresi gösterimi
   - Pause/Resume fonksiyonları

4. **Status Indicators**

   - Görüşme durumları
   - Renkli nokta sistemleri

5. **Template System**
   - Not şablonları
   - Dropdown seçimi

### Orta Öncelik

1. **Medical Coding** (ICD-10)

   - AI ile kod önerileri
   - Manuel kod arama

2. **Bottom Toolbar**

   - Template seçimi
   - Ek metin ekleme
   - Mikrofon ayarları
   - Finish/Copy butonları

3. **Onboarding Flow**
   - Clinic bilgileri
   - GDPR uyumluluk
   - Terms acceptance

### Düşük Öncelik

1. **User Guide**

   - Progress tracking
   - Step-by-step rehber

2. **Referral Response**

   - Hasta mesajlaşma
   - Document creation

3. **Trial/Subscription Banner**
   - Upgrade prompts

## 5. Farklılıklar (Bizim Mevcut Sistem)

### Bizde Var Olanlar

- ✅ Ses kaydı
- ✅ AI analiz
- ✅ Transkript görüntüleme
- ✅ Doktor notu yazma
- ✅ Chat formatında konuşma gösterimi
- ✅ Sol sidebar navigation
- ✅ Tab-based interface
- ✅ Timer display
- ✅ Status indicators (renkli noktalar)
- ✅ Modern layout sistemi

### Bizde Olmayanlar (Yüksek Öncelik)

- ❌ Patient name field
- ❌ Status management ("Not transferred" gibi)
- ❌ Anamnese section (Kontaktgrund, Aktueller Zustand)
- ❌ ICD-10 code integration
- ❌ Bottom toolbar
- ❌ Regenerate function
- ❌ Add or adjust button

### Bizde Olmayanlar (Orta Öncelik)

- ❌ Patient Message tab
- ❌ Referral tabs (Überweisungsgrund, Überweisungsantwort)
- ❌ Template system
- ❌ Microphone selector
- ❌ Signature & Date
- ❌ Inline editing

### Bizde Olmayanlar (Düşük Öncelik)

- ❌ Help button
- ❌ Three-dot menu
- ❌ Timestamp display
- ❌ Microphone info
- ❌ Create Document tab
- ❌ Onboarding flow
- ❌ User guide

## 6. Uygulama Önerileri

### Phase 1: Core Features (Tamamlandı ✅)

1. ✅ Sol sidebar ekle
2. ✅ Tab-based interface'e geç
3. ✅ Timer display ekle
4. ✅ Status indicators ekle

### Phase 2: Essential Features (Yapılacak)

1. Patient name field
2. Status management
3. Anamnese section
4. Bottom toolbar (temel)
5. Regenerate function
6. Add or adjust button

### Phase 3: Advanced Features

1. ICD-10 code integration
2. Patient Message tab
3. Referral tabs
4. Template system
5. Microphone selector
6. Signature & Date

### Phase 4: Polish

1. Help button
2. Three-dot menu
3. Timestamp display
4. Microphone info
5. Create Document tab
6. Onboarding flow
7. User guide

## Notlar

- Tasarım minimal ve temiz
- Doktor odaklı workflow
- Her özellik doktorun iş akışını kolaylaştırmak için
- Visual feedback önemli (status indicators, colors)
- Progressive disclosure (tabs, collapsible sections)
