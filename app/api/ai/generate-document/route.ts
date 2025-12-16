import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getDocumentPrompts(documentType: string, language: 'de' | 'en' = 'de', patientName: string, complaint: string, symptoms: string, diagnosis: string, doctorInstructions?: string) {
  if (language === 'en') {
    switch (documentType) {
      case 'patientMessage':
        return {
          systemPrompt: `You are a professional medical assistant who writes messages to patients.
The message should:
- Be professional and empathetic
- Explain medical terms in understandable language
- Be clearly structured
- Clearly communicate the diagnosis and recommendations

Return the answer as JSON with the following fields:
{
  "greeting": "Greeting to the patient",
  "diagnosis": "Diagnosis/findings in understandable language",
  "treatment": "Treatment performed or planned",
  "recommendations": "Recommendations for the patient",
  "closing": "Closing with contact information"
}`,
          userPrompt: `Patient: ${patientName}
Complaint: ${complaint}
Symptoms: ${symptoms}
Diagnosis/Assessment: ${diagnosis}

${doctorInstructions ? `Additional instructions from the doctor: ${doctorInstructions}` : ''}

Create a professional message to the patient.`
        };
      case 'referralReason':
        return {
          systemPrompt: `You are a medical assistant who writes referral reasons.
The referral reason should:
- Be precise and professionally correct
- Contain all relevant medical information
- Be clearly structured
- Clearly state the reason for the referral

Return the answer as JSON with the following fields:
{
  "date": "Current date (Format: MM/DD/YYYY)",
  "diagnosis": "Diagnosis/Clinical question",
  "requestedAction": "Requested action",
  "anamneseAndFindings": "Anamnesis and findings"
}`,
          userPrompt: `Patient: ${patientName}
Complaint: ${complaint}
Symptoms: ${symptoms}
Diagnosis/Assessment: ${diagnosis}

${doctorInstructions ? `Additional instructions from the doctor: ${doctorInstructions}` : ''}

Create a precise referral reason.`
        };
      case 'referralResponse':
        return {
          systemPrompt: `You are a medical assistant who writes referral responses.
The response should:
- Be professional and collegial
- Clearly present the examination results
- Provide recommendations for further treatment
- Be grateful for the referral

Return the answer as JSON with the following fields:
{
  "greeting": "Professional greeting to the referring doctor",
  "patientInfo": "Brief patient information",
  "diagnosis": "Findings/Diagnosis after examination",
  "recommendedAction": "Recommended further actions",
  "thanks": "Thanks and closing"
}`,
          userPrompt: `Patient: ${patientName}
Complaint: ${complaint}
Symptoms: ${symptoms}
Diagnosis/Assessment: ${diagnosis}

${doctorInstructions ? `Additional instructions from the doctor: ${doctorInstructions}` : ''}

Create a professional referral response.`
        };
    }
  }
  
  // German (default)
  switch (documentType) {
    case 'patientMessage':
      return {
        systemPrompt: `Du bist ein professioneller medizinischer Assistent, der Nachrichten an Patienten verfasst.
Die Nachricht soll:
- Professionell und empathisch sein
- Medizinische Fachbegriffe verständlich erklären
- Klar strukturiert sein
- Die Diagnose und Empfehlungen deutlich kommunizieren

Gib die Antwort als JSON mit folgenden Feldern:
{
  "greeting": "Begrüßung des Patienten",
  "diagnosis": "Diagnose/Befund in verständlicher Sprache",
  "treatment": "Durchgeführte oder geplante Behandlung",
  "recommendations": "Empfehlungen für den Patienten",
  "closing": "Abschluss mit Kontaktmöglichkeit"
}`,
        userPrompt: `Patient: ${patientName}
Beschwerde: ${complaint}
Symptome: ${symptoms}
Diagnose/Beurteilung: ${diagnosis}

${doctorInstructions ? `Zusätzliche Anweisungen vom Arzt: ${doctorInstructions}` : ''}

Erstelle eine professionelle Nachricht an den Patienten.`
      };
    case 'referralReason':
      return {
        systemPrompt: `Du bist ein medizinischer Assistent, der Überweisungsgründe verfasst.
Der Überweisungsgrund soll:
- Präzise und fachlich korrekt sein
- Alle relevanten medizinischen Informationen enthalten
- Klar strukturiert sein
- Den Grund für die Überweisung deutlich machen

Gib die Antwort als JSON mit folgenden Feldern:
{
  "date": "Aktuelles Datum (Format: DD.MM.YYYY)",
  "diagnosis": "Diagnose/Klinische Fragestellung",
  "requestedAction": "Erbetene Maßnahme",
  "anamneseAndFindings": "Anamnese und Befunde"
}`,
        userPrompt: `Patient: ${patientName}
Beschwerde: ${complaint}
Symptome: ${symptoms}
Diagnose/Beurteilung: ${diagnosis}

${doctorInstructions ? `Zusätzliche Anweisungen vom Arzt: ${doctorInstructions}` : ''}

Erstelle einen präzisen Überweisungsgrund.`
      };
    case 'referralResponse':
      return {
        systemPrompt: `Du bist ein medizinischer Assistent, der Überweisungsantworten verfasst.
Die Antwort soll:
- Professionell und kollegial sein
- Die Untersuchungsergebnisse klar darstellen
- Empfehlungen für weitere Behandlung geben
- Dankbar für die Überweisung sein

Gib die Antwort als JSON mit folgenden Feldern:
{
  "greeting": "Professionelle Begrüßung des überweisenden Arztes",
  "patientInfo": "Kurze Patienteninfo",
  "diagnosis": "Befund/Diagnose nach Untersuchung",
  "recommendedAction": "Empfohlene weitere Maßnahmen",
  "thanks": "Dank und Abschluss"
}`,
        userPrompt: `Patient: ${patientName}
Beschwerde: ${complaint}
Symptome: ${symptoms}
Diagnose/Beurteilung: ${diagnosis}

${doctorInstructions ? `Zusätzliche Anweisungen vom Arzt: ${doctorInstructions}` : ''}

Erstelle eine professionelle Überweisungsantwort.`
      };
  }
  return { systemPrompt: '', userPrompt: '' };
}

