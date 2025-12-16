import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai/client";

export async function POST(request: NextRequest) {
  try {
    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing");
      return NextResponse.json(
        {
          error:
            "OpenAI API key yapılandırılmamış. Lütfen .env.local dosyasına OPENAI_API_KEY ekleyin.",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const language = (formData.get("language") as string) || "de"; // Default to German

    if (!audioFile) {
      return NextResponse.json(
        { error: "Ses dosyası bulunamadı" },
        { status: 400 }
      );
    }

    // Check file size (OpenAI has a 25MB limit)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ses dosyası çok büyük (maksimum 25MB)" },
        { status: 400 }
      );
    }

    // Check if file is empty
    if (audioFile.size === 0) {
      return NextResponse.json({ error: "Ses dosyası boş" }, { status: 400 });
    }

    console.log("Audio file received:", {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
    });

    // OpenAI Whisper supports: mp3, mp4, mpeg, mpga, m4a, wav, webm
    // Convert Blob to File object that OpenAI expects
    // Read the blob as ArrayBuffer first
    const arrayBuffer = await audioFile.arrayBuffer();
    const file = new File([arrayBuffer], audioFile.name || "recording.webm", {
      type: audioFile.type || "audio/webm",
    });

    console.log("Sending to OpenAI Whisper...", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      originalSize: audioFile.size,
    });

    // Transcribe using Whisper
    // Map app language codes to Whisper language codes
    // 'tr' for Turkish, 'en' for English, 'de' for German
    let whisperLanguage: string | undefined;
    if (language === "en") {
      whisperLanguage = "en";
    } else if (language === "tr") {
      whisperLanguage = "tr";
    } else if (language === "de") {
      whisperLanguage = "de";
    }
    // If language is not supported, let Whisper auto-detect (undefined)

    console.log("Whisper API call:", {
      model: "whisper-1",
      language: whisperLanguage || "auto-detect",
      responseFormat: "text",
    });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: whisperLanguage as any, // 'tr' | 'en' | 'de' | undefined
      response_format: "text",
      temperature: 0,
    });

    // Ensure transcription is a string
    const transcriptText =
      typeof transcription === "string"
        ? transcription
        : String(transcription || "");

    console.log("Transcription successful:", {
      length: transcriptText.length,
      preview: transcriptText.substring(0, 100),
      isEmpty: transcriptText.trim().length === 0,
    });

    if (!transcriptText || transcriptText.trim().length === 0) {
      console.error("Empty transcript received from OpenAI");
      return NextResponse.json(
        {
          error:
            "Transkript boş geldi. Ses kaydını kontrol edin veya tekrar deneyin.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transcript: transcriptText.trim(),
    });
  } catch (error: any) {
    console.error("Transcription error details:", {
      message: error.message,
      status: error.status,
      response: error.response?.data,
      stack: error.stack,
    });

    // More detailed error messages
    let errorMessage = "Transkript oluşturulamadı";

    if (error.message?.includes("API key")) {
      errorMessage =
        "OpenAI API key geçersiz veya eksik. Lütfen .env.local dosyasını kontrol edin.";
    } else if (error.message?.includes("rate limit")) {
      errorMessage =
        "API rate limit aşıldı. Lütfen birkaç saniye sonra tekrar deneyin.";
    } else if (error.message?.includes("file")) {
      errorMessage =
        "Ses dosyası formatı desteklenmiyor. Lütfen tekrar kaydedin.";
    } else {
      errorMessage = `Hata: ${error.message || "Bilinmeyen hata"}`;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
