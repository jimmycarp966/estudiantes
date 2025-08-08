import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { contentText, subject } = body as { contentText: string; subject: string };

    const prompt = `Genera 8 tarjetas de estudio (formato JSON estricto Array<{"question":string,"answer":string}>), en español, para ${subject}. Texto: ${contentText?.slice(0, 3000)}`;

    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.6,
        max_tokens: 900,
        messages: [
          { role: 'system', content: 'Devuelve exclusivamente JSON válido.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!completion.ok) {
      const err = await completion.text();
      return NextResponse.json({ error: 'OpenAI error', details: err }, { status: 500 });
    }

    const data = await completion.json();
    const content = data?.choices?.[0]?.message?.content as string | undefined;
    if (!content) return NextResponse.json([], { status: 200 });

    const arrMatch = content.match(/\[[\s\S]*\]/);
    if (arrMatch) {
      try {
        const parsed = JSON.parse(arrMatch[0]);
        return NextResponse.json(parsed);
      } catch {}
    }

    return NextResponse.json([], { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Server error', details: String(e) }, { status: 500 });
  }
}


