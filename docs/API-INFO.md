# API Bilgileri

## Ses Kaydı ve Transkript API'ları

### 1. Ses Kaydı (Browser API)

**Kullanılan**: `MediaRecorder API` (Tarayıcı native API)

- **Konum**: `components/RecordingButton.tsx`
- **Format**: `audio/webm;codecs=opus`
- **Nasıl Çalışır**:
  - Kullanıcı mikrofon izni verir
  - MediaRecorder API ile ses kaydı başlar
  - Ses verisi Blob olarak toplanır
  - Kayıt durduğunda WebM formatında Blob oluşturulur

### 2. Transkript (OpenAI Whisper API)

**Kullanılan**: `OpenAI Whisper API`

- **Konum**: `app/api/ai/transcribe/route.ts`
- **Model**: `whisper-1`
- **Dil**: Türkçe (`tr`)
- **Format Desteği**: mp3, mp4, mpeg, mpga, m4a, wav, webm
- **Nasıl Çalışır**:
  1. Frontend'den WebM formatında ses dosyası gönderilir
  2. API route'da OpenAI Whisper API'ye gönderilir
  3. Whisper ses dosyasını metne dönüştürür
  4. Transkript (metin) döndürülür

### 3. Metin Analizi (OpenAI GPT API)

**Kullanılan**: `OpenAI GPT-4o-mini`

- **Konum**: `app/api/ai/analyze/route.ts`
- **Model**: `gpt-4o-mini`
- **Nasıl Çalışır**:
  1. Transkript (metin) alınır
  2. GPT modeline system prompt ile gönderilir
  3. Yapılandırılmış JSON çıktı döner:
     - Hasta şikayeti
     - Semptomlar
     - Süre/sıklık
     - Ön özet
     - Doktor notu taslağı

## Sorun Giderme

### "Transkript oluşturulamadı" Hatası

**Olası Nedenler:**

1. **OpenAI API Key Eksik/Yanlış**

   - `.env.local` dosyasında `OPENAI_API_KEY` kontrol edin
   - API key'in geçerli olduğundan emin olun

2. **Ses Dosyası Formatı**

   - WebM formatı destekleniyor ama bazen sorun olabilir
   - Tarayıcı konsolunda hata mesajlarını kontrol edin

3. **API Rate Limit**

   - Çok fazla istek gönderildiyse rate limit aşılabilir
   - Birkaç saniye bekleyip tekrar deneyin

4. **Ses Dosyası Boş/Çok Kısa**
   - Kayıt süresinin yeterli olduğundan emin olun
   - Mikrofonun çalıştığını kontrol edin

### Test Etme

1. Tarayıcı konsolunu açın (F12)
2. Network sekmesinde `/api/ai/transcribe` isteğini kontrol edin
3. Response'da hata mesajını okuyun
4. Server console'da (terminal) log mesajlarını kontrol edin

## Gereksinimler

- OpenAI API key (ücretli)
- Modern tarayıcı (Chrome, Firefox, Edge - MediaRecorder desteği)
- HTTPS veya localhost (mikrofon erişimi için)
