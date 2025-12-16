# Teknik Bağlam

## Teknoloji Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components (minimal, sade tasarım)
- **Icons**: Lucide React veya Heroicons

### Backend & Infrastructure
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **API**: Next.js API Routes
- **AI Services**: OpenAI API
  - Whisper (Speech-to-Text)
  - GPT-4 veya GPT-4o-mini (Text Analysis)

### Development Tools
- **Package Manager**: npm veya pnpm
- **Version Control**: Git
- **Environment Variables**: `.env.local`

## Geliştirme Kurulumu

### Gereksinimler
- Node.js 18+ 
- npm/pnpm
- Supabase hesabı
- OpenAI API key

### Kurulum Adımları
```bash
# Proje oluşturma
npx create-next-app@latest . --typescript --tailwind --app

# Bağımlılıklar
npm install @supabase/supabase-js @supabase/ssr
npm install openai
npm install lucide-react

# Environment variables
# .env.local dosyası oluştur
```

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Teknik Kısıtlamalar

### Browser API
- **MediaRecorder API**: Modern browser desteği gerekli
- **Microphone Permission**: Kullanıcı izni gerekli
- **File Size Limits**: Büyük ses dosyaları için chunked upload

### API Limits
- **OpenAI API**: Rate limits ve token limits
- **Supabase**: Storage quotas, database limits
- **Cost Management**: API kullanımını optimize etmek önemli

### Güvenlik Kısıtlamaları
- **HTTPS**: Production'da zorunlu (microphone API için)
- **CORS**: Supabase CORS ayarları
- **API Keys**: Server-side only, never expose

## Bağımlılıklar

### Core Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/ssr": "^0.0.10",
    "openai": "^4.0.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31"
  }
}
```

## Tool Kullanım Desenleri

### Supabase Client
```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### OpenAI Client
```typescript
// lib/openai/client.ts
import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
```

### API Route Pattern
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Server-side logic
}
```

## Development Workflow

1. **Local Development**
   - `npm run dev` - Development server
   - Hot reload aktif
   - Environment variables `.env.local`'dan

2. **Database Management**
   - Supabase Dashboard kullanımı
   - Migration scripts (gelecekte)
   - Local Supabase (opsiyonel)

3. **Testing** (Gelecek)
   - Unit tests: Jest/Vitest
   - Integration tests: Playwright
   - E2E tests: Playwright

## Deployment

### Production Environment
- **Hosting**: Vercel (Next.js için optimize)
- **Database**: Supabase Cloud
- **Storage**: Supabase Storage
- **Environment**: Production environment variables

### Build Process
```bash
npm run build
npm run start
```

## Performance Considerations

1. **Ses Dosyaları**
   - Compression: WebM format
   - Chunked upload
   - Progress tracking

2. **AI Processing**
   - Async processing
   - Loading states
   - Error handling

3. **Database Queries**
   - Indexing
   - Pagination
   - Query optimization

## Monitoring & Logging

- **Error Tracking**: Sentry (gelecekte)
- **Analytics**: Vercel Analytics (opsiyonel)
- **Logging**: Console logging + structured logs (gelecekte)

