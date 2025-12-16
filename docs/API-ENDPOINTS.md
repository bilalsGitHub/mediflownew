# API Endpoint'leri ve İstek Akışı

Bu dokümantasyon, uygulamadaki tüm API endpoint'lerini ve isteklerin nasıl yapıldığını açıklar.

## 📁 API Route Yapısı

Tüm API endpoint'leri Next.js App Router yapısına göre `app/api/` klasöründe tanımlanmıştır:

```
app/api/
└── ai/
    ├── transcribe/route.ts          # Ses → Metin (Whisper)
    ├── analyze/route.ts             # Transkript Analizi (GPT)
    ├── analyze-with-template/route.ts # Template ile Analiz
    ├── identify-speakers/route.ts   # Konuşmacı Tanıma
    ├── generate-document/route.ts   # Doküman Oluşturma
    ├── regenerate/route.ts          # Doküman Yeniden Oluşturma
    └── rewrite-text/route.ts        # Metin Yeniden Yazma
```

---

## 🔵 1. Supabase Database İstekleri

### Konum: `lib/storage.ts`

Supabase, PostgreSQL veritabanı için REST API kullanır. Tüm database işlemleri `lib/storage.ts` dosyasında yapılır.

### İstek Yapısı:

```typescript
import { supabase } from '@/lib/supabase/client';

// Örnek: Consultation getirme
const { data, error } = await supabase
  .from("consultations")
  .select(`
    *,
    icd10_codes (code, description),
    documents (id, type, content, title, created_at, updated_at)
  `)
  .eq("doctor_id", user.id)
  .order("created_at", { ascending: false });
```

### Supabase Client Konfigürasyonu:

**Dosya:** `lib/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase İstek Örnekleri:

#### 1. **Consultation Listesi Getirme**
```typescript
// lib/storage.ts - getAll()
const { data, error } = await supabase
  .from("consultations")
  .select(`*, icd10_codes(*), documents(*)`)
  .eq("doctor_id", user.id)
  .order("created_at", { ascending: false });
```

**Endpoint:** `GET https://[project].supabase.co/rest/v1/consultations?select=*%2Cicd10_codes%28*%29%2Cdocuments%28*%29&doctor_id=eq.[user_id]&order=created_at.desc`

#### 2. **Tek Consultation Getirme**
```typescript
// lib/storage.ts - get(id)
const { data, error } = await supabase
  .from("consultations")
  .select(`*, icd10_codes(*), documents(*)`)
  .eq("id", id)
  .eq("doctor_id", user.id)
  .single();
```

**Endpoint:** `GET https://[project].supabase.co/rest/v1/consultations?select=*%2Cicd10_codes%28*%29%2Cdocuments%28*%29&id=eq.[id]&doctor_id=eq.[user_id]`

#### 3. **Consultation Kaydetme**
```typescript
// lib/storage.ts - save(consultation)
const { data, error } = await supabase
  .from("consultations")
  .upsert({ ...consultationData, doctor_id: user.id })
  .select()
  .single();
```

**Endpoint:** `POST https://[project].supabase.co/rest/v1/consultations` (upsert)

#### 4. **Consultation Silme**
```typescript
// lib/storage.ts - delete(id)
const { error } = await supabase
  .from("consultations")
  .delete()
  .eq("id", id)
  .eq("doctor_id", user.id);
```

**Endpoint:** `DELETE https://[project].supabase.co/rest/v1/consultations?id=eq.[id]&doctor_id=eq.[user_id]`

---

## 🤖 2. AI API Endpoint'leri

Tüm AI işlemleri Next.js API Route'ları üzerinden yapılır. Bu route'lar server-side çalışır ve OpenAI API'ye istek gönderir.

### 2.1. Ses Transkripti (Whisper)

**Endpoint:** `POST /api/ai/transcribe`

**Dosya:** `app/api/ai/transcribe/route.ts`

**Kullanım:**
```typescript
const formData = new FormData();
formData.append("audio", blob, "recording.webm");
formData.append("language", "de"); // veya "en", "tr"

const response = await fetch("/api/ai/transcribe", {
  method: "POST",
  body: formData,
});

const { transcript } = await response.json();
```

