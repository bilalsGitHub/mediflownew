# Özellik Karşılaştırması

Tandem benzeri özellikler ile mevcut sistemimizin karşılaştırması.

## Mevcut Özelliklerimiz ✅

### Ses ve AI
- ✅ Ses kaydı (MediaRecorder API)
- ✅ Speech-to-Text (OpenAI Whisper)
- ✅ AI analiz (GPT-4o-mini)
- ✅ Doktor/hasta konuşma ayrımı
- ✅ Chat formatında transkript görüntüleme

### UI/UX
- ✅ Sol sidebar navigation
- ✅ Tab-based interface (Transcription, Analysis, Notes)
- ✅ Timer display
- ✅ Status indicators
- ✅ Modern, temiz tasarım

### Not Yönetimi
- ✅ Doktor notu yazma (ses kaydı ile)
- ✅ AI ile not düzenleme (6 farklı stil)
- ✅ Not kopyalama
- ✅ Not kaydetme

## Eksik Özelliklerimiz ❌

### Yüksek Öncelik
1. ❌ **Patient Name Field**
   - Görüşme başlığı olarak hasta adı
   - Düzenlenebilir alan

2. ❌ **Status Management**
   - "Not transferred" badge
   - Status değiştirme
   - Renkli nokta sistemleri

3. ❌ **Anamnese Section**
   - Kontaktgrund (Contact reason)
   - Aktueller Zustand (Current condition)
   - Note tab'ında yapılandırılmış bölüm

4. ❌ **ICD-10 Code Integration**
   - Code addition section
   - Code search
   - Relevant codes found (AI önerileri)
   - Kod ekleme/çıkarma

5. ❌ **Bottom Toolbar**
   - Template selector
   - Regenerate butonu
   - Add or adjust butonu
   - Copy note butonu
   - Microphone selector

6. ❌ **Regenerate Function**
   - AI ile metin yeniden oluşturma
   - Mevcut metni iyileştirme

7. ❌ **Add or Adjust Button**
   - Ses kaydı ile metin ekleme/düzenleme
   - Mevcut metne ekleme

### Orta Öncelik
1. ❌ **Patient Message Tab**
   - Hasta mesajı yazma
   - Message editor
   - Preview alanı

2. ❌ **Referral Tabs**
   - Überweisungsgrund (Referral reason)
   - Überweisungsantwort (Referral answer)
   - Form fields
   - Signature & date

3. ❌ **Template System**
   - Önceden tanımlı şablonlar
   - Dropdown seçimi
   - Şablon yükleme

4. ❌ **Microphone Selector**
   - Mikrofon listesi
   - Dropdown seçimi
   - Mikrofon bilgisi

5. ❌ **Signature & Date**
   - Otomatik imza ekleme
   - Tarih ekleme
   - Klinik adı

6. ❌ **Inline Editing**
   - Text area içinde mikrofon ikonu
   - Text area içinde copy butonu
   - Edit/delete ikonları

### Düşük Öncelik
1. ❌ **Help Button**
   - Sağ alt köşe
   - Yardım ve destek

2. ❌ **Three-dot Menu**
   - Görüşme ayarları
   - Ek seçenekler

3. ❌ **Timestamp Display**
   - Transkript'te zaman gösterimi

4. ❌ **Microphone Info**
   - Kullanılan mikrofon bilgisi

5. ❌ **Create Document Tab**
   - Doküman oluşturma

## Özellik Detayları

### Patient Name Field
**Neden Önemli**: Görüşmeleri hızlıca tanımlamak için
**Uygulama**: 
- Görüşme header'ında, büyük font
- Düzenlenebilir input field
- LocalStorage'da saklanır

### Status Management
**Neden Önemli**: Görüşme durumunu netleştirmek için
**Uygulama**:
- Badge gösterimi (mavi nokta + metin)
- Status dropdown menü
- Renk kodlaması

### Anamnese Section
**Neden Önemli**: Yapılandırılmış bilgi toplama
**Uygulama**:
- Note tab'ında ayrı bölüm
- İki alan: Kontaktgrund, Aktueller Zustand
- AI analiz sonuçlarından otomatik doldurma

### ICD-10 Code Integration
**Neden Önemli**: Tıbbi kodlama standartları
**Uygulama**:
- AI ile otomatik kod önerileri
- Manuel kod arama
- Kod listesi görüntüleme
- Kod ekleme/çıkarma

### Bottom Toolbar
**Neden Önemli**: Hızlı erişim ve işlemler
**Uygulama**:
- Fixed position (alt kısımda)
- Template selector (sol)
- Action butonları (sağ)
- Responsive tasarım

### Regenerate Function
**Neden Önemli**: AI ile metin iyileştirme
**Uygulama**:
- Mevcut metni AI'ya gönder
- Yeni versiyon oluştur
- Kullanıcıya göster, onaylat
- API endpoint: `/api/ai/regenerate`

## Uygulama Öncelikleri

### Sprint 1 (İlk 2 Hafta)
1. Patient name field
2. Status management
3. Anamnese section
4. Bottom toolbar (temel)

### Sprint 2 (Sonraki 2 Hafta)
1. ICD-10 code integration
2. Regenerate function
3. Add or adjust button
4. Template system

### Sprint 3 (Sonraki 2 Hafta)
1. Patient Message tab
2. Referral tabs
3. Signature & Date
4. Microphone selector

### Sprint 4 (Polish)
1. Help button
2. Three-dot menu
3. Timestamp display
4. Microphone info
5. Create Document tab

## Notlar

- Tüm özellikler doktor iş akışını kolaylaştırmak için
- AI entegrasyonu önemli (kod önerileri, regenerate)
- Template sistemi zaman kazandırır
- Status management workflow'u netleştirir
- Bottom toolbar hızlı erişim sağlar

