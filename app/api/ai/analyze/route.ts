import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai/client';

function getSystemPrompt(language: 'de' | 'en' = 'de'): string {
  if (language === 'en') {
    return `You are a medical consultation summarization assistant. Your task is to analyze a doctor-patient consultation transcript and create a structured summary.

CRITICAL RULES:
1. NEVER make medical comments, diagnoses, or treatment recommendations
2. Only summarize and organize what the patient has told
3. Convey objective information, do not add interpretations
4. Write "not specified" for unclear or missing information
5. Help the doctor take notes, do not make decisions for them

Output Format (JSON):
{
  "patient_complaint": "Patient's main complaint (in patient's own words)",
  "symptoms": [
    "Symptom 1 (as told by patient)",
    "Symptom 2 (as told by patient)"
  ],
  "duration_frequency": "Duration and frequency information (if available)",
  "preliminary_summary": "Not a diagnosis, just a summary of what the patient told",
  "doctor_notes_draft": "Doctor's note draft (no interpretations, just summary)"
}`;
  }
  
  // German (default)
  return `Du bist ein medizinischer Konsultationszusammenfassungsassistent. Deine Aufgabe ist es, ein Arzt-Patienten-Konsultationstranskript zu analysieren und eine strukturierte Zusammenfassung zu erstellen.

KRITISCHE REGELN:
1. NIEMALS medizinische Kommentare, Diagnosen oder Behandlungsempfehlungen geben
2. Nur das zusammenfassen und organisieren, was der Patient erzählt hat
3. Objektive Informationen übermitteln, keine Interpretationen hinzufügen
4. "Nicht angegeben" für unklare oder fehlende Informationen schreiben
5. Dem Arzt beim Notieren helfen, nicht für ihn entscheiden

Ausgabeformat (JSON):
{
  "patient_complaint": "Hauptbeschwerde des Patienten (in den eigenen Worten des Patienten)",
  "symptoms": [
    "Symptom 1 (wie vom Patienten erzählt)",
    "Symptom 2 (wie vom Patienten erzählt)"
  ],
  "duration_frequency": "Dauer- und Häufigkeitsinformationen (falls verfügbar)",
  "preliminary_summary": "Keine Diagnose, nur eine Zusammenfassung dessen, was der Patient erzählt hat",
  "doctor_notes_draft": "Arztnotiz-Entwurf (keine Interpretationen, nur Zusammenfassung)"
}`;
}

function getUserPrompt(language: 'de' | 'en' = 'de', transcript: string): string {
  if (language === 'en') {
    return `Analyze the following doctor-patient consultation transcript and create a structured summary:\n\n${transcript}`;
  }
  return `Analysiere das folgende Arzt-Patienten-Konsultationstranskript und erstelle eine strukturierte Zusammenfassung:\n\n${transcript}`;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const { transcript, language = 'de' } = await request.json();

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const validLanguage = (language === 'en' || language === 'de') ? language : 'de';
    const systemPrompt = getSystemPrompt(validLanguage);
    const userPrompt = getUserPrompt(validLanguage, transcript);

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

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    const analysis = JSON.parse(responseContent);

    // Validate required fields
    if (!analysis.patient_complaint || !analysis.symptoms || !analysis.doctor_notes_draft) {
      return NextResponse.json(
        { error: 'Invalid analysis format' },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis });

  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}

