import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { content, subject, title, type } = body as {
      content: string;
      subject: string;
      title: string;
      type: 'summary' | 'key-points' | 'questions' | 'mind-map';
    };

    const promptParts: string[] = [];
    promptParts.push(`Genera salida en JSON para un estudiante. Siempre en español.`);
    promptParts.push(`Título: ${title}`);
    promptParts.push(`Materia: ${subject}`);
    promptParts.push(`Contenido: ${content?.slice(0, 3500)}`);
    promptParts.push(`Tipo: ${type}`);
    promptParts.push(`Estructura JSON esperada: {"summary": string, "keyPoints": string[], "questions": string[], "difficulty": "beginner|intermediate|advanced", "estimatedTime": number, "tags": string[]}`);

    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 1200,
        messages: [
          { role: 'system', content: 'Eres un asistente educativo que responde SIEMPRE en español con precisión.' },
          { role: 'user', content: promptParts.join('\n\n') },
        ],
      }),
    });

    if (!completion.ok) {
      const err = await completion.text();
      return NextResponse.json({ error: 'OpenAI error', details: err }, { status: 500 });
    }

    const data = await completion.json();
    const contentText: string | undefined = data?.choices?.[0]?.message?.content;
    if (!contentText) {
      return NextResponse.json({ error: 'Empty response' }, { status: 500 });
    }

    // Intentar extraer JSON
    const match = contentText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        return NextResponse.json(parsed);
      } catch {}
    }

    // fallback mínimo
    return NextResponse.json({
      summary: contentText,
      keyPoints: [],
      questions: [],
      difficulty: 'intermediate',
      estimatedTime: Math.max(15, Math.min(120, Math.floor((content?.length || 0) / 100))),
      tags: [subject].filter(Boolean),
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Server error', details: String(e) }, { status: 500 });
  }
}


