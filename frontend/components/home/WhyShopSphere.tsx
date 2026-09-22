const benefits = [
  {
    number: "01",
    title: "Fast & reliable shipping",
    description:
      "Get your orders delivered quickly with reliable tracking from checkout to doorstep.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 18.75a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM15.75 18.75a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM3 4.5h2.25l1.5 10.5h10.5l2.25-7.5H6"
        />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Secure payments",
    description:
      "Your payment details stay protected with secure, verified checkout.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-1.5 0h12a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5V12A1.5 1.5 0 0 1 6 10.5Z"
        />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Easy returns",
    description:
      "Changed your mind? Our straightforward return process keeps things simple.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 15 6 12m0 0 3-3m-3 3h9a4.5 4.5 0 0 0 0-9H12m3 15 3-3m0 0-3-3m3 3H9a4.5 4.5 0 0 1 0-9h1.5"
        />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Curated quality",
    description:
      "We focus on products that balance thoughtful design, usefulness and everyday value.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m12 3 2.25 6.75H21l-5.25 4.125L17.75 21 12 16.875 6.25 21l2-7.125L3 9.75h6.75L12 3Z"
        />
      </svg>
    ),
  },
];

export default function WhyShopSphere() {
  return (
    <section className="border-t border-[#e5e2dc] bg-[#f8f7f4]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">

        {/* Heading */}
        <div className="max-w-2xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#687280]">
            Why ShopSphere
          </p>

          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#17202a] sm:text-4xl lg:text-5xl">
            Shopping feels simple.
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-6 text-[#687280] sm:text-base">
            From discovering something you love to receiving it at your
            doorstep, we keep the experience thoughtful and straightforward.
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-12 grid grid-cols-1 border-t border-[#e5e2dc] sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.number}
              className={`py-8 sm:px-6 lg:px-7 ${
                index % 2 === 0 ? "sm:border-r" : ""
              } ${
                index < 2 ? "sm:border-b lg:border-b-0" : ""
              } ${
                index < 3 ? "lg:border-r" : ""
              } border-[#e5e2dc] lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0`}
            >
              {/* Top */}
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#efede8] text-[#17202a]">
                  {benefit.icon}
                </div>

                <span className="text-[11px] font-medium tracking-[0.15em] text-[#9a9a95]">
                  {benefit.number}
                </span>
              </div>

              {/* Content */}
              <h3 className="mt-7 text-base font-semibold tracking-[-0.02em] text-[#17202a]">
                {benefit.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#687280]">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}