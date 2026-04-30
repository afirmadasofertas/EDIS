"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp01Icon,
  Copy01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/icon";
import { EdisLogo } from "@/components/layout/edis-logo";
import { cn } from "@/lib/utils";

type Role = "user" | "assistant";
type Message = { id: string; role: Role; content: string };

export default function CrowAIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  function newId(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    setError(null);

    const userMsg: Message = { id: newId("u"), role: "user", content: trimmed };
    const assistantMsg: Message = {
      id: newId("a"),
      role: "assistant",
      content: "",
    };

    const next = [...messages, userMsg, assistantMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/crowai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next
            .filter((m) => m.id !== assistantMsg.id)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: m.content + chunk }
              : m
          )
        );
      }
    } catch (err) {
      setError((err as Error).message);
      // Drop the empty assistant placeholder if streaming failed.
      setMessages((prev) => prev.filter((m) => m.id !== assistantMsg.id));
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    send(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function reset() {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  }

  return (
    <div className="relative mx-auto flex h-[calc(100vh-7rem)] w-full max-w-3xl flex-col gap-3">
      {/* Floating reset — only appears once a conversation exists. */}
      {messages.length > 0 && (
        <button
          type="button"
          onClick={reset}
          aria-label="Nova conversa"
          title="Nova conversa"
          className="absolute right-0 top-0 flex size-7 items-center justify-center rounded-md border border-edis-line-2 bg-edis-ink-2 text-edis-text-3 transition-colors hover:bg-edis-ink-3 hover:text-foreground"
        >
          <Icon icon={RefreshIcon} size={12} />
        </button>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-4 overflow-y-auto pr-2"
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} streaming={streaming} />)
        )}

        {error && (
          <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-400">
            {error}
          </p>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 rounded-xl border border-edis-line-2 bg-edis-ink-2 p-2"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pede copy, hook, headline, body — ou pergunta sobre estratégia."
          rows={1}
          className="
            min-h-[40px] max-h-[160px] flex-1 resize-none bg-transparent
            px-2 py-2 text-[14px] leading-snug text-foreground
            placeholder:text-edis-text-4 focus:outline-none
          "
        />
        <button
          type="submit"
          disabled={!input.trim() || streaming}
          aria-label="Enviar"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md transition-colors",
            input.trim() && !streaming
              ? "bg-primary text-primary-foreground hover:bg-[#33eb8c]"
              : "bg-edis-ink-3 text-edis-text-4"
          )}
        >
          <Icon icon={ArrowUp01Icon} size={16} strokeWidth={2.25} />
        </button>
      </form>
    </div>
  );
}

function MessageBubble({
  message,
  streaming,
}: {
  message: Message;
  streaming: boolean;
}) {
  const isUser = message.role === "user";
  const isLastEmpty = !isUser && message.content === "" && streaming;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message.content);
    } catch {
      // ignore
    }
  }

  return (
    <div
      className={cn(
        "group flex flex-col gap-1",
        isUser ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[14px] leading-[1.55]",
          isUser
            ? "bg-edis-ink-3 text-foreground"
            : "bg-edis-mint/5 text-edis-text-1 ring-1 ring-edis-mint/15"
        )}
      >
        {isLastEmpty ? (
          <span className="inline-flex items-center gap-2 text-edis-text-4">
            <span className="edis-raven-loop inline-flex">
              <EdisLogo variant="mark" size={16} />
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.16em]">
              escrevendo
            </span>
          </span>
        ) : (
          message.content
        )}
      </div>

      {!isUser && message.content.length > 0 && (
        <button
          type="button"
          onClick={copy}
          aria-label="Copiar mensagem"
          className="ml-1 flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-edis-text-4 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        >
          <Icon icon={Copy01Icon} size={10} />
          Copiar
        </button>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-12 text-center">
      {/* Raven mark — sparkles loop continuously to give the surface a
          subtle sign of life before the user types anything. */}
      <div className="edis-raven-loop relative grid place-items-center">
        <span
          aria-hidden
          className="absolute inset-0 -m-6 rounded-full bg-edis-mint/10 blur-2xl"
        />
        <EdisLogo variant="mark" size={56} />
      </div>
      <div className="flex flex-col gap-1.5">
        <h2
          className="font-display text-[22px] font-medium tracking-tight text-foreground"
          style={{ letterSpacing: "-0.02em" }}
        >
          Pergunta o que quiser sobre copy.
        </h2>
        <p className="max-w-md text-[13.5px] leading-[1.55] text-edis-text-3">
          Hooks, headlines, body, reescrita, estratégia — conversa direto.
          Voz brasileira, sem cara de IA.
        </p>
      </div>
    </div>
  );
}
