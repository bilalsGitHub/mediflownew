# Test Kılavuzu

Projede Jest ve React Testing Library ile unit/entegrasyon testleri çalıştırılır.

## Komutlar

```bash
npm run test           # Tüm testleri bir kez çalıştır
npm run test:watch     # Watch modunda çalıştır (dosya değişince tekrar çalışır)
npm run test:coverage  # Coverage raporu üretir (coverage/ klasörü)
```

## Klasör yapısı

- **`tests/unit/`** – Unit testler (slice’lar, pure functions, bileşenler)
  - `tests/unit/store/slices/` – Redux slice testleri
  - `tests/unit/components/` – Bileşen testleri (ui, consultation, vb.)
- **`tests/utils/test-utils.tsx`** – Ortak `render` (Redux Provider, mock’lar)
- **`jest.config.js`** – Jest ayarları (Next.js `next/jest` kullanır)
- **`jest.setup.js`** – `@testing-library/jest-dom` vb. global setup

Test dosyaları `*.test.ts` veya `*.test.tsx` olmalı ve `tests/**` veya `__tests__/**` altında olmalı.

## Yeni feature eklerken test yazma

1. **Redux slice** – `store/slices/xyzSlice.ts` için `tests/unit/store/slices/xyzSlice.test.ts` aç. Reducer action’larını ve selector’ları test et.
2. **Bileşen** – `components/.../X.tsx` için `tests/unit/components/.../X.test.tsx` aç. Gerekirse `@/lib/LanguageContext` veya `useAuth` gibi bağımlılıkları `jest.mock('@/lib/...')` ile mock’la.
3. **API / thunk** – RTK Query veya async thunk kullanıyorsan, `store/api` veya thunk’ı mock’layıp sadece dispatch ve state’i test et.

## Örnek: Slice testi

```ts
import myReducer, { setX, selectX } from "@/store/slices/mySlice";

describe("mySlice", () => {
  it("setX updates state", () => {
    const state = myReducer(undefined, setX(1));
    expect(state.x).toBe(1);
  });
  it("selectX returns x", () => {
    expect(selectX({ my: { x: 1 } })).toBe(1);
  });
});
```

## Örnek: Bileşen testi (mock ile)

```tsx
jest.mock("@/lib/LanguageContext", () => ({
  useLanguage: () => ({ t: (k: string) => k, language: "de" }),
}));

import { render, screen } from "@/tests/utils/test-utils";
import MyComponent from "@/components/.../MyComponent";

it("renders title", () => {
  render(<MyComponent title="Hello" />);
  expect(screen.getByText("Hello")).toBeInTheDocument();
});
```

## Mock’lar

- **LanguageContext** – `t: (key) => key` genelde yeterli.
- **AuthContext / useAuth** – `jest.mock("@/lib/AuthContext", () => ({ useAuth: () => ({ user: null, login: jest.fn(), ... }) }))`.
- **Router** – `next/navigation` için `jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn(), ... }) }))`.

Coverage hedefi: Yeni eklenen slice ve kritik bileşenler için test yazmak; `npm run test:coverage` ile eksik alanları görebilirsin.
