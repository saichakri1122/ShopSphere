
"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ShopSphereAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi there! 👋 I'm your ShopSphere shopping assistant. I'm always here to help you find products, check your cart, and answer questions about your orders.",
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isOpen]);

  async function sendMessage(text?: string) {
    const userMessage = (text ?? message).trim();

    if (!userMessage || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", content: userMessage },
    ]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to get a response."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect right now. Please check that you're logged in and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3">
      {isOpen && (
        <section className="flex h-[min(520px,70dvh)] w-[min(370px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-[#e5e2dc] bg-white shadow-2xl">
          <header className="flex items-center gap-3 bg-[#17202a] px-4 py-4 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2e7d32] text-xl">
              ✦
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">ShopSphere AI</h2>
              <p className="text-xs text-gray-300">
                Your personal shopping assistant
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-green-300">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                Here to help you
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="rounded-lg px-2 py-1 text-xl text-gray-300 hover:bg-white/10 hover:text-white"
            >
              ×
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[#f8f7f4] p-4">
            {messages.map((item, index) => (
              <div
                key={`${index}-${item.role}`}
                className={`flex ${
                  item.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-3 text-sm leading-6 ${
                    item.role === "user"
                      ? "rounded-br-sm bg-[#17202a] text-white"
                      : "rounded-bl-sm border border-[#e5e2dc] bg-white text-[#17202a]"
                  }`}
                >
                  {item.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="w-fit rounded-2xl bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                ShopSphere AI is thinking...
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 border-t border-[#e5e2dc] bg-white px-3 pt-3">
              {[
                "Show products under ₹1,000",
                "What's in my cart?",
                "My latest order",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={loading}
                  onClick={() => sendMessage(suggestion)}
                  className="rounded-full border border-[#e5e2dc] px-3 py-2 text-xs text-[#17202a] hover:border-[#2e7d32] hover:text-[#2e7d32] disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
            className="flex items-center gap-2 border-t border-[#e5e2dc] bg-white p-3"
          >
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask me anything..."
              aria-label="Chat message"
              maxLength={2000}
              className="min-w-0 flex-1 rounded-full border border-[#e5e2dc] bg-[#f8f7f4] px-4 py-3 text-sm text-[#17202a] outline-none focus:border-[#2e7d32]"
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2e7d32] text-lg text-white transition hover:bg-[#256628] disabled:cursor-not-allowed disabled:opacity-50"
            >
              ↑
            </button>
          </form>
        </section>
      )}

      {!isOpen && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="max-w-[220px] rounded-xl border border-[#e5e2dc] bg-white px-4 py-3 text-left shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <p className="text-sm font-semibold text-[#17202a]">
              Need help shopping? 👋
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              I'm always here to help!
            </p>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open ShopSphere AI assistant"
            className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#2e7d32] text-2xl text-white shadow-xl transition hover:scale-105 hover:bg-[#256628]"
          >
            ✦
          </button>
        </div>
      )}
    </div>
  );
}
