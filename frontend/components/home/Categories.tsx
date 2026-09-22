import Link from "next/link";

const categories = [
  {
    name: "Tech & Audio",
    description: "For work, play & everything between",
    number: "01",
    className: "bg-[#dce4dc]",
  },
  {
    name: "Fashion",
    description: "Everyday pieces with personality",
    number: "02",
    className: "bg-[#e8ddd3]",
  },
  {
    name: "Home & Living",
    description: "Make your space feel like yours",
    number: "03",
    className: "bg-[#ded9cf]",
  },
  {
    name: "Accessories",
    description: "Small details, big difference",
    number: "04",
    className: "bg-[#d8dfe3]",
  },
];

export default function Categories() {
  return (
    <section className="border-t border-[#e5e2dc] bg-[#f8f7f4]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">

        {/* Heading */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#687280]">
              Explore
            </p>

            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#17202a] sm:text-4xl lg:text-5xl">
              Shop by category
            </h2>
          </div>

          <Link
            href="/categories"
            className="w-fit text-sm font-semibold text-[#17202a] underline decoration-[#b9b7b1] underline-offset-4 transition-colors hover:decoration-[#17202a]"
          >
            View all categories →
          </Link>
        </div>

        {/* Categories */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/categories/${category.name
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace("&", "and")}`}
              className="group"
            >
              <div
                className={`relative aspect-[4/5] overflow-hidden rounded-2xl ${category.className}`}
              >
                {/* Decorative shape */}
                <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30 blur-sm transition-transform duration-500 group-hover:scale-125 sm:h-44 sm:w-44" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#687280]">
                    ShopSphere
                  </span>
                </div>

                {/* Number */}
                <span className="absolute left-5 top-5 text-xs font-medium text-[#687280]">
                  {category.number}
                </span>

                {/* Arrow */}
                <span className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-sm text-[#17202a] backdrop-blur-sm transition-transform duration-300 group-hover:rotate-45">
                  ↗
                </span>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/75 p-5 backdrop-blur-md">
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#17202a]">
                    {category.name}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#687280]">
                    {category.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}