**İstek Akışı:**
1. Frontend → `POST /api/ai/transcribe` (FormData ile ses dosyası)
2. API Route → OpenAI Whisper API'ye gönderir
3. OpenAI → Transkript metni döner
4. API Route → Frontend'e JSON olarak döner

**OpenAI API İsteği:**
```typescript
// API Route içinde
const transcription = await openai.audio.transcriptions.create({
  file: audioFile,
  model: "whisper-1",
  language: "de", // veya "en", "tr"
});
```

**Kullanıldığı Yerler:**
- `app/new-consultation/page.tsx` - Yeni görüşme kaydı

---

### 2.2. Transkript Analizi

**Endpoint:** `POST /api/ai/analyze`

**Dosya:** `app/api/ai/analyze/route.ts`

**Kullanım:**
```typescript
const response = await fetch("/api/ai/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    transcript: "Hasta şikayeti...",
    language: "de"
  }),
});

const { analysis } = await response.json();
// analysis: {
//   patient_complaint: "...",
//   symptoms: [...],
//   duration_frequency: "...",
//   preliminary_summary: "...",
//   doctor_notes_draft: "..."
// }
```

**OpenAI API İsteği:**
```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  temperature: 0.3,
  max_tokens: 1000,
  response_format: { type: 'json_object' },
});
```

**Kullanıldığı Yerler:**
- `app/new-consultation/page.tsx` - Yeni görüşme analizi

---

### 2.3. Template ile Analiz

**Endpoint:** `POST /api/ai/analyze-with-template`

**Dosya:** `app/api/ai/analyze-with-template/route.ts`

**Kullanım:**
```typescript
const response = await fetch("/api/ai/analyze-with-template", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    transcript: "...",
    template: "dokumentation", // veya "kurzdokumentation"
    language: "de"
  }),
});
```

**Kullanıldığı Yerler:**
- `app/consultation/[id]/page.tsx` - Template değiştiğinde yeniden analiz

---

### 2.4. Konuşmacı Tanıma

**Endpoint:** `POST /api/ai/identify-speakers`

**Dosya:** `app/api/ai/identify-speakers/route.ts`

**Kullanım:**
```typescript
const response = await fetch("/api/ai/identify-speakers", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    transcript: "Doktor: ... Hasta: ..."
  }),
});

const { conversation } = await response.json();
// conversation: [
//   { speaker: "Doktor", text: "..." },
//   { speaker: "Hasta", text: "..." }
// ]
```

**Kullanıldığı Yerler:**
- `app/consultation/[id]/page.tsx` - Conversation yoksa otomatik oluşturma

---

### 2.5. Doküman Oluşturma

**Endpoint:** `POST /api/ai/generate-document`

**Dosya:** `app/api/ai/generate-document/route.ts`

**Kullanım:**
```typescript
const response = await fetch("/api/ai/generate-document", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    documentType: "patientMessage", // veya "referralReason", "referralResponse"
    consultationData: consultation,
    doctorInstructions: "...", // opsiyonel
    language: "de"
  }),
});

const { document } = await response.json();
```

**Kullanıldığı Yerler:**
- `components/DocumentGenerator.tsx` - Doküman oluşturma butonu

---

### 2.6. Doküman Yeniden Oluşturma

**Endpoint:** `POST /api/ai/regenerate`

**Dosya:** `app/api/ai/regenerate/route.ts`

**Kullanım:**
```typescript
const response = await fetch("/api/ai/regenerate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    documentType: "patientMessage",
    consultationData: consultation,
    currentDocument: existingDocument,
    language: "de"
  }),
});
```

**Kullanıldığı Yerler:**
- `app/consultation/[id]/page.tsx` - Doküman yeniden oluşturma butonu

---

### 2.7. Metin Yeniden Yazma

**Endpoint:** `POST /api/ai/rewrite-text`

**Dosya:** `app/api/ai/rewrite-text/route.ts`

