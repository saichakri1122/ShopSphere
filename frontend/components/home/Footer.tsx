import Link from "next/link";

const shopLinks = [
  { name: "All Products", href: "/shop" },
  { name: "New Arrivals", href: "/shop?sort=newest" },
  { name: "Best Sellers", href: "/shop?sort=popular" },
  { name: "Deals", href: "/deals" },
];

const categoryLinks = [
  { name: "Tech & Audio", href: "/categories/tech-and-audio" },
  { name: "Fashion", href: "/categories/fashion" },
  { name: "Home & Living", href: "/categories/home-and-living" },
  { name: "Accessories", href: "/categories/accessories" },
];

const helpLinks = [
  { name: "Contact Us", href: "/contact" },
  { name: "Shipping & Delivery", href: "/shipping" },
  { name: "Returns & Refunds", href: "/returns" },
  { name: "FAQs", href: "/faq" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#e5e2dc] bg-[#f8f7f4]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">

        {/* Main Footer */}
        <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-10 lg:py-20">

          {/* Brand */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-block text-xl font-semibold tracking-[-0.04em] text-[#17202a]"
            >
              ShopSphere
            </Link>

            <p className="mt-5 text-sm leading-6 text-[#687280]">
              Thoughtfully selected products for modern everyday living.
              Discover things that fit your world.
            </p>

            {/* Social Links */}
            <div className="mt-7 flex items-center gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e2dc] text-[#17202a] transition hover:border-[#17202a] hover:bg-[#17202a] hover:text-white"
              >
                <span className="text-xs font-semibold">IG</span>
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e2dc] text-[#17202a] transition hover:border-[#17202a] hover:bg-[#17202a] hover:text-white"
              >
                <span className="text-xs font-semibold">FB</span>
              </a>

              <a
                href="#"
                aria-label="X"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e2dc] text-[#17202a] transition hover:border-[#17202a] hover:bg-[#17202a] hover:text-white"
              >
                <span className="text-xs font-semibold">X</span>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#17202a]">
              Shop
            </h3>

            <ul className="mt-5 space-y-3">
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#687280] transition-colors hover:text-[#17202a]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#17202a]">
              Categories
            </h3>

            <ul className="mt-5 space-y-3">
              {categoryLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#687280] transition-colors hover:text-[#17202a]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#17202a]">
              Help
            </h3>

            <ul className="mt-5 space-y-3">
              {helpLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#687280] transition-colors hover:text-[#17202a]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-4 border-t border-[#e5e2dc] py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#687280]">
            © {new Date().getFullYear()} ShopSphere. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-5">
            <Link
              href="/privacy"
              className="text-xs text-[#687280] transition-colors hover:text-[#17202a]"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="text-xs text-[#687280] transition-colors hover:text-[#17202a]"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}