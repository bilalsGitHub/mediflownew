import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai/client';

// Helper function to convert document object to text
function documentToText(doc: any): string {
  if (!doc) return '';
  
  if (typeof doc === 'string') return doc;
  
  const parts: string[] = [];
  if (doc.greeting) parts.push(doc.greeting);
  if (doc.diagnosis) parts.push(doc.diagnosis);
  if (doc.treatment) parts.push(doc.treatment);
  if (doc.recommendations) parts.push(doc.recommendations);
  if (doc.closing) parts.push(doc.closing);
  if (doc.patientInfo) parts.push(doc.patientInfo);
  if (doc.recommendedAction) parts.push(doc.recommendedAction);
  if (doc.thanks) parts.push(doc.thanks);
  if (doc.date) parts.push(doc.date);
  if (doc.requestedAction) parts.push(doc.requestedAction);
  if (doc.anamneseAndFindings) parts.push(doc.anamneseAndFindings);
  if (doc.doctorName || doc.doctorTitle) {
    parts.push(`${doc.doctorTitle || ''} ${doc.doctorName || ''}`.trim());
  }
  
  return parts.join('\n\n');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Support both old format (text) and new format (currentDocument + consultationData)
    let text: string;
    let documentType: string | undefined;
    let consultationData: any;
    let language: string = 'de';

    if (body.text) {
      // Old format: just text
      text = body.text;
    } else if (body.currentDocument && body.consultationData) {
      // New format: regenerate document with consultation context
      documentType = body.documentType;
      consultationData = body.consultationData;
      language = body.language || 'de';
      
      // Convert current document to text
      text = documentToText(body.currentDocument.content);
      
      if (!text || text.trim().length === 0) {
        return NextResponse.json(
          { error: 'Current document content is required' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Either "text" or "currentDocument" with "consultationData" is required' },
        { status: 400 }
      );
    }

    // If we have consultation data, use generate-document logic with current document as context
    if (consultationData && documentType) {
      // Build context from consultation
      const patientName = consultationData.patientName || (language === 'en' ? 'Patient' : 'Patient');
      const complaint = consultationData.analysis?.patient_complaint || '';
      const symptoms = consultationData.analysis?.symptoms?.join(', ') || '';
      const diagnosis = consultationData.soapNote?.beurteilungPlan || consultationData.analysis?.preliminary_summary || '';
      
      // Add current document as context in doctor instructions
      // Important: Ask AI to create a DIFFERENT, improved version, not just copy the existing one
      const doctorInstructions = language === 'de' 
        ? `WICHTIG: Erstelle eine ALTERNATIVE und KREATIVE Version des folgenden Dokuments.
        
INSTRUKTIONEN:
1. Verwende KOMPLETT ANDERE Formulierungen als im Original.
2. Ändere den Satzbau und die Wortwahl.
3. Betone andere Aspekte der Diagnose oder Empfehlung.
4. Mache den Tonfall etwas anders (z.B. einfühlsamer oder sachlicher).
5. Das Ziel ist eine ECHTE VARIATION, keine Kopie!

Aktuelles Dokument (NUR als Referenz, NICHT kopieren):\n${text}\n\nErstelle jetzt eine komplett neue, alternative Version:`
        : `IMPORTANT: Create an ALTERNATIVE and CREATIVE version of the following document.

INSTRUCTIONS:
1. Use COMPLETELY DIFFERENT wording than the original.
2. Change the sentence structure and vocabulary.
3. Emphasize different aspects of the diagnosis or recommendation.
4. Change the tone slightly (e.g. more empathetic or more factual).
5. The goal is a REAL VARIATION, not a copy!

Current document (ONLY as reference, DO NOT copy):\n${text}\n\nNow create a completely new, alternative version:`;
      
      // Add randomness to ensure variety
      const randomSeed = Date.now() + Math.random();
      const varietyNote = language === 'de' 
        ? `\n\n[VARIATION ID: ${randomSeed} - Diese Version MUSS anders formuliert sein als vorherige Versionen!]`
        : `\n\n[VARIATION ID: ${randomSeed} - This version MUST be worded differently than previous versions!]`;

      // Build prompts based on document type and language
      let systemPrompt = '';
      let userPrompt = '';
      
      if (language === 'en') {
        switch (documentType) {
          case 'patientMessage':
            systemPrompt = `You are a professional medical assistant who writes messages to patients.
The message should:
- Be professional and empathetic
- Explain medical terms in understandable language
- Be clearly structured
- Clearly communicate the diagnosis and recommendations

IMPORTANT: If an existing document is provided as reference, create a COMPLETELY NEW version with different wording. Do NOT copy the existing text.

Return the answer as JSON with the following fields:
{
  "greeting": "Greeting to the patient",
  "diagnosis": "Diagnosis/findings in understandable language",
  "treatment": "Treatment performed or planned",
  "recommendations": "Recommendations for the patient",
  "closing": "Closing with contact information",
  "date": "Current date (Format: MM/DD/YYYY)"
}`;
            userPrompt = `Patient: ${patientName}
Complaint: ${complaint}
Symptoms: ${symptoms}
Diagnosis/Assessment: ${diagnosis}

${doctorInstructions}${varietyNote}`;
            break;
          case 'referralReason':
            systemPrompt = `You are a medical assistant who writes referral reasons.
The referral reason should:
- Be precise and professionally correct
- Contain all relevant medical information
- Be clearly structured
- Clearly state the reason for the referral

IMPORTANT: If an existing document is provided as reference, create a COMPLETELY NEW version with different wording. Do NOT copy the existing text.

Return the answer as JSON with the following fields:
{
  "date": "Current date (Format: MM/DD/YYYY)",
  "diagnosis": "Diagnosis/Clinical question",
  "requestedAction": "Requested action",
  "anamneseAndFindings": "Anamnesis and findings"
}`;
            userPrompt = `Patient: ${patientName}
Complaint: ${complaint}
Symptoms: ${symptoms}
Diagnosis/Assessment: ${diagnosis}

${doctorInstructions}${varietyNote}`;
            break;
          case 'referralResponse':
            systemPrompt = `You are a medical assistant who writes referral responses.
The response should:
- Be professional and collegial
- Clearly present the examination results
- Provide recommendations for further treatment
- Be grateful for the referral

IMPORTANT: If an existing document is provided as reference, create a COMPLETELY NEW version with different wording. Do NOT copy the existing text.

Return the answer as JSON with the following fields:
{
  "greeting": "Professional greeting to the referring doctor",
  "patientInfo": "Brief patient information",
  "diagnosis": "Findings/Diagnosis after examination",
  "recommendedAction": "Recommended further actions",
  "thanks": "Thanks and closing",
  "date": "Current date (Format: MM/DD/YYYY)"
}`;
            userPrompt = `Patient: ${patientName}
Complaint: ${complaint}
Symptoms: ${symptoms}
Diagnosis/Assessment: ${diagnosis}

${doctorInstructions}${varietyNote}`;
            break;
        }
      } else {
        // German (default)
        switch (documentType) {
          case 'patientMessage':
            systemPrompt = `Du bist ein professioneller medizinischer Assistent, der Nachrichten an Patienten verfasst.
Die Nachricht soll:
- Professionell und empathisch sein
- Medizinische Fachbegriffe verständlich erklären
- Klar strukturiert sein
- Die Diagnose und Empfehlungen deutlich kommunizieren

WICHTIG: Wenn ein bestehendes Dokument als Referenz gegeben wird, erstelle eine KOMPLETT NEUE Version mit anderen Formulierungen. Kopiere NICHT den bestehenden Text.

Gib die Antwort als JSON mit folgenden Feldern:
{
  "greeting": "Begrüßung des Patienten",
  "diagnosis": "Diagnose/Befund in verständlicher Sprache",
  "treatment": "Durchgeführte oder geplante Behandlung",
  "recommendations": "Empfehlungen für den Patienten",
  "closing": "Abschluss mit Kontaktmöglichkeit",
  "date": "Aktuelles Datum (Format: DD.MM.YYYY)"
}`;
            userPrompt = `Patient: ${patientName}
Beschwerde: ${complaint}
Symptome: ${symptoms}
Diagnose/Beurteilung: ${diagnosis}

${doctorInstructions}${varietyNote}`;
            break;
          case 'referralReason':
            systemPrompt = `Du bist ein medizinischer Assistent, der Überweisungsgründe verfasst.
Der Überweisungsgrund soll:
- Präzise und fachlich korrekt sein
- Alle relevanten medizinischen Informationen enthalten
- Klar strukturiert sein
- Den Grund für die Überweisung deutlich machen

WICHTIG: Wenn ein bestehendes Dokument als Referenz gegeben wird, erstelle eine KOMPLETT NEUE Version mit anderen Formulierungen. Kopiere NICHT den bestehenden Text.

Gib die Antwort als JSON mit folgenden Feldern:
{
  "date": "Aktuelles Datum (Format: DD.MM.YYYY)",
  "diagnosis": "Diagnose/Klinische Fragestellung",
  "requestedAction": "Erbetene Maßnahme",
  "anamneseAndFindings": "Anamnese und Befunde"
}`;
            userPrompt = `Patient: ${patientName}
Beschwerde: ${complaint}
Symptome: ${symptoms}
Diagnose/Beurteilung: ${diagnosis}

${doctorInstructions}${varietyNote}`;
            break;
          case 'referralResponse':
            systemPrompt = `Du bist ein medizinischer Assistent, der Überweisungsantworten verfasst.
Die Antwort soll:
- Professionell und kollegial sein
- Die Untersuchungsergebnisse klar darstellen
- Empfehlungen für weitere Behandlung geben
- Dankbar für die Überweisung sein

WICHTIG: Wenn ein bestehendes Dokument als Referenz gegeben wird, erstelle eine KOMPLETT NEUE Version mit anderen Formulierungen. Kopiere NICHT den bestehenden Text.

Gib die Antwort als JSON mit folgenden Feldern:
{
  "greeting": "Professionelle Begrüßung des überweisenden Arztes",
  "patientInfo": "Kurze Patienteninfo",
  "diagnosis": "Befund/Diagnose nach Untersuchung",
  "recommendedAction": "Empfohlene weitere Maßnahmen",
  "thanks": "Dank und Abschluss",
  "date": "Aktuelles Datum (Format: DD.MM.YYYY)"
}`;
            userPrompt = `Patient: ${patientName}
Beschwerde: ${complaint}
Symptome: ${symptoms}
Diagnose/Beurteilung: ${diagnosis}

${doctorInstructions}${varietyNote}`;
            break;
        }
      }
      
      if (!systemPrompt || !userPrompt) {
        return NextResponse.json(
          { error: 'Invalid document type' },
          { status: 400 }
        );
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o', // Use GPT-4o for better creativity and instruction following
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 1.1, // Even higher temperature
        presence_penalty: 0.5,
        frequency_penalty: 0.5,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        return NextResponse.json(
          { error: 'Failed to regenerate document' },
          { status: 500 }
        );
      }

      const document = JSON.parse(responseContent);
      return NextResponse.json({ 
        document,
        rewrittenText: documentToText(document),
      });
    }

    // Fallback: simple text regeneration (old behavior)
    const systemPrompt = `Sen bir tıbbi not düzenleme asistanısın. Verilen tıbbi notu daha profesyonel, yapılandırılmış ve okunabilir hale getir. 

Önemli kurallar:
- Tıbbi terminolojiyi koru
- Notun yapısını ve içeriğini koru
- Daha net ve anlaşılır bir dil kullan
- Gereksiz tekrarları kaldır
- Profesyonel tıbbi not formatına uygun hale getir
- Tıbbi yorum yapma, sadece metni düzenle
- Orijinal anlamı koru`;

    const userPrompt = `Aşağıdaki tıbbi notu yeniden düzenle ve iyileştir:\n\n${text}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const regeneratedText = completion.choices[0]?.message?.content?.trim();

    if (!regeneratedText) {
      return NextResponse.json(
        { error: 'Failed to regenerate text' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      regeneratedText,
      originalText: text,
    });
  } catch (error: any) {
    console.error('Regenerate error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to regenerate text' },
      { status: 500 }
    );
  }
}
