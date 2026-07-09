"use client";

/*
 * "Clarity" AI chat panel — new-conversation / welcome state (Figma node
 * 1801:9595). Always opens fresh: greeting, suggested prompts, and the
 * input pinned to the bottom. Shares the panel chrome (header, gradient,
 * width, footer) with the populated design (1801:8734).
 */

export default function ChatPanel({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-label="Clarity assistant"
      className="fixed bottom-4 right-4 z-50 flex h-[min(696px,calc(100dvh-2rem))] w-[min(595px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl shadow-[0px_8px_40px_rgba(0,0,0,0.12),0px_4px_20px_7px_rgba(0,0,0,0.06)] [background:radial-gradient(120%_90%_at_100%_0%,#ebefff_0%,#ffffff_55%)]"
    >
      {/* Header */}
      <div className="flex items-start gap-2 bg-white p-4 shadow-[0px_8px_40px_-16px_rgba(0,0,51,0.06)]">
        <div className="flex flex-1 items-center gap-2">
          <div className="flex items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/chat/clarity-logo.svg" alt="" className="size-8" />
            <span className="text-xl font-medium text-neutral-800">Clarity</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/chat/arrows-more-up.svg" alt="" className="size-6 opacity-70" />
        </div>
        <button type="button" aria-label="Close chat" onClick={onClose}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/chat/close.svg" alt="" className="size-6" />
        </button>
      </div>

      {/* Welcome / empty state */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-6 py-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-[30px] font-bold leading-tight text-neutral-800">
            Welcome to Clarity
          </h2>
          <p className="max-w-[420px] text-sm text-neutral-700">
            Get instant insights about your metrics, trends, and product evolution.
            Ask a question or start with one of the suggestions below.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              type="button"
              className="flex min-w-0 items-center gap-1 rounded-2xl border border-[#e9ecff] bg-white p-4 text-left transition-colors hover:bg-primary-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/chat/send-sm.svg" alt="" className="size-6 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-primary-600">
                Recommended prompt
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer input */}
      <div className="px-4 pb-6">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex h-[72px] items-center justify-between gap-2 rounded-2xl border-2 border-[#a3b1ff] bg-white px-4"
        >
          <input
            type="text"
            placeholder="Ask Clarity anything..."
            className="min-w-0 flex-1 bg-transparent text-base text-neutral-700 placeholder:text-neutral-700 focus:outline-none"
          />
          <button type="submit" aria-label="Send message" className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/chat/send-lg.svg" alt="" className="size-8" />
          </button>
        </form>
      </div>
    </div>
  );
}
