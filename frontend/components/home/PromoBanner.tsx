import Link from "next/link";
const HERO_IMAGE = "/promo_banner.png";

<img
  src={HERO_IMAGE}
  alt="ShopSphere curated lifestyle collection"
  className="absolute inset-0 h-full w-full object-cover"
  loading="eager"
  fetchPriority="high"
/>

export default function PromoBanner() {
  return (
    <section className="bg-[#f8f7f4] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#e9eee5] shadow-sm">
          {/* Decorative background shapes */}
          <div className="absolute -left-24 -top-24 -z-10 h-72 w-72 rounded-full bg-white/50 blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 -z-10 h-80 w-80 rounded-full bg-[#2e7d32]/10 blur-3xl" />

          <div className="grid items-stretch lg:grid-cols-2">
            {/* Left: Content */}
            <div className="flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-10 xl:px-12">
              <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#dce4d8] bg-white/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#2e7d32] sm:text-xs">
                <span aria-hidden="true">✳</span>
                The ShopSphere Edit
              </span>

              <h2 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-[-0.045em] text-[#17202a] sm:text-5xl xl:text-6xl">
                Designed for everyday{" "}
                <span className="text-[#2e7d32]">living.</span>
              </h2>

              <p className="mt-6 max-w-lg text-sm leading-7 text-[#667064] sm:text-base sm:leading-8">
                Discover thoughtfully selected products that bring a little
                more style, comfort and simplicity to your everyday.
              </p>

              <div className="mt-8">
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-4 rounded-full bg-[#17202a] px-7 py-4 text-sm font-semibold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-[#2e7d32] hover:shadow-lg"
                >
                  Explore Collection
                  <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>

              {/* Trust highlights */}
              <div className="mt-10 grid grid-cols-1 gap-4 border-t border-[#d5ddd0] pt-6 sm:grid-cols-3 sm:gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-xl">
                    🚚
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#17202a]">
                      Free Shipping
                    </p>
                    <p className="mt-1 text-[11px] text-[#667064]">
                      On eligible orders
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-xl">
                    🛡️
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#17202a]">
                      Secure Shopping
                    </p>
                    <p className="mt-1 text-[11px] text-[#667064]">
                      Shop with confidence
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-xl">
                    💬
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#17202a]">
                      Customer Support
                    </p>
                    <p className="mt-1 text-[11px] text-[#667064]">
                      Here when you need us
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Lifestyle Image */}
            <div className="relative min-h-[260px] overflow-hidden sm:min-h-[320px] lg:min-h-[420px]">
              <img
                src={HERO_IMAGE}
                alt="A curated lifestyle collection for everyday living"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />

              {/* Image overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#17202a]/35 via-transparent to-[#17202a]/5" />

              {/* Top floating card */}
              <div className="absolute right-4 top-5 flex items-center gap-3 rounded-2xl border border-white/50 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md sm:right-7 sm:top-8 sm:px-5 sm:py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f0e4] text-xl">
                  🌿
                </div>
                <div>
                  <p className="text-xs font-bold text-[#17202a] sm:text-sm">
                    Thoughtfully Curated
                  </p>
                  <p className="mt-1 text-xs text-[#667064]">
                    Just for your everyday
                  </p>
                </div>
              </div>

              {/* Bottom floating card */}
              <div className="absolute bottom-5 left-4 flex items-center gap-3 rounded-2xl border border-white/50 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md sm:bottom-8 sm:left-7 sm:px-5 sm:py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4eadc] text-xl">
                  ✨
                </div>
                <div>
                  <p className="text-xs font-bold text-[#17202a] sm:text-sm">
                    Everyday Essentials
                  </p>
                  <p className="mt-1 text-xs text-[#667064]">
                    Style meets simplicity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}