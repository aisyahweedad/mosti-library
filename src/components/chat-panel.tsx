"use client";

import * as React from "react";
import { useChat } from "ai/react";
import { Bot, Send, Square, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ScrollArea,
} from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function ChatPanel({
  thesisId,
  thesisTitle,
}: {
  thesisId: number;
  thesisTitle: string;
}) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
  } = useChat({
    api: "/api/chat",
    body: { thesis: { id: thesisId } },
    initialMessages: [
      {
        id: "greeting",
        role: "assistant",
        content:
          `Saya telah membaca abstrak "${thesisTitle}". Tanya saya tentang metodologi, dapatan, atau kata kunci tesis ini.`,
      },
    ],
  });
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  return (
    <div className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col">
          <span className="text-sm font-semibold">Tanya AI</span>
          <span className="text-xs text-muted-foreground">
            Jawapan menjana secara langsung · berasaskan dokumen
          </span>
        </div>
        <span className="relative flex h-2.5 w-2.5">
          {isLoading && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          )}
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
        </span>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex items-start gap-3",
                m.role === "user" && "flex-row-reverse"
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback
                  className={cn(
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-accent-foreground"
                  )}
                >
                  {m.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "rounded-tr-sm bg-primary text-primary-foreground"
                    : "rounded-tl-sm border border-border bg-muted/40 text-foreground"
                )}
              >
                {m.content}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-accent text-accent-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-1.5 rounded-2xl rounded-tl-sm border border-border bg-muted/40 px-4 py-3.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border bg-muted/30 p-3"
      >
        <Input
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          placeholder="cth. Apakah dapatan utama kajian ini?"
          className="bg-background"
          disabled={isLoading}
        />
        {isLoading ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label="Hentikan"
            onClick={stop}
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label="Hantar soalan"
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </form>
    </div>
  );
}