export async function POST(request: NextRequest) {
  try {
    const { documentType, consultationData, doctorInstructions, language = 'de' } = await request.json();

    if (!documentType || !consultationData) {
      return NextResponse.json(
        { error: 'Document type and consultation data are required' },
        { status: 400 }
      );
    }

    // Build context from consultation
    const patientName = consultationData.patientName || (language === 'en' ? 'Patient' : 'Patient');
    const diagnosis = consultationData.soapNote?.beurteilungPlan || consultationData.analysis?.preliminary_summary || '';
    const symptoms = consultationData.analysis?.symptoms?.join(', ') || '';
    const complaint = consultationData.analysis?.patient_complaint || '';

    const validLanguage = (language === 'en' || language === 'de') ? language : 'de';
    const prompts = getDocumentPrompts(documentType, validLanguage, patientName, complaint, symptoms, diagnosis, doctorInstructions);

    if (!prompts.systemPrompt || !prompts.userPrompt) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      );
    }

    const { systemPrompt, userPrompt } = prompts;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const document = JSON.parse(content);

    // Add current date and doctor info if not present
    const dateLocale = validLanguage === 'en' ? 'en-US' : 'de-DE';
    const dateFormat: Intl.DateTimeFormatOptions | undefined = validLanguage === 'en' 
      ? { month: '2-digit', day: '2-digit', year: 'numeric' as const } 
      : undefined;
    const currentDate = dateFormat
      ? new Date().toLocaleDateString(dateLocale, dateFormat)
      : new Date().toLocaleDateString(dateLocale);
    
    if (documentType === 'patientMessage' || documentType === 'referralResponse') {
      if (!document.date) document.date = currentDate;
      if (!document.doctorName) document.doctorName = '';
      if (!document.doctorTitle) document.doctorTitle = validLanguage === 'en' ? 'Dr.' : 'Dr. med.';
    }
    if (documentType === 'referralReason' && !document.date) {
      document.date = currentDate;
    }

    return NextResponse.json({ document });
  } catch (error: any) {
    console.error('AI document generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate document' },
      { status: 500 }
    );
  }
}

