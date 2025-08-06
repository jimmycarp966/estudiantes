'use client';

interface AISummaryRequest {
  content: string;
  subject: string;
  title: string;
  type: 'summary' | 'key-points' | 'questions' | 'mind-map';
}

interface AISummaryResponse {
  summary: string;
  keyPoints: string[];
  questions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // en minutos
  tags: string[];
}

export class AIService {
  private static instance: AIService;
  private apiKey: string;

  private constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateSummary(request: AISummaryRequest): Promise<AISummaryResponse> {
    if (!this.apiKey) {
      // Fallback a resumen básico sin IA
      return this.generateBasicSummary(request);
    }

    try {
      const prompt = this.buildPrompt(request);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Eres un asistente educativo especializado en crear resúmenes claros y útiles para estudiantes universitarios. Responde siempre en español.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('Error en la API de OpenAI');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Respuesta vacía de la IA');
      }

      return this.parseAIResponse(content, request);
    } catch (error) {
      console.error('Error generando resumen con IA:', error);
      return this.generateBasicSummary(request);
    }
  }

  private buildPrompt(request: AISummaryRequest): string {
    const { content, subject, title, type } = request;
    
    let prompt = `Genera un resumen educativo para el siguiente contenido de ${subject}:\n\n`;
    prompt += `Título: ${title}\n\n`;
    prompt += `Contenido: ${content.substring(0, 2000)}...\n\n`;
    
    switch (type) {
      case 'summary':
        prompt += 'Crea un resumen conciso pero completo que incluya:\n';
        prompt += '1. Resumen principal (2-3 párrafos)\n';
        prompt += '2. Puntos clave (lista numerada)\n';
        prompt += '3. Conceptos importantes\n';
        prompt += '4. Tiempo estimado de estudio (en minutos)\n';
        prompt += '5. Dificultad (beginner/intermediate/advanced)\n';
        prompt += '6. Tags relevantes (máximo 5)\n';
        break;
      
      case 'key-points':
        prompt += 'Extrae los puntos más importantes:\n';
        prompt += '1. Conceptos fundamentales\n';
        prompt += '2. Definiciones clave\n';
        prompt += '3. Fórmulas o reglas importantes\n';
        prompt += '4. Ejemplos destacados\n';
        break;
      
      case 'questions':
        prompt += 'Genera preguntas de estudio:\n';
        prompt += '1. Preguntas de comprensión básica\n';
        prompt += '2. Preguntas de aplicación\n';
        prompt += '3. Preguntas de análisis\n';
        prompt += '4. Preguntas de síntesis\n';
        break;
      
      case 'mind-map':
        prompt += 'Crea una estructura de mapa mental:\n';
        prompt += '1. Tema central\n';
        prompt += '2. Ramas principales\n';
        prompt += '3. Subramas\n';
        prompt += '4. Conexiones entre conceptos\n';
        break;
    }

    prompt += '\nResponde en formato JSON con la siguiente estructura:\n';
    prompt += '{\n';
    prompt += '  "summary": "resumen del contenido",\n';
    prompt += '  "keyPoints": ["punto 1", "punto 2", ...],\n';
    prompt += '  "questions": ["pregunta 1", "pregunta 2", ...],\n';
    prompt += '  "difficulty": "beginner|intermediate|advanced",\n';
    prompt += '  "estimatedTime": 30,\n';
    prompt += '  "tags": ["tag1", "tag2", ...]\n';
    prompt += '}';

    return prompt;
  }

  private parseAIResponse(content: string, request: AISummaryRequest): AISummaryResponse {
    try {
      // Intentar parsear JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || '',
          keyPoints: parsed.keyPoints || [],
          questions: parsed.questions || [],
          difficulty: parsed.difficulty || 'intermediate',
          estimatedTime: parsed.estimatedTime || 30,
          tags: parsed.tags || []
        };
      }
    } catch (error) {
      console.error('Error parseando respuesta de IA:', error);
    }

    // Fallback si no se puede parsear JSON
    return this.generateBasicSummary(request);
  }

  private generateBasicSummary(request: AISummaryRequest): AISummaryResponse {
    const { content, subject, title } = request;
    
    // Extraer palabras clave del contenido
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    const keyWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    // Generar resumen básico
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const summary = sentences.slice(0, 3).join('. ') + '.';

    // Generar puntos clave
    const keyPoints = keyWords.slice(0, 5).map(word => 
      `Concepto importante relacionado con "${word}"`
    );

    // Generar preguntas básicas
    const questions = [
      `¿Cuáles son los conceptos principales de ${title}?`,
      `¿Cómo se relaciona este contenido con ${subject}?`,
      `¿Qué aplicaciones prácticas tiene este conocimiento?`
    ];

    // Calcular dificultad basada en longitud y complejidad
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const difficulty = avgWordLength > 8 ? 'advanced' : avgWordLength > 6 ? 'intermediate' : 'beginner';

    // Calcular tiempo estimado
    const estimatedTime = Math.max(15, Math.min(120, Math.floor(content.length / 100)));

    return {
      summary,
      keyPoints,
      questions,
      difficulty,
      estimatedTime,
      tags: [subject, ...keyWords.slice(0, 3)]
    };
  }

  async generateFlashcards(contentText: string, subject: string): Promise<Array<{question: string, answer: string}>> {
    if (!this.apiKey) {
      return this.generateBasicFlashcards(contentText);
    }

    try {
      const contentSubstring = contentText.substring(0, 1500);
      const promptText: string = `Genera 5 tarjetas de estudio (flashcards) para el siguiente contenido de ${subject}:\n\n${contentSubstring}...\n\nResponde en formato JSON:\n[{"question": "pregunta", "answer": "respuesta"}, ...]`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Eres un asistente educativo especializado en crear tarjetas de estudio efectivas. Responde siempre en español.'
            },
            {
              role: 'user',
              content: promptText
            }
          ],
          max_tokens: 800,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('Error en la API de OpenAI');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Respuesta vacía de la IA');
      }

      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.error('Error parseando flashcards:', error);
      }

      return this.generateBasicFlashcards(contentText);
    } catch (error) {
      console.error('Error generando flashcards con IA:', error);
      return this.generateBasicFlashcards(contentText);
    }
  }

  private generateBasicFlashcards(content: string): Array<{question: string, answer: string}> {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 30);
    
    return sentences.slice(0, 5).map((sentence, index) => ({
      question: `¿Cuál es el concepto principal en la oración ${index + 1}?`,
      answer: sentence.trim()
    }));
  }

  async generateStudyPlan(subjects: string[], availableTime: number): Promise<{
    dailyPlan: Array<{subject: string, time: number, tasks: string[]}>;
    weeklyGoals: string[];
    tips: string[];
  }> {
    if (!this.apiKey) {
      return this.generateBasicStudyPlan(subjects, availableTime);
    }

    try {
      const prompt = `Crea un plan de estudio personalizado para las siguientes materias: ${subjects.join(', ')}. Tiempo disponible: ${availableTime} minutos por día. Incluye:\n1. Plan diario con tiempo por materia\n2. Metas semanales\n3. Consejos de estudio\nResponde en JSON.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Eres un tutor educativo especializado en crear planes de estudio efectivos. Responde siempre en español.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('Error en la API de OpenAI');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Respuesta vacía de la IA');
      }

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.error('Error parseando plan de estudio:', error);
      }

      return this.generateBasicStudyPlan(subjects, availableTime);
    } catch (error) {
      console.error('Error generando plan de estudio con IA:', error);
      return this.generateBasicStudyPlan(subjects, availableTime);
    }
  }

  private generateBasicStudyPlan(subjects: string[], availableTime: number): {
    dailyPlan: Array<{subject: string, time: number, tasks: string[]}>;
    weeklyGoals: string[];
    tips: string[];
  } {
    const timePerSubject = Math.floor(availableTime / subjects.length);
    
    const dailyPlan = subjects.map(subject => ({
      subject,
      time: timePerSubject,
      tasks: [
        'Revisar apuntes anteriores',
        'Leer nuevo material',
        'Hacer ejercicios prácticos',
        'Crear resumen personal'
      ]
    }));

    const weeklyGoals = [
      'Completar al menos 3 sesiones de estudio por materia',
      'Crear resúmenes de los temas principales',
      'Resolver ejercicios de práctica',
      'Repasar material de la semana anterior'
    ];

    const tips = [
      'Estudia en sesiones de 25 minutos con descansos de 5 minutos',
      'Usa técnicas de repaso espaciado',
      'Crea mapas mentales para visualizar conceptos',
      'Practica explicando los conceptos a otros'
    ];

    return { dailyPlan, weeklyGoals, tips };
  }
} 