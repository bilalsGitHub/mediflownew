import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai/client';

const SYSTEM_PROMPT = `Sen bir doktor-hasta görüşmesi analiz asistanısın. Görevin, transkripti okuyup her konuşmayı "Doktor" veya "Hasta" olarak etiketlemektir.

KURALLAR:
1. Doktor genellikle soru sorar, bilgi ister, muayene yapar
2. Hasta genellikle şikayetlerini, semptomlarını, hikayesini anlatır
3. Soru soran kişi genellikle doktordur
4. Şikayet ve semptom anlatan kişi genellikle hastadır
5. Her konuşma parçasını "Doktor" veya "Hasta" olarak etiketle
6. Belirsiz durumlarda konuşmanın içeriğine göre karar ver

Çıktı Formatı (JSON):
{
  "conversation": [
    {
      "speaker": "Doktor" veya "Hasta",
      "text": "Konuşma metni"
    }
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const { transcript } = await request.json();

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { 
          role: 'user', 
          content: `Aşağıdaki doktor-hasta görüşmesi transkriptini analiz et ve her konuşmayı "Doktor" veya "Hasta" olarak etiketle. Transkripti doğal konuşma parçalarına böl (her cümle veya konuşma birimi için ayrı entry oluştur):\n\n${transcript}` 
        }
      ],
      temperature: 0.2,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    const result = JSON.parse(responseContent);

    // Validate
    if (!result.conversation || !Array.isArray(result.conversation)) {
      return NextResponse.json(
        { error: 'Invalid response format' },
        { status: 500 }
      );
    }

    return NextResponse.json({ conversation: result.conversation });

  } catch (error: any) {
    console.error('Speaker identification error:', error);
    return NextResponse.json(
      { error: error.message || 'Speaker identification failed' },
      { status: 500 }
    );
  }
}

