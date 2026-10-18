"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Category = {
  id: number;
  name: string;
  slug: string;
};

const CATEGORY_IMAGES: { keywords: string[]; image: string }[] = [
  {
    keywords: ["electronic", "mobile", "computer", "gadget"],
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=85",
  },
  {
    keywords: ["fashion", "cloth", "apparel", "wear"],
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=85",
  },
  {
    keywords: ["home", "living", "furniture", "decor"],
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85",
  },
  {
    keywords: ["beauty", "skin", "makeup", "personal care"],
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=85",
  },
  {
    keywords: ["sport", "fitness", "outdoor"],
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85",
  },
  {
    keywords: ["book", "stationery", "education"],
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=85",
  },
  {
    keywords: ["shoe", "footwear"],
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
  },
  {
    keywords: ["accessor", "watch", "jewelry"],
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
  },
];

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=85";

function getCategoryImage(category: Category) {
  const categoryText =
    `${category.name} ${category.slug}`.toLowerCase();

  const match = CATEGORY_IMAGES.find((item) =>
    item.keywords.some((keyword) => categoryText.includes(keyword))
  );

  return match?.image ?? DEFAULT_IMAGE;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCategories() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to load categories.");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.categories)) {
          throw new Error("Invalid category data received.");
        }

        setCategories(data.categories);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchCategories();

    return () => controller.abort();
  }, []);

  return (
    <section className="bg-[#f8f7f4] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2e7d32]">
              Explore the Collection
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-[#17202a] sm:text-3xl">
              Shop by Categories
            </h2>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Find exactly what you&apos;re looking for.
            </p>
          </div>

          <Link
            href="/products"
            className="shrink-0 text-sm font-semibold text-[#2e7d32] transition hover:text-[#17202a]"
          >
            View All →
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl bg-white"
              >
                <div className="aspect-[4/5] bg-gray-200" />

                <div className="p-4">
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-white p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-semibold text-[#2e7d32]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Category Image Cards */}
        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group relative isolate aspect-[4/5] overflow-hidden rounded-2xl bg-[#e5e2dc] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Category Image */}
                <img
                  src={getCategoryImage(category)}
                  alt={category.name}
                  loading="lazy"
                  className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/10 to-black/5 transition group-hover:from-black/90" />

                {/* Category Content */}
                <div className="flex h-full flex-col justify-end p-4 sm:p-5">
                  {/* Category Name: Opens filtered Shop */}
                  <Link
                    href={`/products?category=${encodeURIComponent(category.slug)}`}
                    className="text-lg font-bold text-white transition hover:text-green-200 sm:text-xl"
                  >
                    {category.name}
                  </Link>

                  {/* Explore Collection: Opens all products */}
                  <Link
                    href="/products"
                    className="mt-2 flex items-center gap-2 text-sm font-medium text-white/90 transition hover:text-white"
                  >
                    <span>Explore Collection</span>

                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && categories.length === 0 && (
          <div className="rounded-2xl border border-[#e5e2dc] bg-white p-10 text-center">
            <p className="font-semibold text-[#17202a]">
              No categories available yet.
            </p>

            <Link
              href="/products"
              className="mt-3 inline-block text-sm font-semibold text-[#2e7d32]"
            >
              Browse all products →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}