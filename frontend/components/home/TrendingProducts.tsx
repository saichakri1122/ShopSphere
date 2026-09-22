"use client";

import { useState } from "react";
import Link from "next/link";

const products = [
  {
    id: 1,
    name: "Pulse Smart Watch",
    category: "Tech & Audio",
    price: "₹3,499",
    oldPrice: "₹4,299",
    rating: "4.8",
    reviews: "218",
    badge: "Trending",
    emoji: "⌚",
    bg: "bg-[#dce4dc]",
  },
  {
    id: 2,
    name: "Everyday Canvas Sneakers",
    category: "Fashion",
    price: "₹2,199",
    oldPrice: "₹2,799",
    rating: "4.7",
    reviews: "164",
    badge: "Hot",
    emoji: "👟",
    bg: "bg-[#e8ddd3]",
  },
  {
    id: 3,
    name: "Cloud Ceramic Mug Set",
    category: "Home & Living",
    price: "₹899",
    oldPrice: "₹1,199",
    rating: "4.9",
    reviews: "97",
    badge: "Popular",
    emoji: "☕",
    bg: "bg-[#ded9cf]",
  },
  {
    id: 4,
    name: "Urban Leather Wallet",
    category: "Accessories",
    price: "₹1,499",
    oldPrice: "₹1,899",
    rating: "4.6",
    reviews: "83",
    badge: "New",
    emoji: "👛",
    bg: "bg-[#d8dfe3]",
  },
  {
    id: 5,
    name: "Compact Bluetooth Speaker",
    category: "Tech & Audio",
    price: "₹1,799",
    oldPrice: "₹2,299",
    rating: "4.8",
    reviews: "143",
    badge: "Trending",
    emoji: "🔊",
    bg: "bg-[#e1e5dc]",
  },
];

export default function TrendingProducts() {
  const [wishlist, setWishlist] = useState<number[]>([]);

  const toggleWishlist = (id: number) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  return (
    <section className="border-t border-[#e5e2dc] bg-[#f8f7f4]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">

        {/* Header */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#687280]">
              What&apos;s popular
            </p>

            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#17202a] sm:text-4xl lg:text-5xl">
              Trending now
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#687280] sm:text-base">
              Products people are discovering, loving and adding to their
              everyday.
            </p>
          </div>

          <Link
            href="/shop?sort=trending"
            className="w-fit text-sm font-semibold text-[#17202a] underline decoration-[#b9b7b1] underline-offset-4 transition-colors hover:decoration-[#17202a]"
          >
            See what&apos;s trending →
          </Link>
        </div>

        {/* Product Row */}
        <div className="mt-10 -mx-5 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
          <div className="flex gap-5 lg:grid lg:grid-cols-4">
            {products.map((product) => {
              const isWishlisted = wishlist.includes(product.id);

              return (
                <article
                  key={product.id}
                  className="group min-w-[270px] sm:min-w-[300px] lg:min-w-0"
                >
                  {/* Image */}
                  <div
                    className={`relative aspect-[4/5] overflow-hidden rounded-2xl ${product.bg}`}
                  >
                    {/* Badge */}
                    <span className="absolute left-4 top-4 z-10 rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#17202a] backdrop-blur-sm">
                      {product.badge}
                    </span>

                    {/* Wishlist */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      aria-label={
                        isWishlisted
                          ? `Remove ${product.name} from wishlist`
                          : `Add ${product.name} to wishlist`
                      }
                      className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#17202a] backdrop-blur-sm transition-all duration-300 hover:scale-105"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill={isWishlisted ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        strokeWidth={1.7}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733C11.285 4.876 9.623 3.75 7.688 3.75 5.099 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                        />
                      </svg>
                    </button>

                    {/* Temporary Product Visual */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-40 w-40 items-center justify-center rounded-full bg-white/30 text-7xl shadow-sm backdrop-blur-[2px] transition-transform duration-500 group-hover:scale-110 sm:h-44 sm:w-44">
                        {product.emoji}
                      </div>
                    </div>

                    {/* Add to cart */}
                    <button
                      type="button"
                      className="absolute bottom-4 left-4 right-4 translate-y-2 rounded-xl bg-[#17202a] px-4 py-3 text-sm font-semibold text-white opacity-0 transition-all duration-300 hover:bg-[#2e7d32] group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      Add to cart
                    </button>
                  </div>

                  {/* Details */}
                  <div className="pt-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#687280]">
                      {product.category}
                    </p>

                    <h3 className="mt-2 text-base font-semibold tracking-[-0.02em] text-[#17202a]">
                      {product.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center gap-0.5 text-[#2e7d32]">
                        <span className="text-sm">★</span>
                        <span className="text-xs font-semibold">
                          {product.rating}
                        </span>
                      </div>

                      <span className="text-xs text-[#687280]">
                        ({product.reviews})
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-base font-semibold text-[#17202a]">
                        {product.price}
                      </span>

                      <span className="text-sm text-[#9a9a95] line-through">
                        {product.oldPrice}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}