require("@testing-library/jest-dom");

if (typeof globalThis.fetch === "undefined") {
  globalThis.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
}
