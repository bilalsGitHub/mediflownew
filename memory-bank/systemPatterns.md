# Sistem Mimarisi ve Desenler

## Genel Mimari

```
┌─────────────────┐
│   Next.js App   │  (Frontend + API Routes)
│   (App Router)  │
└────────┬────────┘
         │
         ├─── Authentication ───> Supabase Auth
         ├─── Database ─────────> Supabase PostgreSQL
         ├─── Storage ──────────> Supabase Storage (Ses dosyaları)
         └─── AI Services ─────> OpenAI API (Speech-to-Text + Analysis)
```

## Teknik Kararlar

### Frontend Mimarisi
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Context API (başlangıç için yeterli)
- **Form Handling**: React Hook Form (gerekirse)

### Backend Mimarisi
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (ses kayıtları)
- **API**: Next.js API Routes
- **AI Integration**: OpenAI API

### AI Servisleri
- **Speech-to-Text**: OpenAI Whisper API
- **Text Analysis**: OpenAI GPT-4 (veya uygun model)
- **System Prompts**: `agents.md` dosyasında tanımlı

## Veri Modeli

### Ana Tablolar

#### `users` (Supabase Auth ile entegre)
- `id` (UUID, primary key)
- `email`
- `full_name`
- `role` (doctor)
- `created_at`

#### `consultations`
- `id` (UUID, primary key)
- `doctor_id` (FK → users.id)
- `patient_name` (opsiyonel, gizlilik için) - **Görüntülerde başlık olarak gösteriliyor**
- `recording_url` (Supabase Storage path)
- `transcript` (ham metin)
- `conversation` (JSON: doktor/hasta konuşma ayrımı)
- `analysis` (JSON: şikayet, semptomlar, vs.)
- `doctor_notes` (düzenlenmiş final notlar)
- `anamnese` (JSON: kontaktgrund, aktueller_zustand) - **YENİ**
- `icd10_codes` (JSON array: kod listesi) - **YENİ**
- `referral_reason` (JSON: datum, diagnose, erbetene_massnahme, anamnese_und_befunde) - **YENİ**
- `referral_answer` (TEXT) - **YENİ**
- `patient_message` (TEXT) - **YENİ**
- `signature` (JSON: doctor_name, clinic_name, date) - **YENİ**
- `status` (draft, approved, rejected, not_transferred, transferred) - **GÜNCELLENDİ**
- `created_at`
- `updated_at`

#### `consultation_history` (opsiyonel, audit için)
- `id`
- `consultation_id`
- `action` (created, edited, approved, rejected)
- `changes` (JSON)
- `timestamp`

## Kritik İmplementasyon Yolları

### 1. Ses Kaydı Akışı
```
Browser MediaRecorder API
  ↓
Blob → Supabase Storage
  ↓
Storage URL → API Route
  ↓
OpenAI Whisper API (Speech-to-Text)
  ↓
Transcript → Database
```

### 2. AI Analiz Akışı
```
Transcript (Database)
  ↓
API Route → OpenAI GPT API
  ↓
System Prompt (agents.md'den)
  ↓
Structured Analysis (JSON)
  ↓
Database Update
  ↓
Frontend Display
```

### 3. Doktor Onay Akışı
```
Doktor düzenleme yapar
  ↓
Form validation
  ↓
API Route → Database Update
  ↓
Status: approved
  ↓
Final notes kaydedilir
```

## Güvenlik Desenleri

1. **Authentication**: Supabase Auth ile JWT tabanlı
2. **Authorization**: Row Level Security (RLS) policies
3. **Data Encryption**: Supabase otomatik şifreleme
4. **API Security**: Server-side validation, rate limiting
5. **Storage Security**: Private buckets, signed URLs

## Performans Desenleri

1. **Ses Dosyaları**: Streaming upload, compression
2. **AI Analiz**: Async processing, loading states
3. **Database**: Indexing, pagination
4. **Caching**: React Query veya SWR (gelecekte)

## Bileşen Yapısı

```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── (dashboard)/
│   ├── dashboard/
│   ├── new-consultation/
│   └── consultations/
├── api/
│   ├── auth/
│   ├── consultations/
│   └── ai/
│       ├── transcribe/
│       ├── analyze/
│       ├── identify-speakers/
│       └── rewrite-text/
└── components/
    ├── layout/
    │   ├── Sidebar.tsx
    │   ├── TopBar.tsx
    │   └── MainLayout.tsx
    ├── RecordingButton.tsx
    ├── AnalysisDisplay.tsx
    ├── TranscriptDisplay.tsx
    ├── DoctorNoteCreator.tsx
    ├── Timer.tsx
    ├── Tabs.tsx
    └── ui/ (shadcn/ui veya custom)
```

## Design Patterns

1. **Component Composition**: Küçük, yeniden kullanılabilir bileşenler
2. **API Route Pattern**: Server actions yerine API routes (başlangıç için)
3. **Error Boundaries**: Hata yönetimi için React error boundaries
4. **Loading States**: Skeleton loaders, progress indicators
5. **Optimistic Updates**: UI hızlı geri bildirim için

## Entegrasyon Noktaları

1. **Supabase Client**: Singleton pattern, environment-based config
2. **OpenAI Client**: API route'larda kullanım, key management
3. **MediaRecorder**: Browser API, fallback handling
4. **File Upload**: Chunked upload for large files

