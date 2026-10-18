"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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
  price: number | string;
  compare_at_price?: number | string | null;
  rating?: number | string | null;
  review_count?: number;
  category_name?: string | null;
  stock_quantity: number;
  images?: ProductImage[];
};

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/products`;

function formatPrice(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function getDiscount(product: Product) {
  const price = Number(product.price);
  const oldPrice = Number(product.compare_at_price);

  if (!oldPrice || oldPrice <= price || price < 0) {
    return 0;
  }

  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export default function TrendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDeals() {
      try {
        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load trending deals.");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.products)) {
          throw new Error("Invalid product data received.");
        }

        const discountedProducts = (data.products as Product[])
          .filter((product) => getDiscount(product) > 0)
          .sort((a, b) => getDiscount(b) - getDiscount(a))
          .slice(0, 8);

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

  const displayedProducts = useMemo(() => products, [products]);

  return (
    <section className="border-t border-[#e5e2dc] bg-[#f8f7f4]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#2e7d32]">
              Limited-time savings
            </p>

            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#17202a] sm:text-4xl lg:text-5xl">
              Trending deals
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#687280] sm:text-base">
              Discover great finds at reduced prices, handpicked from
              our latest offers.
            </p>
          </div>

          <Link
            href="/deals"
            className="w-fit text-sm font-semibold text-[#17202a] underline decoration-[#b9b7b1] underline-offset-4 transition-colors hover:decoration-[#17202a]"
          >
            Explore all deals →
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl bg-white"
              >
                <div className="aspect-[4/5] bg-gray-200" />
                <div className="space-y-3 p-4">
                  <div className="h-3 w-1/3 rounded bg-gray-200" />
                  <div className="h-4 w-4/5 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-10 rounded-2xl border border-red-200 bg-white p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && displayedProducts.length === 0 && (
          <div className="mt-10 rounded-2xl border border-[#e5e2dc] bg-white px-6 py-12 text-center">
            <div className="text-4xl">🏷️</div>
            <h3 className="mt-4 text-lg font-semibold text-[#17202a]">
              Deals are coming soon
            </h3>
            <p className="mt-2 text-sm text-[#687280]">
              Check back soon for discounted products.
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex rounded-full bg-[#17202a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2e7d32]"
            >
              Browse products →
            </Link>
          </div>
        )}

        {/* Deals */}
        {!loading && !error && displayedProducts.length > 0 && (
          <div className="mt-10 -mx-5 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
            <div className="flex gap-5 lg:grid lg:grid-cols-4">
              {displayedProducts.map((product) => {
                const image =
                  product.images?.find((item) => item.is_primary) ??
                  [...(product.images ?? [])].sort(
                    (a, b) =>
                      (a.display_order ?? 0) - (b.display_order ?? 0)
                  )[0];

                const discount = getDiscount(product);
                const rating = Number(product.rating ?? 0);

                return (
                  <article
                    key={product.id}
                    className="group min-w-[250px] sm:min-w-[280px] lg:min-w-0"
                  >
                    {/* Product Image */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-[#e1e5dc]"
                    >
                      {image?.image_url ? (
                        <img
                          src={image.image_url}
                          alt={image.alt_text || product.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-500">
                          No image available
                        </div>
                      )}

                      <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                        {discount}% OFF
                      </span>

                      {Number(product.stock_quantity) <= 0 && (
                        <span className="absolute inset-x-0 bottom-0 bg-black/70 py-3 text-center text-xs font-semibold text-white">
                          Out of Stock
                        </span>
                      )}

                      <span className="absolute bottom-4 left-4 right-4 rounded-xl bg-[#17202a] px-4 py-3 text-center text-sm font-semibold text-white transition-colors group-hover:bg-[#2e7d32]">
                        View Deal →
                      </span>
                    </Link>

                    {/* Product Details */}
                    <div className="pt-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#687280]">
                        {product.category_name || "ShopSphere"}
                      </p>

                      <Link
                        href={`/products/${product.slug}`}
                        className="mt-2 block text-base font-semibold tracking-[-0.02em] text-[#17202a] hover:text-[#2e7d32]"
                      >
                        {product.name}
                      </Link>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-[#2e7d32]">★</span>
                        <span className="text-xs font-semibold text-[#17202a]">
                          {rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-[#687280]">
                          ({product.review_count ?? 0} reviews)
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-[#17202a]">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-sm text-[#9a9a95] line-through">
                          {formatPrice(product.compare_at_price)}
                        </span>
                      </div>

                      <p className="mt-2 text-xs font-medium text-[#2e7d32]">
                        You save{" "}
                        {formatPrice(
                          Number(product.compare_at_price) -
                            Number(product.price)
                        )}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}