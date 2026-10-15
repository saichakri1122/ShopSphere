
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = "http://localhost:5000";

type ProductImage = {
  id: string;
  image_url: string;
  alt_text?: string | null;
  is_primary?: boolean;
  display_order?: number;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  category_name: string;
  price: number | string;
  compare_at_price?: number | string | null;
  rating?: number | string | null;
  review_count?: number;
  is_featured: boolean;
  stock_quantity: number;
  images: ProductImage[];
};

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch(`${API_URL}/api/products`, {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load products.");
        }

        const featured = (data.products as Product[])
          .filter((product) => product.is_featured)
          .slice(0, 4);

        setProducts(featured);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        console.error("Featured products error:", err);
        setError("We couldn't load featured products. Please try again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadProducts();

    return () => controller.abort();
  }, []);

  function getImage(product: Product) {
    const images = product.images ?? [];
    return (
      images.find((image) => image.is_primary)?.image_url ??
      images[0]?.image_url ??
      null
    );
  }

  const formatPrice = (price: number | string) =>
    `₹${Number(price).toLocaleString("en-IN")}`;

  return (
    <section className="border-t border-[#e5e2dc] bg-[#f8f7f4]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
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
            href="/products"
            className="w-fit text-sm font-semibold text-[#17202a] underline decoration-[#b9b7b1] underline-offset-4 hover:decoration-[#17202a]"
          >
            View all products →
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="aspect-[4/5] animate-pulse rounded-2xl bg-[#e9e6df]"
              />
            ))}
          </div>
        ) : error ? (
          <p role="alert" className="mt-10 text-sm text-red-600">
            {error}
          </p>
        ) : products.length === 0 ? (
          <p className="mt-10 text-sm text-[#687280]">
            No featured products available yet.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const imageUrl = getImage(product);
              const oldPrice = Number(product.compare_at_price);
              const hasDiscount =
                product.compare_at_price != null &&
                Number.isFinite(oldPrice) &&
                oldPrice > Number(product.price);

              return (
                <article key={product.id} className="group">
                  <Link
                    href={`/products/${encodeURIComponent(product.slug)}`}
                    className="block"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#e9e6df]">
                      <span className="absolute left-4 top-4 z-10 rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#17202a]">
                        Featured
                      </span>

                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.images.find((image) => image.is_primary)?.alt_text || product.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[#687280]">
                          No image available
                        </div>
                      )}

                      {product.stock_quantity <= 0 && (
                        <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#17202a]">
                          Out of stock
                        </span>
                      )}
                    </div>

                    <div className="pt-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#687280]">
                        {product.category_name}
                      </p>

                      <h3 className="mt-2 text-base font-semibold tracking-[-0.02em] text-[#17202a]">
                        {product.name}
                      </h3>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-[#2e7d32]">
                          ★ {Number(product.rating ?? 0).toFixed(1)}
                        </span>
                        <span className="text-xs text-[#687280]">
                          ({product.review_count ?? 0} reviews)
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-[#17202a]">
                          {formatPrice(product.price)}
                        </span>

                        {hasDiscount && (
                          <>
                            <span className="text-sm text-[#9a9a95] line-through">
                              {formatPrice(oldPrice)}
                            </span>
                            <span className="text-xs font-semibold text-[#2e7d32]">
                              {Math.round(
                                ((oldPrice - Number(product.price)) / oldPrice) * 100
                              )}% off
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
