"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Send,
  ArrowLeft,
  Bot,
  User,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Key,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { visaSubclasses, visaCategories } from "@/lib/visa-data";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
  streaming?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  "Which visa lets me work permanently in Australia?",
  "What is the fastest pathway for a skilled worker?",
  "Can I bring my family on a student visa?",
  "How do I get PR from a Subclass 482 visa?",
  "What's the difference between 189 and 190?",
  "I just graduated from an Australian uni — what are my options?",
];

const BADGE_VARIANT_MAP: Record<
  string,
  | "info"
  | "purple"
  | "success"
  | "warning"
  | "sky"
  | "rose"
  | "orange"
  | "secondary"
> = {
  skilled: "info",
  employer: "purple",
  regional: "success",
  graduate: "success",
  student: "warning",
  visitor: "sky",
  family: "rose",
  "working-holiday": "orange",
  temporary: "secondary",
};

// ─── Markdown renderer ────────────────────────────────────────────────────────

function inlineBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-slate-900">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

function MarkdownContent({
  content,
  streaming,
}: {
  content: string;
  streaming?: boolean;
}) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h3
          key={i}
          className="mb-1.5 mt-4 text-sm font-bold text-slate-900 first:mt-0"
        >
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h4
          key={i}
          className="mb-1 mt-3 text-sm font-semibold text-slate-800 first:mt-0"
        >
          {line.slice(4)}
        </h4>
      );
    } else if (/^[*-] /.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[*-] /.test(lines[i])) {
        items.push(
          <li key={i} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
            <span>{inlineBold(lines[i].slice(2))}</span>
          </li>
        );
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-1">
          {items}
        </ul>
      );
      continue;
    } else if (/^\d+\. /.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const m = lines[i].match(/^(\d+)\. (.+)/);
        if (m) {
          items.push(
            <li key={i} className="flex gap-2">
              <span className="shrink-0 font-semibold text-blue-600">
                {m[1]}.
              </span>
              <span>{inlineBold(m[2])}</span>
            </li>
          );
        }
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-1">
          {items}
        </ol>
      );
      continue;
    } else if (line.trim() === "") {
      if (i > 0 && lines[i - 1].trim() !== "") {
        elements.push(<div key={i} className="h-2" />);
      }
    } else {
      elements.push(
        <p key={i} className="text-slate-700">
          {inlineBold(line)}
        </p>
      );
    }
    i++;
  }

  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {elements}
      {streaming && (
        <span className="inline-block h-4 w-0.5 animate-pulse rounded-full bg-blue-500" />
      )}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const isEmpty = !message.content && !message.isError;

  return (
    <div
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm",
          isUser
            ? "bg-gradient-to-br from-blue-600 to-indigo-600"
            : message.isError
            ? "bg-red-100"
            : "bg-gradient-to-br from-slate-700 to-slate-900"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : message.isError ? (
          <AlertCircle className="h-4 w-4 text-red-500" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-4 py-3 shadow-sm",
          isUser
            ? "rounded-tr-sm bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm"
            : message.isError
            ? "rounded-tl-sm border border-red-200 bg-red-50 text-red-700 text-sm"
            : "rounded-tl-sm border border-slate-200 bg-white"
        )}
      >
        {isEmpty ? (
          /* Typing dots */
          <div className="flex items-center gap-1 py-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:300ms]" />
          </div>
        ) : isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        ) : message.isError ? (
          <p className="leading-relaxed">{message.content}</p>
        ) : (
          <MarkdownContent
            content={message.content}
            streaming={message.streaming}
          />
        )}
      </div>
    </div>
  );
}

// ─── API key banner ───────────────────────────────────────────────────────────

