"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  slug: string;
};

const shopLinks = [
  { name: "All Products", href: "/products" },
  { name: "New Arrivals", href: "/new-arrivals" },
  { name: "Deals", href: "/deals" },
];

const helpLinks = [
  { name: "Contact Us", href: "/contact" },
  { name: "Shipping & Delivery", href: "/shipping" },
  { name: "Returns & Refunds", href: "/returns" },
  { name: "FAQs", href: "/faq" },
];

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/categories"
        );

        if (!response.ok) return;

        const data = await response.json();

        if (!cancelled) {
          setCategories(data.categories ?? []);
        }
      } catch (error) {
        console.error("Failed to load footer categories:", error);
      }
    }

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="border-t border-[#e5e2dc] bg-[#f8f7f4]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
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

            {/* Social links: replace with your actual profiles later */}
            <div className="mt-7 flex items-center gap-3">
              {[
                { name: "Instagram", label: "IG", href: "https://www.instagram.com/" },
                { name: "Facebook", label: "FB", href: "https://www.facebook.com/" },
                { name: "X", label: "X", href: "https://x.com/" },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e2dc] text-xs font-semibold text-[#17202a] transition hover:bg-[#17202a] hover:text-white"
                >
                  {social.label}
                </a>
              ))}
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
                    className="text-sm text-[#687280] transition-colors hover:text-[#2e7d32]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Dynamic categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#17202a]">
              Categories
            </h3>

            <ul className="mt-5 space-y-3">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/products?category=${encodeURIComponent(category.slug)}`}
                      className="text-sm text-[#687280] transition-colors hover:text-[#2e7d32]"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link
                    href="/products"
                    className="text-sm text-[#687280] transition-colors hover:text-[#2e7d32]"
                  >
                    Browse all products
                  </Link>
                </li>
              )}
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
                    className="text-sm text-[#687280] transition-colors hover:text-[#2e7d32]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom footer */}
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