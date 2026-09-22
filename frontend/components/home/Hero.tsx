import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-[#f8f7f4]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10 lg:grid-cols-2 lg:gap-12 lg:pb-20 lg:pt-12">

        {/* Hero Content */}
        <div className="order-2 lg:order-1">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#687280] sm:text-xs">
            Premium products · Better days
          </p>

          <h1 className="max-w-xl text-[3.2rem] font-semibold leading-[0.98] tracking-[-0.055em] text-[#17202a] sm:text-6xl lg:text-[5.2rem]">
            Find what
            <br />
            fits your
            <br />
            <span className="text-[#2e7d32]">world.</span>
          </h1>

          <p className="mt-6 max-w-md text-sm leading-6 text-[#687280] sm:text-base sm:leading-7">
            Curated essentials, standout pieces, and everyday upgrades -
            thoughtfully selected for the way you live.
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 rounded-full bg-[#17202a] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#263440]"
            >
              Shop now
              <span aria-hidden="true">→</span>
            </Link>

            <Link
              href="/categories"
              className="text-sm font-semibold text-[#17202a] underline decoration-[#b9b7b1] underline-offset-4 transition-colors hover:decoration-[#17202a]"
            >
              Explore collections
            </Link>
          </div>

          {/* Trust Features */}
          <div className="mt-10 grid max-w-lg grid-cols-1 gap-5 border-t border-[#e5e2dc] pt-6 sm:grid-cols-3 sm:gap-4">
            <div>
              <p className="text-xs font-semibold text-[#17202a]">
                Free Shipping
              </p>
              <p className="mt-1 text-[11px] leading-4 text-[#687280]">
                On orders over ₹999
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#17202a]">
                Secure Payments
              </p>
              <p className="mt-1 text-[11px] leading-4 text-[#687280]">
                Safe & encrypted
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#17202a]">
                Easy Returns
              </p>
              <p className="mt-1 text-[11px] leading-4 text-[#687280]">
                Hassle-free within 7 days
              </p>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="order-1 lg:order-2">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[560px] overflow-hidden rounded-[2rem] bg-[#e8e3d9]">

            {/* Temporary image area */}
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#eee9df_45%,#d9d2c5_100%)]">
              <div className="relative flex h-full w-full items-center justify-center">

                {/* Decorative product composition */}
                <div className="absolute left-[18%] top-[18%] h-32 w-32 rounded-full bg-[#d7ddd1] blur-[1px] sm:h-40 sm:w-40" />

                <div className="absolute right-[15%] top-[25%] h-44 w-28 rotate-6 rounded-[2rem] bg-[#b7c1b0] shadow-2xl sm:h-56 sm:w-36" />

                <div className="absolute bottom-[17%] left-[25%] h-40 w-40 rounded-full bg-[#c7b39b] shadow-xl sm:h-48 sm:w-48" />

                <div className="relative z-10 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#687280]">
                    ShopSphere
                  </p>

                  <p className="mt-3 text-3xl font-medium tracking-[-0.04em] text-[#17202a] sm:text-4xl">
                    Good things
                    <br />
                    belong here.
                  </p>
                </div>
              </div>
            </div>

            {/* Image label */}
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
              <div className="rounded-xl bg-white/90 px-4 py-3 backdrop-blur-md">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#687280]">
                  Featured
                </p>

                <p className="mt-1 text-xs font-semibold text-[#17202a]">
                  Everyday essentials
                </p>
              </div>

              <button
                aria-label="Explore featured collection"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg text-[#17202a] shadow-sm transition-transform hover:scale-105"
              >
                ↗
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}