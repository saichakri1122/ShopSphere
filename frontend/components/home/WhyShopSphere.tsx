const benefits = [
  {
    number: "01",
    title: "Fast & reliable shipping",
    description:
      "From checkout to doorstep, enjoy a smoother delivery experience with reliable tracking.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-7 w-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12h13.5m-13.5 0 3.75-3.75M2.25 12 6 15.75M14.25 6.75h3.375a2.25 2.25 0 0 1 1.8.9l2.325 3.1v4.5h-7.5V6.75ZM6.75 17.25a1.875 1.875 0 1 0 0 3.75 1.875 1.875 0 0 0 0-3.75Zm10.5 0a1.875 1.875 0 1 0 0 3.75 1.875 1.875 0 0 0 0-3.75Z"
        />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Secure payments",
    description:
      "Shop with confidence through a checkout experience designed with security in mind.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-7 w-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 22s8.25-4.125 8.25-10.313V5.813L12 2.25 3.75 5.813v5.874C3.75 17.875 12 22 12 22Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m9 12 2 2 4-4"
        />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Easy returns",
    description:
      "A straightforward return experience helps make shopping feel simple and stress-free.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-7 w-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 11.25a8.25 8.25 0 0 1 14.1-5.83L20.25 8.5m0 0V3.75m0 4.75H15.5M21 12.75a8.25 8.25 0 0 1-14.1 5.83L3.75 15.5m0 0v4.75m0-4.75H8.5"
        />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Curated quality",
    description:
      "Discover thoughtfully selected products that balance useful design with everyday value.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-7 w-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m12 3 2.7 5.47 6.05.88-4.375 4.26 1.033 6.025L12 16.79l-5.41 2.845 1.033-6.025L3.25 9.35l6.05-.88L12 3Z"
        />
      </svg>
    ),
  },
];

export default function WhyShopSphere() {
  return (
    <section className="relative overflow-hidden border-t border-[#e5e2dc] bg-white">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#e8f0e4]/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#f3eee5]/70 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
        {/* Heading */}
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7d7] bg-[#f1f6ee] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#2e7d32] sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2e7d32]" />
              The ShopSphere Promise
            </span>

            <h2 className="mt-5 max-w-2xl text-3xl font-bold leading-tight tracking-[-0.045em] text-[#17202a] sm:text-4xl lg:text-5xl">
              Shopping should feel{" "}
              <span className="text-[#2e7d32]">effortless.</span>
            </h2>
          </div>

          <p className="max-w-lg text-sm leading-7 text-[#687280] sm:text-base md:justify-self-end">
            From discovering your next favorite to placing your order, we
            focus on making every step clear, convenient and enjoyable.
          </p>
        </div>

        {/* Benefit Cards */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <article
              key={benefit.number}
              className="group relative overflow-hidden rounded-2xl border border-[#e8e6df] bg-[#fbfaf7] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#c9d9c4] hover:bg-white hover:shadow-xl hover:shadow-[#17202a]/5 sm:p-7"
            >
              {/* Number */}
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f0e4] text-[#2e7d32] transition duration-300 group-hover:bg-[#2e7d32] group-hover:text-white">
                  {benefit.icon}
                </div>

                <span className="text-xs font-semibold tracking-[0.18em] text-[#b2b3aa]">
                  {benefit.number}
                </span>
              </div>

              {/* Content */}
              <h3 className="mt-7 text-lg font-bold tracking-tight text-[#17202a]">
                {benefit.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#687280]">
                {benefit.description}
              </p>

              {/* Bottom accent */}
              <div className="mt-7 h-1 w-10 rounded-full bg-[#dce7d7] transition-all duration-300 group-hover:w-16 group-hover:bg-[#2e7d32]" />

              {/* Decorative circle */}
              <div className="pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full border border-[#e5e2dc]/70 transition-transform duration-500 group-hover:scale-125" />
            </article>
          ))}
        </div>

        {/* Bottom message */}
        <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-[#17202a] px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-lg font-semibold text-white">
              Good finds. Thoughtful shopping.
            </p>
            <p className="mt-1 text-sm text-white/65">
              Your next everyday favorite could be just a click away.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#c5dfbb]">
            Made for everyday living
            <span>✳</span>
          </span>
        </div>
      </div>
    </section>
  );
}