**Kullanım:**
```typescript
const response = await fetch("/api/ai/rewrite-text", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: "Mevcut metin...",
    instructions: "Daha profesyonel yaz",
    language: "de"
  }),
});

const { rewrittenText } = await response.json();
```

---

## 🔐 3. Authentication İstekleri

**Konum:** `lib/AuthContext.tsx`

Supabase Auth kullanılır:

```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Register
const { data, error } = await supabase.auth.signUp({
  email,
  password,
});

// Logout
await supabase.auth.signOut();

// Get User
const { data: { user } } = await supabase.auth.getUser();
```

**Endpoint'ler:**
- `POST https://[project].supabase.co/auth/v1/token?grant_type=password` (Login)
- `POST https://[project].supabase.co/auth/v1/signup` (Register)
- `POST https://[project].supabase.co/auth/v1/logout` (Logout)

---

## 📊 4. İstek Akış Diyagramı

### Yeni Görüşme Oluşturma:

```
1. Frontend (new-consultation/page.tsx)
   ↓
2. POST /api/ai/transcribe (Ses → Metin)
   ↓ OpenAI Whisper API
   ↓
3. POST /api/ai/analyze (Metin → Analiz)
   ↓ OpenAI GPT-4o-mini
   ↓
4. storage.save() → Supabase
   ↓ POST /rest/v1/consultations
   ↓
5. Redirect to /consultation/[id]
```

### Consultation Görüntüleme:

```
1. Frontend (consultation/[id]/page.tsx)
   ↓
2. storage.get(id) → Supabase
   ↓ GET /rest/v1/consultations?id=eq.[id]
   ↓
3. Eğer conversation yoksa:
   ↓
4. POST /api/ai/identify-speakers
   ↓ OpenAI GPT-4o-mini
   ↓
5. storage.save() → Supabase (conversation kaydet)
```

### Doküman Oluşturma:

```
1. Frontend (DocumentGenerator.tsx)
   ↓
2. POST /api/ai/generate-document
   ↓ OpenAI GPT-4o-mini
   ↓
3. Frontend'de göster
   ↓
4. Kullanıcı kaydedince:
   ↓ storage.save() → Supabase
   ↓ POST /rest/v1/documents
```

---

## 🔑 5. Environment Variables

Tüm API key'ler `.env.local` dosyasında:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=sk-...
```

---

## 📝 6. Önemli Notlar

1. **Supabase İstekleri:**
   - Tüm database işlemleri `lib/storage.ts` üzerinden yapılır
   - Nested select kullanarak tek istekte tüm ilişkili veriler çekilir
   - RLS (Row Level Security) politikaları aktif

2. **AI İstekleri:**
   - Tüm AI işlemleri server-side yapılır (API Route'lar)
   - OpenAI API key server-side'da saklanır (güvenlik)
   - Rate limiting ve error handling mevcut

3. **İstek Optimizasyonu:**
   - Nested select ile N+1 query problemi çözüldü
   - Memoization ile gereksiz API çağrıları önlendi
   - Layout yapısı ile Sidebar sabit kalıyor

---

## 🐛 7. Debug İpuçları

### Console'da İstekleri Görmek:

1. **Browser DevTools → Network Tab:**
   - Supabase istekleri: `rest/v1/` ile başlar
   - API Route istekleri: `/api/ai/` ile başlar

2. **Supabase Dashboard:**
   - Logs → API Logs: Tüm database isteklerini görebilirsiniz

3. **Next.js Terminal:**
   - API Route'lardaki `console.log` çıktıları terminal'de görünür

---

## 📚 İlgili Dosyalar

- `lib/storage.ts` - Supabase database işlemleri
- `lib/supabase/client.ts` - Supabase client konfigürasyonu
- `lib/openai/client.ts` - OpenAI client konfigürasyonu
- `app/api/ai/*/route.ts` - Tüm AI API route'ları
- `app/consultation/[id]/page.tsx` - Consultation detay sayfası
- `app/new-consultation/page.tsx` - Yeni görüşme sayfası

