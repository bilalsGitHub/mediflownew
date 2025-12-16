import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai/client';

const PROMPTS: Record<string, string> = {
  shorter: `Aşağıdaki metni daha kısa ve öz hale getir. Önemli bilgileri koru ama gereksiz detayları çıkar. Sadece metni düzenle, başka bir şey ekleme.`,
  detailed: `Aşağıdaki metni daha detaylı hale getir. Eksik bilgileri tamamla, açıklamaları genişlet. Ancak tıbbi yorum yapma, sadece metni genişlet.`,
  clearer: `Aşağıdaki metni daha anlaşılır ve açık hale getir. Karmaşık ifadeleri basitleştir, net cümleler kullan. Tıbbi terimleri açıkla ama yorum yapma.`,
  professional: `Aşağıdaki metni profesyonel tıbbi not formatına dönüştür. Tıbbi terminoloji kullan, yapılandırılmış bir format oluştur. Ancak tıbbi yorum veya tanı ekleme.`,
  structured: `Aşağıdaki metni yapılandırılmış bir formata dönüştür. Başlıklar, maddeler ve kategoriler kullan. Okunabilirliği artır ama içeriği değiştirme.`,
  summary: `Aşağıdaki metni özetle. Ana noktaları koru, önemli bilgileri vurgula. Kısa ve öz bir özet oluştur.`,
};

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const { text, style } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!style || !PROMPTS[style]) {
      return NextResponse.json(
        { error: 'Valid style is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `Sen bir tıbbi metin düzenleme asistanısın. Görevin, doktorun yazdığı metni istenen formata göre düzenlemektir.

KRİTİK KURALLAR:
1. ASLA tıbbi yorum yapma, tanı koyma veya tedavi önerisi sunma
2. Sadece metni düzenle, içeriği değiştirme
3. Doktorun yazdığı bilgileri koru
4. Sadece format ve ifade şeklini değiştir`;

    const userPrompt = `${PROMPTS[style]}\n\nMetin:\n${text}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const rewrittenText = completion.choices[0]?.message?.content;
    
    if (!rewrittenText) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      rewrittenText: rewrittenText.trim()
    });

  } catch (error: any) {
    console.error('Rewrite error:', error);
    return NextResponse.json(
      { error: error.message || 'Text rewriting failed' },
      { status: 500 }
    );
  }
}

