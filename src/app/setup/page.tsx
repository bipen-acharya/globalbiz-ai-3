"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ArrowRight,
  Zap,
  Star,
  Copy,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Provider = "groq" | "anthropic";
type Step = "enter" | "validating" | "success" | "error";

interface ProviderInfo {
  id: Provider;
  name: string;
  model: string;
  badge: string;
  badgeColor: string;
  free: boolean;
  keyPrefix: string;
  keyPlaceholder: string;
  consoleUrl: string;
  keysUrl: string;
  description: string;
  speed: string;
  steps: { label: string; href: string; cta: string }[];
}

const PROVIDERS: ProviderInfo[] = [
  {
    id: "groq",
    name: "Groq",
    model: "Llama 3.3 70B",
    badge: "FREE",
    badgeColor: "bg-emerald-100 text-emerald-700",
    free: true,
    keyPrefix: "gsk_",
    keyPlaceholder: "gsk_...",
    consoleUrl: "https://console.groq.com",
    keysUrl: "https://console.groq.com/keys",
    description: "100% free tier · Ultra-fast · Llama 3.3 70B",
    speed: "~0.5s response",
    steps: [
      { label: "Sign up (no credit card needed)", href: "https://console.groq.com", cta: "console.groq.com" },
      { label: "Go to API Keys and create a key", href: "https://console.groq.com/keys", cta: "API Keys →" },
      { label: "Paste below and activate", href: "#", cta: "" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    model: "Claude claude-opus-4-6",
    badge: "PAID",
    badgeColor: "bg-blue-100 text-blue-700",
    free: false,
    keyPrefix: "sk-ant-",
    keyPlaceholder: "sk-ant-api03-...",
    consoleUrl: "https://console.anthropic.com",
    keysUrl: "https://console.anthropic.com/settings/keys",
    description: "Highest quality · claude-opus-4-6 · ~$0.01/message",
    speed: "~2s response",
    steps: [
      { label: "Create account & add billing", href: "https://console.anthropic.com", cta: "console.anthropic.com" },
      { label: "Generate an API key", href: "https://console.anthropic.com/settings/keys", cta: "API Keys →" },
      { label: "Paste below and activate", href: "#", cta: "" },
    ],
  },
];

export default function SetupPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Provider>("groq");
  const [apiKey, setApiKey] = useState("");
  const [step, setStep] = useState<Step>("enter");
  const [errorMsg, setErrorMsg] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const provider = PROVIDERS.find((p) => p.id === selected)!;

  const isValidFormat =
    apiKey.startsWith(provider.keyPrefix) && apiKey.length > 20;

  function switchProvider(p: Provider) {
    setSelected(p);
    setApiKey("");
    setStep("enter");
    setErrorMsg("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidFormat) return;

    setStep("validating");
    setErrorMsg("");

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: selected, apiKey }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setStep("error");
        return;
      }

      setStep("success");
      setTimeout(() => router.push("/chat"), 2200);
    } catch {
      setErrorMsg("Network error — is the dev server running?");
      setStep("error");
    }
  }

  function copyEnvLine() {
    const line =
      selected === "groq"
        ? "GROQ_API_KEY=gsk_YOUR_KEY_HERE"
        : "ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE";
    navigator.clipboard.writeText(line);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 px-4 py-12">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
          <span className="text-[13px] font-black tracking-tight text-white">VG</span>
        </div>
        <span className="text-xl font-bold text-slate-900">VisaGuide</span>
      </Link>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Connect an AI provider</h1>
          <p className="mt-1 text-sm text-slate-500">
            Choose Groq for a completely free experience, or Anthropic for the highest quality.
          </p>
        </div>

        {/* Provider selector */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => switchProvider(p.id)}
              className={cn(
                "relative flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition-all duration-150",
                selected === p.id
                  ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span className="font-bold text-slate-900">{p.name}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    p.badgeColor
                  )}
                >
                  {p.badge}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-600">{p.model}</span>
              <span className="text-xs text-slate-400">{p.speed}</span>
              {p.free && (
                <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <Zap className="h-3 w-3" />
                  No credit card required
                </div>
              )}
              {selected === p.id && (
                <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-100">
          {/* Card header */}
          <div className="border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  provider.free ? "bg-emerald-50" : "bg-blue-50"
                )}
              >
                <Key
                  className={cn(
                    "h-4 w-4",
                    provider.free ? "text-emerald-600" : "text-blue-600"
                  )}
                />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">
                  Set up {provider.name}
                </h2>
                <p className="text-xs text-slate-500">{provider.description}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            {/* Success */}
            {step === "success" ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="mb-1 font-bold text-slate-900">
                  {provider.name} connected!
                </h3>
                <p className="text-sm text-slate-500">
                  Redirecting to chat…
                </p>
                <div className="mt-4 flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                </div>
              </div>
            ) : (
              <>
                {/* Steps */}
                <div className="mb-5 space-y-3">
                  {provider.steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          provider.free
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        )}
                      >
                        {i + 1}
                      </div>
                      <span className="flex-1 text-sm text-slate-600">
                        {s.label}
                      </span>
                      {s.href !== "#" && (
                        <a
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "flex items-center gap-1 text-xs font-semibold",
                            provider.free
                              ? "text-emerald-600 hover:text-emerald-800"
                              : "text-blue-600 hover:text-blue-800"
                          )}
                        >
                          {s.cta}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>

                {/* Key input */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Paste your {provider.name} API key
                    </label>
                    <div className="relative">
                      <input
                        type={showKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value.trim());
                          if (step === "error") setStep("enter");
                        }}
                        placeholder={provider.keyPlaceholder}
                        spellCheck={false}
                        autoComplete="off"
                        className={cn(
                          "w-full rounded-xl border px-4 py-3 pr-20 font-mono text-sm outline-none transition-all",
                          step === "error"
                            ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100"
                            : isValidFormat
                            ? "border-emerald-300 bg-emerald-50 focus:ring-2 focus:ring-emerald-100"
                            : "border-slate-200 bg-slate-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-slate-400 hover:text-slate-700"
                      >
                        {showKey ? "Hide" : "Show"}
                      </button>
                    </div>

                    {/* Feedback */}
                    {apiKey && !isValidFormat && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-amber-600">
                        <AlertCircle className="h-3 w-3" />
                        Should start with{" "}
                        <code className="font-mono">{provider.keyPrefix}</code>
                      </p>
                    )}
                    {isValidFormat && step !== "error" && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Format looks correct — click Activate to verify
                      </p>
                    )}
                    {step === "error" && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {errorMsg}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className={cn(
                      "w-full gap-2",
                      provider.free
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    )}
                    disabled={!isValidFormat || step === "validating"}
                  >
                    {step === "validating" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Validating with {provider.name}…
                      </>
                    ) : step === "error" ? (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Try again
                      </>
                    ) : (
                      <>
                        {provider.free ? (
                          <Zap className="h-4 w-4" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                        Activate VisaGuide with {provider.name}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Manual fallback */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white/80 px-5 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Manual setup
          </p>
          <p className="mb-2 text-xs text-slate-500">
            Edit <code className="font-mono text-[11px] bg-slate-100 px-1 rounded">.env.local</code> in the project root and add:
          </p>
          <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-900 px-4 py-2.5">
            <code className="truncate font-mono text-xs text-emerald-400">
              {selected === "groq"
                ? "GROQ_API_KEY=gsk_YOUR_KEY"
                : "ANTHROPIC_API_KEY=sk-ant-YOUR_KEY"}
            </code>
            <button
              onClick={copyEnvLine}
              className="shrink-0 rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
            >
              {copied ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Then restart <code className="font-mono text-[11px]">npm run dev</code> for env changes to take effect.
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/chat"
            className="text-sm text-slate-400 hover:text-slate-700"
          >
            Skip — already configured
          </Link>
        </div>
      </div>
    </div>
  );
}
