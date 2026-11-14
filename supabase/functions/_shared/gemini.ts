import { FunctionError } from './errors.ts';

const apiKey = () => Deno.env.get('GEMINI_API_KEY');
const embeddingModel = 'text-embedding-004';
const generationModel = 'gemini-2.0-flash';

async function geminiRequest(path: string, body: unknown): Promise<Record<string, unknown>> {
  const key = apiKey();
  if (!key) throw new FunctionError(500, 'AI_NOT_CONFIGURED', 'The AI provider is not configured.');
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${path}?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (response.status === 429) {
    throw new FunctionError(429, 'RATE_LIMITED', 'The AI Chat Assistant is temporarily unavailable.', null, 'Try again later.');
  }
  if (!response.ok) {
    const detail = await response.text();
    throw new FunctionError(502, 'AI_PROVIDER_ERROR', 'The AI provider request failed.', detail);
  }
  return await response.json() as Record<string, unknown>;
}

export async function embedText(text: string): Promise<string> {
  const result = await geminiRequest(`models/${embeddingModel}:embedContent`, {
    model: `models/${embeddingModel}`,
    content: { parts: [{ text }] },
  });
  const values = (result.embedding as { values?: unknown } | undefined)?.values;
  if (!Array.isArray(values) || values.some((value) => typeof value !== 'number')) {
    throw new FunctionError(502, 'AI_PROVIDER_ERROR', 'The AI provider returned an invalid embedding.');
  }
  return `[${values.join(',')}]`;
}

export async function generateAnswer(prompt: string): Promise<string> {
  const result = await geminiRequest(`models/${generationModel}:generateContent`, {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2 },
  });
  const candidates = result.candidates as Array<{ content?: { parts?: Array<{ text?: unknown }> } }> | undefined;
  const answer = candidates?.[0]?.content?.parts?.map((part) => part.text).filter((text): text is string => typeof text === 'string').join('');
  if (!answer) throw new FunctionError(502, 'AI_PROVIDER_ERROR', 'The AI provider returned an empty response.');
  return answer;
}
