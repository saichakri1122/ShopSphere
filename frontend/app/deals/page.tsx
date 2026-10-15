"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";

type ProductImage = {
  image_url: string;
  alt_text?: string | null;
  display_order?: number;
  is_primary?: boolean;
};

type Product = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  brand?: string | null;
  price: number | string;
  compare_at_price?: number | string | null;
  stock_quantity: number;
  rating?: number | string | null;
  review_count?: number;
  category_name?: string | null;
  images?: ProductImage[];
};

type SortOption = "discount" | "price-low" | "price-high" | "rating";

const API_URL = "http://localhost:5000/api/products";

function formatPrice(price: number | string | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(price ?? 0));
}

function getDiscount(
  price: number | string,
  compareAtPrice: number | string | null | undefined
) {
  const currentPrice = Number(price);
  const originalPrice = Number(compareAtPrice);

  if (
    !Number.isFinite(currentPrice) ||
    !Number.isFinite(originalPrice) ||
    currentPrice < 0 ||
    originalPrice <= currentPrice
  ) {
    return 0;
  }

  return Math.round(
    ((originalPrice - currentPrice) / originalPrice) * 100
  );
}

export default function DealsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("discount");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDeals() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.products)) {
          throw new Error("Invalid product data received from the server.");
        }

        const discountedProducts = data.products.filter(
          (product: Product) =>
            getDiscount(product.price, product.compare_at_price) > 0
        );

        setProducts(discountedProducts);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading deals."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchDeals();

    return () => controller.abort();
  }, []);

  const sortedProducts = useMemo(() => {
    const result = [...products];

    switch (sortBy) {
      case "price-low":
        return result.sort(
          (a, b) => Number(a.price) - Number(b.price)
        );

      case "price-high":
        return result.sort(
          (a, b) => Number(b.price) - Number(a.price)
        );

      case "rating":
        return result.sort(
          (a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0)
        );

      case "discount":
      default:
        return result.sort(
          (a, b) =>
            getDiscount(b.price, b.compare_at_price) -
            getDiscount(a.price, a.compare_at_price)
        );
    }
  }, [products, sortBy]);

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#17202a]">
      <Navbar />

      <main>
        {/* Deals Hero */}
        <section className="border-b border-[#e5e2dc] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#2e7d32]">
              Shop Smart, Save More
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Deals You Don&apos;t Want to Miss
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
              Discover products at reduced prices. Compare the original
              price with the current price and find great deals across
              the ShopSphere collection.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#e8f5e9] px-4 py-2 text-sm font-medium text-[#2e7d32]">
                {loading
                  ? "Finding deals..."
                  : `${products.length} deal${products.length === 1 ? "" : "s"} available`}
              </span>

              <Link
                href="/products"
                className="rounded-full border border-[#e5e2dc] px-4 py-2 text-sm font-medium transition hover:border-[#2e7d32] hover:text-[#2e7d32]"
              >
                Shop All Products →
              </Link>
            </div>
          </div>
        </section>

        {/* Deals Listing */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Best Deals
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Products with an actual price reduction.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label
                htmlFor="sort-deals"
                className="whitespace-nowrap text-sm text-gray-600"
              >
                Sort by
              </label>

              <select
                id="sort-deals"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value as SortOption)
                }
                className="rounded-lg border border-[#e5e2dc] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2e7d32]"
              >
                <option value="discount">Biggest Discount</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse overflow-hidden rounded-2xl border border-[#e5e2dc] bg-white"
                >
                  <div className="aspect-square bg-gray-200" />

                  <div className="space-y-3 p-4">
                    <div className="h-3 w-1/3 rounded bg-gray-200" />
                    <div className="h-5 w-4/5 rounded bg-gray-200" />
                    <div className="h-4 w-1/2 rounded bg-gray-200" />
                    <div className="h-10 rounded-lg bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center">
              <h3 className="text-lg font-semibold text-red-600">
                Couldn&apos;t load deals
              </h3>

              <p className="mt-2 text-sm text-gray-600">{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 rounded-lg bg-[#17202a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2e7d32]"
              >
                Try Again
              </button>
            </div>
          )}

          {/* No Deals */}
          {!loading && !error && sortedProducts.length === 0 && (
            <div className="rounded-2xl border border-[#e5e2dc] bg-white px-6 py-16 text-center">
              <div className="text-5xl">🏷️</div>

              <h3 className="mt-5 text-xl font-semibold">
                No deals available right now
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Products will appear here when their original price is
                higher than their current selling price.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex rounded-lg bg-[#17202a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2e7d32]"
              >
                Explore Products
              </Link>
            </div>
          )}

          {/* Deal Cards */}
          {!loading && !error && sortedProducts.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedProducts.map((product) => {
                const primaryImage =
                  product.images?.find((image) => image.is_primary) ??
                  [...(product.images ?? [])].sort(
                    (a, b) =>
                      (a.display_order ?? 0) - (b.display_order ?? 0)
                  )[0];

                const discount = getDiscount(
                  product.price,
                  product.compare_at_price
                );

                const rating = Number(product.rating ?? 0);

                const originalPrice = Number(product.compare_at_price);
                const currentPrice = Number(product.price);

                const savings = originalPrice - currentPrice;

                return (
                  <article
                    key={product.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#e5e2dc] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      className="relative block aspect-square overflow-hidden bg-[#f1f0ec]"
                    >
                      {primaryImage?.image_url ? (
                        <img
                          src={primaryImage.image_url}
                          alt={primaryImage.alt_text || product.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                          No image available
                        </div>
                      )}

                      <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white">
                        {discount}% OFF
                      </span>

                      {Number(product.stock_quantity) <= 0 && (
                        <span className="absolute inset-x-0 bottom-0 bg-black/70 py-3 text-center text-sm font-semibold text-white">
                          Out of Stock
                        </span>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col p-4">
                      {product.category_name && (
                        <p className="text-xs font-medium uppercase tracking-wide text-[#2e7d32]">
                          {product.category_name}
                        </p>
                      )}

                      <Link
                        href={`/products/${product.slug}`}
                        className="mt-2 line-clamp-2 text-base font-semibold transition hover:text-[#2e7d32]"
                      >
                        {product.name}
                      </Link>

                      {product.brand && (
                        <p className="mt-1 text-sm text-gray-500">
                          {product.brand}
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-1.5">
                        <span className="text-sm text-amber-500">★</span>

                        <span className="text-sm font-medium">
                          {rating.toFixed(1)}
                        </span>

                        <span className="text-xs text-gray-400">
                          ({product.review_count ?? 0} reviews)
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-lg font-bold">
                          {formatPrice(product.price)}
                        </span>

                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.compare_at_price)}
                        </span>
                      </div>

                      <p className="mt-1 text-xs font-medium text-[#2e7d32]">
                        You save {formatPrice(savings)}
                      </p>

                      <Link
                        href={`/products/${product.slug}`}
                        className="mt-5 block rounded-lg bg-[#17202a] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#2e7d32]"
                      >
                        View Deal
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}