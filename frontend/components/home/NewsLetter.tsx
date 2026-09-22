"use client";

import { FormEvent, useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) return;

    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="border-t border-[#e5e2dc] bg-[#17202a]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">

          {/* Content */}
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#aeb7b0]">
              Stay in the loop
            </p>

            <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
              Good things, straight to your inbox.
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-6 text-[#b9c0c5] sm:text-base">
              Get product drops, new collections, exclusive offers and
              occasional inspiration from ShopSphere.
            </p>
          </div>

          {/* Form */}
          <div>
            {submitted ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2e7d32] text-white">
                  ✓
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white">
                  You&apos;re on the list.
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#b9c0c5]">
                  Thanks for subscribing. We&apos;ll keep the good stuff
                  coming.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <label
                  htmlFor="newsletter-email"
                  className="mb-3 block text-sm font-medium text-white"
                >
                  Your email address
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="min-h-12 flex-1 rounded-xl border border-white/10 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-[#9da6ac] transition focus:border-[#2e7d32] focus:ring-2 focus:ring-[#2e7d32]/20"
                  />

                  <button
                    type="submit"
                    className="min-h-12 rounded-xl bg-white px-6 text-sm font-semibold text-[#17202a] transition hover:bg-[#2e7d32] hover:text-white"
                  >
                    Subscribe
                  </button>
                </div>

                <p className="mt-3 text-[11px] leading-5 text-[#8f999f]">
                  No spam. Just useful updates and occasional offers.
                </p>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}