"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp01Icon,
  Atom02Icon,
  Copy01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

type Role = "user" | "assistant";
type Message = { id: string; role: Role; content: string };

const STARTERS = [
  "Headlines pra um curso de Python pra dev junior",
  "Body PAS pra promo de Black Friday em ecommerce de moda",
  "Hooks de dor pra captura de lead — público é mãe empreendedora",
  "Reescreve isso sem cara de IA: 'Transforme sua vida com nosso método'",
];

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
    <div className="mx-auto flex h-[calc(100vh-7rem)] w-full max-w-3xl flex-col gap-3">
      <header className="flex items-center justify-between gap-3 border-b border-edis-line-1 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
            <Icon icon={Atom02Icon} size={16} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <h1
              className="font-display text-[16px] font-medium leading-tight tracking-tight text-foreground"
              style={{ letterSpacing: "-0.02em" }}
            >
              CrowAI
            </h1>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-edis-text-4">
              Copywriter direct response
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1.5 rounded-md border border-edis-line-2 bg-edis-ink-2 px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-edis-text-3 transition-colors hover:bg-edis-ink-3 hover:text-foreground"
          >
            <Icon icon={RefreshIcon} size={11} />
            Nova conversa
          </button>
        )}
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-4 overflow-y-auto pr-2"
      >
        {messages.length === 0 ? (
          <EmptyState onPick={(t) => send(t)} />
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
          <span className="inline-flex items-center gap-1 text-edis-text-4">
            <span className="size-1.5 animate-pulse rounded-full bg-edis-mint" />
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

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-12 text-center">
      <Icon icon={Atom02Icon} size={40} className="text-edis-text-3" />
      <div className="flex flex-col gap-1">
        <h2
          className="font-display text-[20px] font-medium tracking-tight text-foreground"
          style={{ letterSpacing: "-0.02em" }}
        >
          Pergunta o que quiser sobre copy.
        </h2>
        <p className="max-w-md text-[13.5px] leading-[1.55] text-edis-text-3">
          Hooks, headlines, body, reescrita, estratégia, debate de ângulo —
          conversa direto comigo. Voz brasileira, sem cara de IA.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-edis-text-4">
          Ou começa com
        </span>
        <div className="flex max-w-2xl flex-wrap justify-center gap-1.5">
          {STARTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onPick(s)}
              className="rounded-full border border-edis-line-2 bg-edis-ink-2 px-3 py-1.5 text-[12px] text-edis-text-2 transition-colors hover:border-edis-mint/40 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