function ApiKeyBanner() {
  return (
    <div className="mx-4 mb-3 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <Key className="h-4 w-4 shrink-0 text-amber-600" />
      <div className="min-w-0 flex-1">
        <span className="font-semibold">API key not configured.</span>{" "}
        <span className="text-amber-700">
          Use{" "}
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-semibold underline hover:text-amber-900"
          >
            Groq (free)
            <ExternalLink className="h-3 w-3" />
          </a>
          {" "}or Anthropic — click Set up to connect.
        </span>
      </div>
      <Link href="/setup">
        <Button size="sm" variant="default" className="shrink-0 gap-1.5 bg-amber-600 hover:bg-amber-700">
          <Key className="h-3.5 w-3.5" />
          Set up API key
        </Button>
      </Link>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string>("AI Advisor");

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const didAutoSend = useRef(false);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      const assistantMsgId = `a-${Date.now()}`;
      const assistantPlaceholder: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        streaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
      setInput("");
      setLoading(true);
      setApiKeyMissing(false);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "44px";
      }

      try {
        // Build history (exclude the placeholder we just added)
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        history.push({ role: "user", content: trimmed });

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        // Pick up provider label from response header
        const providerLabel = res.headers.get("X-AI-Provider");
        if (providerLabel) setActiveProvider(providerLabel);

        // Non-stream error (401, 400, 500 from route handler)
        if (!res.ok) {
          let errText = "Something went wrong. Please try again.";
          let needsSetup = false;
          try {
            const j = await res.json();
            if (j.error) errText = j.error;
            if (j.needsSetup) needsSetup = true;
          } catch {}

          if (res.status === 401 || needsSetup) {
            setApiKeyMissing(true);
            errText = "API key is not configured. Click 'Set up API key' above to fix this.";
          }

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: errText, isError: true, streaming: false }
                : m
            )
          );
          return;
        }

        if (!res.body) throw new Error("Response body is null");

        // ── Read SSE stream ──────────────────────────────────────────────────
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let done = false;

        while (!done) {
          const { done: readerDone, value } = await reader.read();
          if (readerDone) break;

          const raw = decoder.decode(value, { stream: true });

          // Split on SSE boundary (double newline)
          const events = raw.split(/\n\n/);
          for (const evt of events) {
            const line = evt.trim();
            if (!line.startsWith("data: ")) continue;

            const payload = line.slice(6).trim();
            try {
              const parsed = JSON.parse(payload);

              if (parsed.error) {
                // Surface stream-level errors
                const errMsg = parsed.error as string;
                if (
                  errMsg.toLowerCase().includes("api key") ||
                  errMsg.toLowerCase().includes("authentication")
                ) {
                  setApiKeyMissing(true);
                }
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: errMsg,
                          isError: true,
                          streaming: false,
                        }
                      : m
                  )
                );
                done = true;
                break;
              }

              if (parsed.done) {
                // Normal completion
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, streaming: false } : m
                  )
                );
                done = true;
                break;
              }

              if (typeof parsed.text === "string") {
                accumulated += parsed.text;
                const snapshot = accumulated;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: snapshot, streaming: true }
                      : m
                  )
                );
              }
            } catch {
              // skip malformed JSON chunk
            }
          }
        }

        // Ensure streaming flag is cleared even on unexpected EOF
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId && m.streaming
              ? {
                  ...m,
                  streaming: false,
                  content: m.content || "No response received.",
                }
              : m
          )
        );
      } catch (err) {
        console.error("[chat] sendMessage error:", err);
        const errMsg =
          err instanceof Error ? err.message : "Unknown error occurred.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: errMsg,
                  isError: true,
                  streaming: false,
                }
              : m
          )
        );
      } finally {
        setLoading(false);
        textareaRef.current?.focus();
      }
    },
    [messages, loading]
  );

  // Fire initial question from URL param (once)
  useEffect(() => {
    if (initialQ && !didAutoSend.current) {
      didAutoSend.current = true;
      sendMessage(initialQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "44px";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const resetChat = () => {
    setMessages([]);
    setInput("");
    setApiKeyMissing(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "flex flex-col border-r border-slate-200 bg-white transition-all duration-300",
          sidebarOpen ? "w-72" : "w-0 overflow-hidden",
          "md:w-72 md:overflow-visible"
        )}
      >
        {/* min-w keeps content from collapsing during open/close transition */}
        <div className="flex min-w-[288px] flex-1 flex-col overflow-hidden">
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <span className="text-[10px] font-black tracking-tight text-white">VG</span>
              </div>
              <span className="font-bold text-slate-900">VisaGuide</span>
            </div>
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500">
                <ArrowLeft className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Visa list */}
          <ScrollArea className="flex-1 p-2">
            <p className="mb-1 px-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Visa Subclasses
            </p>
            <div className="space-y-px">
              {visaSubclasses.map((visa) => {
                const variant = BADGE_VARIANT_MAP[visa.category] ?? "secondary";
                const categoryShort = visaCategories[visa.category]?.label ?? "";
                // Show first word capped at 8 chars
                const badgeText = categoryShort.split(" ")[0].slice(0, 8);
                return (
                  <button
                    key={visa.subclass}
                    disabled={loading}
                    onClick={() =>
                      sendMessage(
                        `Tell me about the Subclass ${visa.subclass} ${visa.name} visa`
                      )
                    }
                    className="flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50"
                  >
                    {/* Row 1: number + PR indicator + badge */}
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-700 tabular-nums">
                          {visa.subclass}
                        </span>
                        {visa.pathwayToPR && (
                          <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                        )}
                      </div>
                      <Badge
                        variant={variant}
                        className="shrink-0 px-1.5 py-0 text-[9px] font-bold"
                      >
                        {badgeText}
                      </Badge>
                    </div>
                    {/* Row 2: full visa name */}
                    <span className="block w-full truncate text-xs text-slate-500">
                      {visa.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Sidebar footer */}
          <div className="border-t border-slate-100 p-3">
            <p className="px-1 text-[10px] leading-relaxed text-slate-400">
              General information only. Consult a{" "}
              <a
                href="https://www.mara.gov.au"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                MARA agent
              </a>{" "}
              for legal advice.
            </p>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                sidebarOpen && "rotate-180"
              )}
            />
          </button>

          <div className="flex flex-1 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 shadow-sm">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-900">
                VisaGuide — AI Advisor
              </h1>
              <p className="text-xs text-slate-400">
                Australian visa guidance · {activeProvider}
              </p>
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-1.5 text-xs text-blue-600">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Thinking…</span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={resetChat}
            className="gap-1.5 text-slate-500 hover:text-slate-900"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New chat</span>
          </Button>
        </header>

        {/* API key banner */}
        {apiKeyMissing && <ApiKeyBanner />}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-200">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-slate-900">
                Ask anything about Australian visas
              </h2>
              <p className="mb-8 max-w-md text-sm text-slate-500">
                Eligibility, processing times, costs, PR pathways — I cover all
                15 major visa subclasses.
              </p>
              <div className="grid max-w-xl gap-2 sm:grid-cols-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    disabled={loading}
                    onClick={() => sendMessage(prompt)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-600 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message list */
            <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-3xl items-end gap-2"
          >
            <textarea
              ref={textareaRef}
              value={input}
              rows={1}
              disabled={loading}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize(e.target);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about an Australian visa… (Enter to send · Shift+Enter for newline)"
              className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
              style={{ minHeight: "44px", maxHeight: "160px" }}
            />
            <Button
              type="submit"
              variant="primary"
              size="icon"
              disabled={!input.trim() || loading}
              className="h-11 w-11 shrink-0 shadow-md shadow-blue-200 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="mt-2 text-center text-[11px] text-slate-400">
            VisaGuide provides general information only · Not legal advice ·
            Powered by {activeProvider}
          </p>
        </div>
      </div>
    </div>
  );
}
