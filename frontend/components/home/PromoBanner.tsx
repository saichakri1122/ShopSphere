import Link from "next/link";

export default function PromoBanner() {
  return (
    <section className="bg-[#f8f7f4] px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#dce4dc]">
          
          {/* Decorative shapes */}
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/30 blur-sm" />
          <div className="absolute -bottom-28 left-1/3 h-80 w-80 rounded-full bg-[#2e7d32]/10 blur-2xl" />

          <div className="relative grid min-h-[420px] items-center lg:grid-cols-2">
            
            {/* Content */}
            <div className="px-7 py-14 sm:px-12 sm:py-16 lg:px-16">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#687280]">
                The ShopSphere Edit
              </p>

              <h2 className="max-w-xl text-4xl font-semibold leading-[1.05] tracking-[-0.05em] text-[#17202a] sm:text-5xl lg:text-6xl">
                Designed for everyday living.
              </h2>

              <p className="mt-6 max-w-md text-sm leading-6 text-[#687280] sm:text-base">
                Discover thoughtfully selected products that bring a little
                more style, comfort and simplicity to your everyday.
              </p>

              <Link
                href="/collections"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#17202a] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#2e7d32]"
              >
                Explore collection
                <span className="text-base">↗</span>
              </Link>
            </div>

            {/* Visual */}
            <div className="relative hidden h-full min-h-[420px] lg:block">
              
              {/* Main visual */}
              <div className="absolute right-[15%] top-1/2 flex h-64 w-64 -translate-y-1/2 items-center justify-center rounded-full bg-white/35 shadow-sm backdrop-blur-sm">
                <div className="flex h-44 w-44 items-center justify-center rounded-full bg-white/45 text-8xl">
                  ✨
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute right-[8%] top-[16%] rounded-2xl bg-white/75 px-5 py-4 shadow-sm backdrop-blur-md">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#687280]">
                  Curated
                </p>
                <p className="mt-1 text-sm font-semibold text-[#17202a]">
                  Just for you
                </p>
              </div>

              <div className="absolute bottom-[15%] left-[8%] rounded-2xl bg-white/75 px-5 py-4 shadow-sm backdrop-blur-md">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#687280]">
                  Quality
                </p>
                <p className="mt-1 text-sm font-semibold text-[#17202a]">
                  Made to last
                </p>
              </div>

              {/* Decorative circle */}
              <div className="absolute bottom-[-80px] right-[-30px] h-52 w-52 rounded-full border border-[#17202a]/10" />
            </div>

            {/* Mobile visual */}
            <div className="relative flex h-64 items-center justify-center lg:hidden">
              <div className="flex h-48 w-48 items-center justify-center rounded-full bg-white/35 shadow-sm backdrop-blur-sm">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/45 text-6xl">
                  ✨
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}