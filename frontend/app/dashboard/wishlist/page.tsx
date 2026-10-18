
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type WishlistProduct = {
  wishlist_item_id: string;
  product_id: string;
  name?: string;
  slug?: string;
  price: number | string;
  compare_at_price?: number | string | null;
  stock_quantity?: number;
  image_url?: string | null;
  description?: string | null;
};

function formatPrice(value: number | string | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

export default function MyWishlistPage() {
  const router = useRouter();

  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const loadWishlist = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/wishlist`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load your wishlist.");
      }

      const result = data.wishlist;
      const items = Array.isArray(result)
        ? result
        : Array.isArray(result?.items)
        ? result.items
        : [];

      setProducts(items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading your wishlist."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWishlist();
  }, [loadWishlist]);

  const removeProduct = async (item: WishlistProduct) => {
    if (busyId) return;

    setBusyId(item.wishlist_item_id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/api/wishlist/items/${encodeURIComponent(item.wishlist_item_id)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to remove this product.");
      }

      setProducts((current) =>
        current.filter(
          (product) =>
            product.wishlist_item_id !== item.wishlist_item_id
        )
      );

      window.dispatchEvent(
        new Event("shopsphere:wishlist-updated")
      );

      setNotice("Product removed from your wishlist.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove this product."
      );
    } finally {
      setBusyId(null);
    }
  };

  const addToCart = async (item: WishlistProduct) => {
    if (busyId) return;

    if (
      typeof item.stock_quantity === "number" &&
      item.stock_quantity <= 0
    ) {
      setError("This product is currently out of stock.");
      return;
    }

    setBusyId(item.wishlist_item_id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: item.product_id,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add this product to cart.");
      }

      window.dispatchEvent(new Event("shopsphere:cart-updated"));
      setNotice("Product added to your cart.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to add this product to cart."
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-4 py-8 text-[#17202a] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-6 text-sm font-medium text-gray-500 transition hover:text-[#2e7d32]"
        >
          ← Back to Dashboard
        </button>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#2e7d32]">
              YOUR ACCOUNT
            </p>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
              My Wishlist <span aria-hidden="true">♥</span>
            </h1>
            <p className="mt-2 text-gray-500">
              Keep the products you love in one place.
            </p>
          </div>

          <button
            onClick={() => void loadWishlist()}
            disabled={loading}
            className="rounded-xl border border-[#e5e2dc] bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-[#2e7d32] disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh Wishlist"}
          </button>
        </div>

        {notice && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800"
          >
            {notice}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
            <button
              onClick={() => setError("")}
              className="ml-3 font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-2xl border border-[#e5e2dc] bg-white"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#e5e2dc] bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f8f7f4] text-3xl text-[#2e7d32]">
              ♡
            </div>

            <h2 className="mt-5 text-xl font-bold">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              Save your favourite products and they will appear here.
            </p>

            <button
              onClick={() => router.push("/products")}
              className="mt-6 rounded-xl bg-[#2e7d32] px-6 py-3 font-semibold text-white transition hover:bg-green-800"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <>
            <p className="mt-8 text-sm text-gray-500">
              {products.length}{" "}
              {products.length === 1 ? "product" : "products"} saved
            </p>

            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((item) => {
                const outOfStock =
                  typeof item.stock_quantity === "number" &&
                  item.stock_quantity <= 0;

                const busy = busyId === item.wishlist_item_id;

                return (
                  <article
                    key={item.wishlist_item_id}
                    className="overflow-hidden rounded-2xl border border-[#e5e2dc] bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        item.slug &&
                        router.push(`/products/${item.slug}`)
                      }
                      disabled={!item.slug}
                      aria-label={`View ${item.name || "product"}`}
                      className="relative flex h-52 w-full items-center justify-center overflow-hidden bg-[#f8f7f4] disabled:cursor-default"
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name || "Wishlist product"}
                          className="h-full w-full object-contain p-5"
                        />
                      ) : (
                        <span className="text-5xl text-gray-300">
                          ♡
                        </span>
                      )}

                      <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-600 shadow-sm">
                        ♥ Saved
                      </span>
                    </button>

                    <div className="p-5">
                      <h2 className="truncate text-lg font-bold">
                        {item.name || "Product"}
                      </h2>

                      {item.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-xl font-bold">
                          {formatPrice(item.price)}
                        </span>

                        {item.compare_at_price != null &&
                          Number(item.compare_at_price) >
                            Number(item.price) && (
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(item.compare_at_price)}
                            </span>
                          )}
                      </div>

                      {typeof item.stock_quantity === "number" && (
                        <p
                          className={`mt-2 text-xs font-medium ${
                            outOfStock
                              ? "text-red-600"
                              : "text-green-700"
                          }`}
                        >
                          {outOfStock ? "Out of stock" : "In stock"}
                        </p>
                      )}

                      <div className="mt-5 space-y-2">
                        <button
                          onClick={() => void addToCart(item)}
                          disabled={busy || outOfStock}
                          className="w-full rounded-xl bg-[#2e7d32] px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy
                            ? "Please wait..."
                            : outOfStock
                            ? "Out of Stock"
                            : "Add to Cart"}
                        </button>

                        <button
                          onClick={() => void removeProduct(item)}
                          disabled={busy}
                          className="w-full rounded-xl border border-[#e5e2dc] px-4 py-3 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                        >
                          Remove from Wishlist
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
