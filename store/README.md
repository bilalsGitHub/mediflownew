# Redux Store & API

Tüm API istekleri tek yerde tanımlı; state Redux ile yönetiliyor.

## API endpoint’leri (tek referans)

| Method | Endpoint | Hook | Açıklama |
|--------|----------|------|----------|
| POST | `/api/ai/transcribe` | `useTranscribeMutation()` | Ses → metin |
| POST | `/api/ai/identify-speakers` | `useIdentifySpeakersMutation()` | Transkript → konuşmacı etiketleri |
| POST | `/api/ai/analyze` | `useAnalyzeMutation()` | Transkript → özet analiz |
| POST | `/api/ai/analyze-with-template` | `useAnalyzeWithTemplateMutation()` | Transkript + şablon → SOAP notu |
| POST | `/api/ai/regenerate` | `useRegenerateMutation()` | Metin/doküman yeniden yazım |
| POST | `/api/ai/rewrite-text` | `useRewriteTextMutation()` | Metin stil dönüşümü |
| POST | `/api/ai/generate-document` | `useGenerateDocumentMutation()` | Hasta mesajı / sevk nedeni / sevk yanıtı |

- İstek/cevap tipleri: `store/types/api.ts`
- Endpoint tanımları: `store/api/aiApi.ts`
- Dashboard’daki **API İstekleri** paneli son istekleri listeler.

## Kullanım örneği

```tsx
import { useTranscribeMutation } from "@/store/api/aiApi";

const [transcribe, { isLoading, error }] = useTranscribeMutation();

const formData = new FormData();
formData.append("audio", blob, "recording.webm");
formData.append("language", "de");

const result = await transcribe(formData).unwrap();
console.log(result.transcript);
```

## Slice’lar (veri türleri)

| Slice | State | Kullanım |
|-------|--------|----------|
| **auth** | user, isLoading, loginError, registerError, isLoggingIn, isRegistering | Login / logout, kullanıcı oturumu |
| **userData** | profile, preferences, lastLoadedAt | Profil, dil/tema tercihleri |
| **consultations** | list, selectedId, lastFetchedAt, isLoading, error | Görüşme listesi ve seçili görüşme |
| **appointments** | list, lastFetchedAt, isLoading, error | Randevu listesi |
| **ui** | sidebarOpen, activeModal | Sidebar / modal açık kapalı |
| **app** | apiLog | API istek log’u |

Selector’lar: `store/selectors/index.ts` (örn. `selectUser`, `selectConsultationsList`).

## Klasör yapısı

```
store/
├── index.ts              # configureStore, RootState, AppDispatch
├── hooks.ts               # useAppDispatch, useAppSelector
├── types/
│   ├── api.ts            # API request/response tipleri
│   └── auth.ts           # User, Profile, RegisterData
├── api/
│   └── aiApi.ts          # RTK Query – tüm AI endpoint’leri
├── selectors/
│   └── index.ts          # Tüm slice selector’ları
└── slices/
    ├── auth/
    │   └── authSlice.ts  # Login, kullanıcı oturumu
    ├── data/
    │   ├── userDataSlice.ts      # Profil, tercihler
    │   ├── consultationsSlice.ts # Görüşmeler
    │   └── appointmentsSlice.ts  # Randevular
    └── ui/
        ├── uiSlice.ts    # Sidebar, modal
        └── appSlice.ts   # API istek log’u
```
