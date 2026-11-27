import { FunctionError } from './errors.ts';

const apiKey = () => Deno.env.get('GEMINI_API_KEY');
const embeddingModel = () => Deno.env.get('GEMINI_EMBEDDING_MODEL') || 'gemini-embedding-001';
const generationModel = () => Deno.env.get('GEMINI_GENERATION_MODEL') || 'gemini-3.1-flash-lite';
const EMBEDDING_DIMENSIONS = 768;

async function geminiRequest(path: string, body: unknown): Promise<Record<string, unknown>> {
  const key = apiKey();
  if (!key) throw new FunctionError(500, 'AI_NOT_CONFIGURED', 'The AI provider is not configured.');
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': key,
    },
    body: JSON.stringify(body),
  });
  if (response.status === 429) {
    throw new FunctionError(429, 'RATE_LIMITED', 'The AI Chat Assistant is temporarily unavailable.', null, 'Try again later.');
  }
  if (!response.ok) {
    const providerBody = await response.text();
    console.error(`Gemini API request failed (${response.status}):`, providerBody.slice(0, 500));
    throw new FunctionError(502, 'AI_PROVIDER_ERROR', 'The AI provider request failed.');
  }
  return await response.json() as Record<string, unknown>;
}

export async function embedText(text: string): Promise<string> {
  const model = embeddingModel();
  const result = await geminiRequest(`models/${model}:embedContent`, {
    model: `models/${model}`,
    content: { parts: [{ text }] },
    outputDimensionality: EMBEDDING_DIMENSIONS,
  });
  const values = (result.embedding as { values?: unknown } | undefined)?.values;
  if (!Array.isArray(values) || values.length !== EMBEDDING_DIMENSIONS ||
    values.some((value) => typeof value !== 'number' || !Number.isFinite(value))) {
    throw new FunctionError(502, 'AI_PROVIDER_ERROR', 'The AI provider returned an invalid embedding.');
  }
  return `[${values.join(',')}]`;
}

export async function generateAnswer(prompt: string): Promise<string> {
  const model = generationModel();
  const result = await geminiRequest(`models/${model}:generateContent`, {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2 },
  });
  const candidates = result.candidates as Array<{ content?: { parts?: Array<{ text?: unknown }> } }> | undefined;
  const answer = candidates?.[0]?.content?.parts?.map((part) => part.text).filter((text): text is string => typeof text === 'string').join('');
  if (!answer) throw new FunctionError(502, 'AI_PROVIDER_ERROR', 'The AI provider returned an empty response.');
  return answer;
}
