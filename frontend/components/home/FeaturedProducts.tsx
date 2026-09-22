"use client";

import { useState } from "react";
import Link from "next/link";

const products = [
  {
    id: 1,
    name: "AeroSound Wireless Headphones",
    category: "Tech & Audio",
    price: "₹4,999",
    oldPrice: "₹6,499",
    rating: "4.8",
    reviews: "124",
    badge: "Best Seller",
    image: "🎧",
    bg: "bg-[#e2e7e3]",
  },
  {
    id: 2,
    name: "Minimal Everyday Backpack",
    category: "Accessories",
    price: "₹2,799",
    oldPrice: "₹3,499",
    rating: "4.7",
    reviews: "89",
    badge: "New",
    image: "🎒",
    bg: "bg-[#e9dfd5]",
  },
  {
    id: 3,
    name: "Luma Desk Lamp",
    category: "Home & Living",
    price: "₹1,899",
    oldPrice: "₹2,499",
    rating: "4.9",
    reviews: "76",
    badge: "Popular",
    image: "💡",
    bg: "bg-[#dedbd1]",
  },
  {
    id: 4,
    name: "Essential Oversized Tee",
    category: "Fashion",
    price: "₹1,299",
    oldPrice: "₹1,699",
    rating: "4.6",
    reviews: "152",
    badge: "Trending",
    image: "👕",
    bg: "bg-[#dce2e7]",
  },
];

export default function FeaturedProducts() {
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
              Curated for you
            </p>

            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#17202a] sm:text-4xl lg:text-5xl">
              Featured products
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#687280] sm:text-base">
              Everyday essentials and standout pieces, carefully selected for
              modern living.
            </p>
          </div>

          <Link
            href="/shop"
            className="w-fit text-sm font-semibold text-[#17202a] underline decoration-[#b9b7b1] underline-offset-4 transition-colors hover:decoration-[#17202a]"
          >
            View all products →
          </Link>
        </div>

        {/* Product Grid */}
        <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const isWishlisted = wishlist.includes(product.id);

            return (
              <article key={product.id} className="group">

                {/* Product Image */}
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
                      {product.image}
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <button
                    type="button"
                    className="absolute bottom-4 left-4 right-4 translate-y-2 rounded-xl bg-[#17202a] px-4 py-3 text-sm font-semibold text-white opacity-0 transition-all duration-300 hover:bg-[#2e7d32] group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    Add to cart
                  </button>
                </div>

                {/* Product Details */}
                <div className="pt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#687280]">
                    {product.category}
                  </p>

                  <h3 className="mt-2 text-base font-semibold tracking-[-0.02em] text-[#17202a]">
                    {product.name}
                  </h3>

                  {/* Rating */}
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

                  {/* Price */}
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
    </section>
  );
}