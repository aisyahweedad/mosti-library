"use client";

import * as React from "react";
import { Bot } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

type ChatPanelProps = {
  thesisId: string;
  thesisTitle: string;
};

export function LazyChatPanel({
  thesisId,
  thesisTitle,
}: ChatPanelProps) {
  const [ChatPanel, setChatPanel] = React.useState<
    React.ComponentType<ChatPanelProps> | null
  >(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      import("@/components/chat-panel").then((mod) =>
        setChatPanel(() => mod.ChatPanel)
      );
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          import("@/components/chat-panel").then((mod) =>
            setChatPanel(() => mod.ChatPanel)
          );
        }
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-[520px]">
      {ChatPanel ? (
        <ChatPanel thesisId={thesisId} thesisTitle={thesisTitle} />
      ) : (
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
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
          </div>
          <div className="flex flex-1 flex-col justify-end gap-3 p-4">
            <Skeleton className="h-16 w-4/5 rounded-2xl" />
            <Skeleton className="h-10 w-2/5 rounded-2xl" />
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}
