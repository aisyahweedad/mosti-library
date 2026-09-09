"use client";

import * as React from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

let msgSeq = 0;
function nextId() {
  return `msg-${Date.now()}-${msgSeq++}`;
}

type UseChatStreamOptions = {
  api: string;
  body?: Record<string, unknown>;
  initialMessages?: ChatMessage[];
};

/**
 * Minimal streaming chat hook that talks directly to the app's own SSE
 * endpoint (same wire format the backend already emits: `0:{json}` deltas
 * and `d:{json}` completion markers). Replaces the `ai/react` SDK.
 */
export function useChatStream({
  api,
  body,
  initialMessages = [],
}: UseChatStreamOptions) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);
  const bodyRef = React.useRef(body);
  bodyRef.current = body;

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value),
    []
  );

  const stop = React.useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || isLoading) return;

      const nextMessages: ChatMessage[] = [
        ...messages,
        { id: nextId(), role: "user", content: text },
        { id: nextId(), role: "assistant", content: "" },
      ];
      setMessages(nextMessages);
      setInput("");
      setIsLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(bodyRef.current ?? {}),
            messages: nextMessages
              .filter((m) => m.content.length > 0)
              .map(({ role, content }) => ({ role, content })),
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const detail = await res.text().catch(() => "");
          throw new Error(detail || `HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let nl: number;
          while ((nl = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, nl).replace(/\r$/, "");
            buffer = buffer.slice(nl + 1);
            if (line.startsWith("0:")) {
              const delta = JSON.parse(line.slice(2)) as string;
              if (typeof delta !== "string") continue;
              setMessages((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last && last.role === "assistant") {
                  next[next.length - 1] = {
                    ...last,
                    content: last.content + delta,
                  };
                } else {
                  next.push({ id: nextId(), role: "assistant", content: delta });
                }
                return next;
              });
            } else if (line.startsWith("d:")) {
              break;
            }
          }
        }
      } catch {
        if (!controller.signal.aborted) {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === "assistant" && last.content === "") {
              next[next.length - 1] = {
                ...last,
                content: "Maaf, berlaku ralat semasa menanyakan AI. Sila cuba lagi.",
              };
            }
            return next;
          });
        }
      } finally {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last && last.role === "assistant" && last.content === "") {
            next[next.length - 1] = { ...last, content: "Tiada respons." };
          }
          return next;
        });
        abortRef.current = null;
        setIsLoading(false);
      }
    },
    [api, input, isLoading, messages]
  );

  return { messages, input, handleInputChange, handleSubmit, isLoading, stop };
}
