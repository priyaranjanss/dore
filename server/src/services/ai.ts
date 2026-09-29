export const streamAIResponse = async (
  messages: { role: 'user' | 'assistant'; content: string }[],
  onChunk: (chunk: string) => void
): Promise<void> => {
  const API_KEY = process.env.AI_API_KEY || '';
  const MODEL = process.env.AI_MODEL || '';
  const ENDPOINT = process.env.AI_API_ENDPOINT || '';

  if (!API_KEY) throw new Error('AI_API_KEY is not configured.');
  if (!MODEL) throw new Error('AI_MODEL is not configured.');
  if (!ENDPOINT) throw new Error('AI_API_ENDPOINT is not configured.');

  const res = await fetch(`${ENDPOINT.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
      max_tokens: 1000,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`AI API error ${res.status}: ${errorBody}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response stream');

  const decoder = new TextDecoder();
  let buffer = '';

  const processLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data: ')) return;
    const data = trimmed.slice(6);
    if (data === '[DONE]') return;
    const parsed = JSON.parse(data);
    const content = parsed.choices?.[0]?.delta?.content || '';
    if (content) onChunk(content);
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';
    for (const line of lines) processLine(line);
    if (done) {
      if (buffer) processLine(buffer);
      break;
    }
  }
};

export const generateTitleFromMessage = (message: string): string => {
  const cleaned = message.trim().replace(/[?!.]/g, '');
  if (cleaned.length <= 50) return cleaned;
  return cleaned.slice(0, 47) + '...';
};
