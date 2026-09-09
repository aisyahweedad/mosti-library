export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const BASE_URL = (process.env.LLM_BASE_URL ?? "").replace(/\/+$/, "");
const API_KEY = process.env.LLM_API_KEY ?? "";
const CHAT_MODEL = process.env.LLM_MODEL ?? "";
const EMBED_MODEL = process.env.EMBED_MODEL ?? "";

export function llmConfigured() {
  return Boolean(BASE_URL && API_KEY && CHAT_MODEL && EMBED_MODEL);
}

function assertConfigured() {
  if (!BASE_URL || !API_KEY) {
    throw new Error("Pintu gerbang LLM belum dikonfigurasi (LLM_BASE_URL/LLM_API_KEY).");
  }
  if (!CHAT_MODEL || !EMBED_MODEL) {
    throw new Error("Model LLM/embedding belum ditetapkan (LLM_MODEL/EMBED_MODEL).");
  }
}

const MAX_RETRIES = 9;

async function postJson(path: string, payload: unknown) {
  assertConfigured();
  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 429 || res.status >= 500) {
        const text = await res.text().catch(() => "");
        lastErr = new Error(`LiteLLM ${res.status}: ${text.slice(0, 300)}`);
      } else if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`LiteLLM ${res.status}: ${text.slice(0, 300)}`);
      } else {
        return res;
      }
    } catch (err) {
      lastErr = err;
    }
    if (attempt < MAX_RETRIES) {
      const delay = Math.min(3000 * Math.pow(2, attempt), 60000);
      console.warn(
        `[ai] ${path} percubaan ${attempt + 1}/${MAX_RETRIES + 1} gagal, semula dalam ${Math.round(delay / 1000)}s`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

/** Embed a batch of texts via the OpenAI-compatible /v1/embeddings endpoint. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const res = await postJson("/v1/embeddings", {
    model: EMBED_MODEL,
    input: texts,
  });
  const data = (await res.json()) as {
    data: Array<{ index: number; embedding: number[] }>;
  };
  data.data.sort((a, b) => a.index - b.index);
  return data.data.map((d) => d.embedding);
}

/** Non-streaming chat completion, returns the assistant's full text. */
export async function chatCompletion(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const res = await postJson("/v1/chat/completions", {
    model: CHAT_MODEL,
    messages,
    stream: false,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 1024,
  });
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}

/** Streaming chat completion that yields content deltas as they arrive. */
export async function* streamChatCompletion(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {}
): AsyncGenerator<string> {
  const res = await postJson("/v1/chat/completions", {
    model: CHAT_MODEL,
    messages,
    stream: true,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 2048,
  });
  if (!res.body) throw new Error("Respons daripada LiteLLM tiada body.");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nl = buffer.indexOf("\n");
      while (nl >= 0) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (line.startsWith("data:")) {
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") return;
          try {
            const json = JSON.parse(payload) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const delta = json.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta.length > 0) yield delta;
          } catch {
            // skip keep-alive or malformed frames
          }
        }
        nl = buffer.indexOf("\n");
      }
    }
  } finally {
    reader.releaseLock();
  }
}
