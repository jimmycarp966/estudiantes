import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { subjects, availableTime } = body as { subjects: string[]; availableTime: number };

    const prompt = `Crea un plan de estudio en JSON (clave "dailyPlan": Array<{subject:string,time:number,tasks:string[]}>, "weeklyGoals": string[], "tips": string[]) para materias: ${subjects?.join(', ')} con ${availableTime} minutos diarios. Español.`;

    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 1000,
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
    if (!content) return NextResponse.json({ dailyPlan: [], weeklyGoals: [], tips: [] }, { status: 200 });

    const objMatch = content.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        const parsed = JSON.parse(objMatch[0]);
        return NextResponse.json(parsed);
      } catch {}
    }

    return NextResponse.json({ dailyPlan: [], weeklyGoals: [], tips: [] }, { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Server error', details: String(e) }, { status: 500 });
  }
}


