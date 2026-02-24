/**
 * AI API (RTK Query). Defines all AI endpoints as mutations: transcribe, identifySpeakers,
 * analyze, analyzeWithTemplate, regenerate, rewriteText, generateDocument.
 * Use the generated hooks (e.g. useTranscribeMutation) in components. Requests are logged to app slice.
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  TranscribeResponse,
  IdentifySpeakersRequest,
  IdentifySpeakersResponse,
  AnalyzeRequest,
  AnalyzeResponse,
  AnalyzeWithTemplateRequest,
  AnalyzeWithTemplateResponse,
  RegenerateRequest,
  RegenerateResponse,
  RewriteTextRequest,
  RewriteTextResponse,
  GenerateDocumentRequest,
  GenerateDocumentResponse,
} from "@/store/types/api";
import { logRequest, logRequestFulfilled, logRequestRejected } from "@/store/slices/ui/appSlice";

const rawBaseQuery = fetchBaseQuery({ baseUrl: "" });

const baseQueryWithLog = async (args: any, api: any, extraOptions: any) => {
  const url = typeof args === "string" ? args : args?.url ?? "";
  const method = (typeof args === "object" && args?.method) || "GET";
  const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  api.dispatch(logRequest({ method, url, id: requestId }));
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error) {
    const errMsg = typeof (result.error as any)?.data?.error === "string"
      ? (result.error as any).data.error
      : String((result.error as any)?.status ?? "Error");
    api.dispatch(logRequestRejected({ id: requestId, error: errMsg }));
  } else {
    api.dispatch(logRequestFulfilled({ id: requestId }));
  }
  return result;
};

export const aiApi = createApi({
  reducerPath: "aiApi",
  baseQuery: baseQueryWithLog,
  tagTypes: [],
  endpoints: (build) => ({
    // POST /api/ai/transcribe – ses dosyası → metin
    transcribe: build.mutation<TranscribeResponse, FormData>({
      query: (formData) => ({
        url: "/api/ai/transcribe",
        method: "POST",
        body: formData,
      }),
    }),

    // POST /api/ai/identify-speakers – transkript → konuşmacı etiketli liste
    identifySpeakers: build.mutation<
      IdentifySpeakersResponse,
      IdentifySpeakersRequest
    >({
      query: (body) => ({
        url: "/api/ai/identify-speakers",
        method: "POST",
        body,
      }),
    }),

    // POST /api/ai/analyze – transkript → özet analiz
    analyze: build.mutation<AnalyzeResponse, AnalyzeRequest>({
      query: (body) => ({
        url: "/api/ai/analyze",
        method: "POST",
        body,
      }),
    }),

    // POST /api/ai/analyze-with-template – transkript + şablon → SOAP notu
    analyzeWithTemplate: build.mutation<
      AnalyzeWithTemplateResponse,
      AnalyzeWithTemplateRequest
    >({
      query: (body) => ({
        url: "/api/ai/analyze-with-template",
        method: "POST",
        body,
      }),
    }),

    // POST /api/ai/regenerate – metin/doküman yeniden yazım
    regenerate: build.mutation<RegenerateResponse, RegenerateRequest>({
      query: (body) => ({
        url: "/api/ai/regenerate",
        method: "POST",
        body,
      }),
    }),

    // POST /api/ai/rewrite-text – metin stil dönüşümü
    rewriteText: build.mutation<RewriteTextResponse, RewriteTextRequest>({
      query: (body) => ({
        url: "/api/ai/rewrite-text",
        method: "POST",
        body,
      }),
    }),

    // POST /api/ai/generate-document – hasta mesajı / sevk nedeni / sevk yanıtı
    generateDocument: build.mutation<
      GenerateDocumentResponse,
      GenerateDocumentRequest
    >({
      query: (body) => ({
        url: "/api/ai/generate-document",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useTranscribeMutation,
  useIdentifySpeakersMutation,
  useAnalyzeMutation,
  useAnalyzeWithTemplateMutation,
  useRegenerateMutation,
  useRewriteTextMutation,
  useGenerateDocumentMutation,
} = aiApi;
