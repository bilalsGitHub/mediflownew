import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai/client';

function getTemplatePrompts(language: 'de' | 'en' = 'de'): Record<string, string> {
  if (language === 'en') {
    return {
      dokumentation: `Convert the following raw doctor–patient conversation into a structured clinical note in English.

OUTPUT FORMAT (exactly this structure):

Kontaktgrund:
[short medical reason for encounter]

Aktueller Zustand:
[general condition of the patient]

Subjektiv:
[patient-reported symptoms, location, trigger, duration, measures taken, response]

Objektiv:
[objective findings; if none, state neutral or negative findings]

Beurteilung & Plan:
[clinical assessment, suspected diagnosis, and treatment/plan]

INPUT CONVERSATION:
<<<
[PASTE DOCTOR–PATIENT CONVERSATION HERE]
>>>

Return in JSON format:
{
  "kontaktgrund": "...",
  "aktueller_zustand": "...",
  "subjektiv": "...",
  "objektiv": "...",
  "beurteilung_plan": "..."
}`,
      kurzdokumentation: `Convert the following raw doctor–patient conversation into a structured clinical note in English.

OUTPUT FORMAT (exactly this structure):

Anamnese:
[patient-reported history and complaints, in medical language]

Untersuchung:
[examination findings; if none, state unremarkable findings]

Beurteilung & Plan:
[clinical assessment, suspected diagnosis, and treatment/plan]

INPUT CONVERSATION:
<<<
[PASTE DOCTOR–PATIENT CONVERSATION HERE]
>>>

Return in JSON format:
{
  "anamnese": "...",
  "untersuchung": "...",
  "beurteilung_plan": "..."
}`,
      standard: `Convert the following raw doctor–patient conversation into a structured clinical note in English.

OUTPUT FORMAT (exactly this structure):

Subjektiv:
[patient-reported symptoms, location, trigger, duration, measures taken, response]

Objektiv:
[objective findings; if none, state neutral or negative findings]

Beurteilung & Plan:
[clinical assessment, suspected diagnosis, and treatment/plan]

INPUT CONVERSATION:
<<<
[PASTE DOCTOR–PATIENT CONVERSATION HERE]
>>>

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
    dokumentation: `Konvertiere das folgende Arzt-Patienten-Gespräch in eine strukturierte klinische Notiz auf Deutsch.

OUTPUT FORMAT (genau diese Struktur):

Kontaktgrund:
[Kurzer medizinischer Grund für die Konsultation]

Aktueller Zustand:
[Allgemeinzustand des Patienten]

Subjektiv:
[Vom Patienten berichtete Symptome, Lokalisation, Auslöser, Dauer, ergriffene Maßnahmen, Reaktion]

Objektiv:
[Objektive Befunde; wenn keine gegeben, stelle unauffällige Befunde fest]

Beurteilung & Plan:
[Klinische Beurteilung, Verdachtsdiagnose und Behandlung/Plan]

INPUT CONVERSATION:
<<<
[HIER DAS ARZT-PATIENTEN-GESPRÄCH EINFÜGEN]
>>>

Gib die Antwort als JSON zurück:
{
  "kontaktgrund": "...",
  "aktueller_zustand": "...",
  "subjektiv": "...",
  "objektiv": "...",
  "beurteilung_plan": "..."
}`,
    kurzdokumentation: `Konvertiere das folgende Arzt-Patienten-Gespräch in eine strukturierte klinische Notiz auf Deutsch.

OUTPUT FORMAT (genau diese Struktur):

Anamnese:
[Vom Patienten berichtete Anamnese und Beschwerden, in medizinischer Sprache]

Untersuchung:
[Untersuchungsbefunde; wenn keine gegeben, stelle unauffällige Befunde fest]

Beurteilung & Plan:
[Klinische Beurteilung, Verdachtsdiagnose und Behandlung/Plan]

INPUT CONVERSATION:
<<<
[HIER DAS ARZT-PATIENTEN-GESPRÄCH EINFÜGEN]
>>>

Gib die Antwort als JSON zurück:
{
  "anamnese": "...",
  "untersuchung": "...",
  "beurteilung_plan": "..."
}`,
    standard: `Konvertiere das folgende Arzt-Patienten-Gespräch in eine strukturierte klinische Notiz auf Deutsch.

OUTPUT FORMAT (genau diese Struktur):

Subjektiv:
[Vom Patienten berichtete Symptome, Lokalisation, Auslöser, Dauer, ergriffene Maßnahmen, Reaktion]

Objektiv:
[Objektive Befunde; wenn keine gegeben, stelle unauffällige Befunde fest]

Beurteilung & Plan:
[Klinische Beurteilung, Verdachtsdiagnose und Behandlung/Plan]

INPUT CONVERSATION:
<<<
[HIER DAS ARZT-PATIENTEN-GESPRÄCH EINFÜGEN]
>>>

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
    return `You are a medical documentation assistant.

Your task is to convert a raw doctor–patient conversation into a structured clinical note in English.

IMPORTANT RULES:
- Write in formal medical language (not patient speech).
- Do NOT quote the patient directly.
- Summarize clearly and objectively.
- Do not invent findings that are not mentioned.
- If no objective findings are given, state neutral or negative findings.
- Keep each section concise and clinically appropriate.
- Write from the doctor's clinical perspective, not the patient's perspective.
- Use medical terminology.
- Avoid repetition between sections.

Return in JSON format.`;
  }
  
  return `Du bist ein medizinischer Dokumentationsassistent.

Deine Aufgabe ist es, ein rohes Arzt-Patienten-Gespräch in eine strukturierte klinische Notiz auf Deutsch umzuwandeln.

WICHTIGE REGELN:
- Schreibe in formaler medizinischer Sprache (nicht in Patientensprache).
- Zitiere den Patienten NICHT direkt.
- Fasse klar und objektiv zusammen.
- Erfinde keine Befunde, die nicht erwähnt wurden.
- Wenn keine objektiven Befunde gegeben sind, stelle neutrale oder negative Befunde fest.
- Halte jeden Abschnitt kurz und klinisch angemessen.
- Schreibe aus der klinischen Perspektive des Arztes, nicht aus der Perspektive des Patienten.
- Verwende medizinische Terminologie.
- Vermeide Wiederholungen zwischen den Abschnitten.

Gib die Antwort als JSON zurück.`;
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
      // Use the new format with <<< >>> markers
      sourceContent = validLanguage === 'en' 
        ? `<<<\n${transcript}\n>>>`
        : `<<<\n${transcript}\n>>>`;
    }

    const importantNote = validLanguage === 'en'
      ? existingNote && existingNote.trim().length > 0
        ? '\n\nIMPORTANT: Preserve all clinical information from the existing note, rewrite according to the new template format. Do not lose any information or add new information.'
        : ''
      : existingNote && existingNote.trim().length > 0
        ? '\n\nWICHTIG: Behalte alle klinischen Informationen aus der bestehenden Notiz bei, schreibe sie nach dem neuen Template-Format neu. Keine Informationen verlieren oder neue Informationen hinzufügen.'
        : '';

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
      
      // Field name'leri normalize et (beurteilung_plan -> beurteilungPlan, aktueller_zustand -> aktuellerZustand)
      const normalized: any = {};
      if (parsed.kontaktgrund) normalized.kontaktgrund = parsed.kontaktgrund;
      if (parsed.aktueller_zustand) normalized.aktuellerZustand = parsed.aktueller_zustand;
      if (parsed.aktuellerZustand) normalized.aktuellerZustand = parsed.aktuellerZustand;
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

