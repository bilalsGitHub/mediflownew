import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai/client';

function getTemplatePrompts(language: 'de' | 'en' = 'de'): Record<string, string> {
  if (language === 'en') {
    return {
      dokumentation: `Analyze the following consultation transcript and divide it into these sections:
- Subjektiv: Patient's complaints and subjective findings
- Objektiv: Objective findings and examination results
- Beurteilung & Plan: Assessment and treatment plan

Return in JSON format:
{
  "subjektiv": "...",
  "objektiv": "...",
  "beurteilung_plan": "..."
}`,
      kurzdokumentation: `Analyze the following consultation transcript and divide it into these sections:
- Anamnese: Patient's history and complaints
- Untersuchung: Examination findings
- Beurteilung & Plan: Assessment and treatment plan

Return in JSON format:
{
  "anamnese": "...",
  "untersuchung": "...",
  "beurteilung_plan": "..."
}`,
      standard: `Analyze the following consultation transcript and divide it into these sections:
- Subjektiv: Patient's complaints and subjective findings
- Objektiv: Objective findings and examination results
- Beurteilung & Plan: Assessment and treatment plan

Return in JSON format:
{
  "subjektiv": "...",
  "objektiv": "...",
  "beurteilung_plan": "..."
}`,
    };
  }
  
  // German (default)
  return {
    dokumentation: `Analysiere das folgende Konsultationstranskript und teile es in diese Abschnitte ein:
- Subjektiv: Beschwerden des Patienten und subjektive Befunde
- Objektiv: Objektive Befunde und Untersuchungsergebnisse
- Beurteilung & Plan: Beurteilung und Behandlungsplan

Gib die Antwort als JSON zurück:
{
  "subjektiv": "...",
  "objektiv": "...",
  "beurteilung_plan": "..."
}`,
    kurzdokumentation: `Analysiere das folgende Konsultationstranskript und teile es in diese Abschnitte ein:
- Anamnese: Anamnese und Beschwerden des Patienten
- Untersuchung: Untersuchungsbefunde
- Beurteilung & Plan: Beurteilung und Behandlungsplan

Gib die Antwort als JSON zurück:
{
  "anamnese": "...",
  "untersuchung": "...",
  "beurteilung_plan": "..."
}`,
    standard: `Analysiere das folgende Konsultationstranskript und teile es in diese Abschnitte ein:
- Subjektiv: Beschwerden des Patienten und subjektive Befunde
- Objektiv: Objektive Befunde und Untersuchungsergebnisse
- Beurteilung & Plan: Beurteilung und Behandlungsplan

Gib die Antwort als JSON zurück:
{
  "subjektiv": "...",
  "objektiv": "...",
  "beurteilung_plan": "..."
}`,
  };
}

function getSystemPrompt(language: 'de' | 'en' = 'de'): string {
  if (language === 'en') {
    return `You are a medical note editing assistant. Your task is to rewrite existing medical note content according to a new template format.

CRITICAL RULES:
1. NEVER make medical comments, diagnoses, or treatment recommendations
2. Preserve ALL clinical information from the existing note - do not lose or add any information
3. Only change the structure, sectioning, and expression style according to the new template
4. Clinical meaning and content must remain the same, only the presentation format should change
5. Fill every section, do not leave empty
6. Return in JSON format
7. You can write in English or German, preserve the language of the existing note`;
  }
  
  return `Du bist ein medizinischer Notizenbearbeitungsassistent. Deine Aufgabe ist es, bestehenden medizinischen Notizeninhalt nach einem neuen Template-Format neu zu schreiben.

KRITISCHE REGELN:
1. NIEMALS medizinische Kommentare, Diagnosen oder Behandlungsempfehlungen geben
2. ALLE klinischen Informationen aus der bestehenden Notiz beibehalten - keine Informationen verlieren oder hinzufügen
3. Nur die Struktur, Abschnittung und Ausdrucksweise nach dem neuen Template ändern
4. Klinische Bedeutung und Inhalt müssen gleich bleiben, nur das Präsentationsformat sollte sich ändern
5. Jeden Abschnitt ausfüllen, nichts leer lassen
6. Als JSON zurückgeben
7. Du kannst auf Deutsch oder Englisch schreiben, die Sprache der bestehenden Notiz beibehalten`;
}

export async function POST(request: NextRequest) {
  try {
    const { transcript, template, existingNote, language = 'de' } = await request.json();

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const validLanguage = (language === 'en' || language === 'de') ? language : 'de';
    const TEMPLATE_PROMPTS = getTemplatePrompts(validLanguage);
    
    if (!template || !TEMPLATE_PROMPTS[template]) {
      return NextResponse.json(
        { error: 'Valid template is required' },
        { status: 400 }
      );
    }

    const systemPrompt = getSystemPrompt(validLanguage);

    // Build source content based on language
    let sourceContent = '';
    if (existingNote && existingNote.trim().length > 0) {
      if (validLanguage === 'en') {
        sourceContent = `Existing Medical Note:\n${existingNote}\n\nOriginal Consultation Transcript (for reference):\n${transcript}`;
      } else {
        sourceContent = `Bestehende medizinische Notiz:\n${existingNote}\n\nOriginales Konsultationstranskript (als Referenz):\n${transcript}`;
      }
    } else {
      sourceContent = validLanguage === 'en' 
        ? `Consultation Transcript:\n${transcript}`
        : `Konsultationstranskript:\n${transcript}`;
    }

    const importantNote = validLanguage === 'en'
      ? '\n\nIMPORTANT: Preserve all clinical information from the existing note, rewrite according to the new template format. Do not lose any information or add new information.'
      : '\n\nWICHTIG: Behalte alle klinischen Informationen aus der bestehenden Notiz bei, schreibe sie nach dem neuen Template-Format neu. Keine Informationen verlieren oder neue Informationen hinzufügen.';

    const userPrompt = `${TEMPLATE_PROMPTS[template]}\n\n${sourceContent}${importantNote}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content?.trim();

    if (!responseText) {
      return NextResponse.json(
        { error: 'Failed to analyze transcript' },
        { status: 500 }
      );
    }

    try {
      const parsed = JSON.parse(responseText);
      
      // Field name'leri normalize et (beurteilung_plan -> beurteilungPlan)
      const normalized: any = {};
      if (parsed.subjektiv) normalized.subjektiv = parsed.subjektiv;
      if (parsed.objektiv) normalized.objektiv = parsed.objektiv;
      if (parsed.anamnese) normalized.anamnese = parsed.anamnese;
      if (parsed.untersuchung) normalized.untersuchung = parsed.untersuchung;
      if (parsed.beurteilung_plan) normalized.beurteilungPlan = parsed.beurteilung_plan;
      if (parsed.beurteilungPlan) normalized.beurteilungPlan = parsed.beurteilungPlan;
      
      return NextResponse.json({ 
        soapNote: normalized,
      });
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Analyze with template error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze transcript with template' },
      { status: 500 }
    );
  }
}

