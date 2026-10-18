"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";

const API = "http://localhost:5000";

type ProductImage = {
  id: number;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
};

type Product = {
  id: number | string;
  name: string;
  slug: string;
  description: string;
  brand: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  rating: number | string | null;
  review_count: number;
  stock_quantity: number;
  category_id: number;
  category_name: string;
  category_slug: string;
  images: ProductImage[];
  is_featured: boolean;
};

type WishlistItem = {
  id?: number | string;
  wishlist_item_id?: number | string;
  product_id?: number | string;
  productId?: number | string;
  product?: { id?: number | string };
};

function getProductId(item: WishlistItem): string {
  return String(
    item.product_id ?? item.productId ?? item.product?.id ?? ""
  );
}

function getWishlistItemId(item: WishlistItem): string {
  return String(item.id ?? item.wishlist_item_id ?? "");
}

export default function ProductsPage() {
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("search") || "";
  const categorySlug = searchParams.get("category") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  // Product ID -> wishlist item ID
  const [wishlistItems, setWishlistItems] = useState<
    Record<string, string>
  >({});

  const [busyActions, setBusyActions] = useState<
    Record<string, boolean>
  >({});

  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Fetch products.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API}/api/products`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.products)) {
          throw new Error("Invalid product data received.");
        }

        setProducts(data.products);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchProducts();

    return () => controller.abort();
  }, []);

  // Load wishlist for logged-in users.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchWishlist() {
      try {
        const response = await fetch(`${API}/api/wishlist`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) return;

        const data = await response.json();
        const items: WishlistItem[] = Array.isArray(
          data?.wishlist?.items
        )
          ? data.wishlist.items
          : [];

        const next: Record<string, string> = {};

        for (const item of items) {
          const productId = getProductId(item);
          const wishlistItemId = getWishlistItemId(item);

          if (productId && wishlistItemId) {
            next[productId] = wishlistItemId;
          }
        }

        setWishlistItems(next);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Failed to load wishlist:", err);
        }
      }
    }

    void fetchWishlist();

    return () => controller.abort();
  }, []);

  function goToLogin() {
    const returnTo =
      `${window.location.pathname}${window.location.search}`;

    window.location.href =
      `/login?redirect=${encodeURIComponent(returnTo)}`;
  }

  async function isLoggedIn(): Promise<boolean> {
    try {
      const response = await fetch(`${API}/api/auth/me`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (response.ok) return true;

      goToLogin();
      return false;
    } catch {
      setNotice({
        type: "error",
        message: "Cannot connect to the server. Please try again.",
      });

      return false;
    }
  }

  // Add product to cart.
  async function addToCart(product: Product) {
    const productId = String(product.id).trim();
    const actionKey = `cart-${productId}`;

    if (product.stock_quantity <= 0) {
      setNotice({
        type: "error",
        message: "This product is out of stock.",
      });
      return;
    }

    if (!productId || busyActions[actionKey]) return;

    setBusyActions((current) => ({
      ...current,
      [actionKey]: true,
    }));
    setNotice(null);

    try {
      if (!(await isLoggedIn())) return;

      const response = await fetch(`${API}/api/cart`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        goToLogin();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to add product to cart."
        );
      }

      setNotice({
        type: "success",
        message: `${product.name} added to cart successfully.`,
      });
      window.dispatchEvent(new Event("shopsphere:cart-updated"));
    } catch (err) {
      setNotice({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to add product to cart.",
      });
    } finally {
      setBusyActions((current) => ({
        ...current,
        [actionKey]: false,
      }));
    }
  }

  // Add or remove product from wishlist.
  async function toggleWishlist(product: Product) {
    const productId = String(product.id).trim();
    const actionKey = `wishlist-${productId}`;

    if (!productId || busyActions[actionKey]) return;

    setBusyActions((current) => ({
      ...current,
      [actionKey]: true,
    }));
    setNotice(null);

    try {
      if (!(await isLoggedIn())) return;

      const existingItemId = wishlistItems[productId];

      if (existingItemId) {
        const response = await fetch(
          `${API}/api/wishlist/items/${encodeURIComponent(existingItemId)}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        const data = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          goToLogin();
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to remove product from wishlist."
          );
        }

        setWishlistItems((current) => {
          const next = { ...current };
          delete next[productId];
          return next;
        });

        setNotice({
          type: "success",
          message: `${product.name} removed from wishlist.`,
        });
        window.dispatchEvent(new Event("shopsphere:wishlist-updated"));

        return;
      }

      const response = await fetch(`${API}/api/wishlist`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        goToLogin();
        return;
      }

      if (response.status === 409) {
        // Already saved. Refresh the wishlist to get the item ID.
        const refreshResponse = await fetch(`${API}/api/wishlist`, {
          credentials: "include",
          cache: "no-store",
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const items: WishlistItem[] = Array.isArray(
            refreshData?.wishlist?.items
          )
            ? refreshData.wishlist.items
            : [];

          const matchingItem = items.find(
            (item) => getProductId(item) === productId
          );

          if (matchingItem) {
            const itemId = getWishlistItemId(matchingItem);

            if (itemId) {
              setWishlistItems((current) => ({
                ...current,
                [productId]: itemId,
              }));
            }
          }
        }

        setNotice({
          type: "success",
          message: "This product is already in your wishlist.",
        });

        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to add product to wishlist."
        );
      }

      // Read the returned wishlist item ID.
      let itemId = getWishlistItemId(data.wishlistItem || {});

      // If the response doesn't contain an ID, refresh the wishlist.
      if (!itemId) {
        const refreshResponse = await fetch(`${API}/api/wishlist`, {
          credentials: "include",
          cache: "no-store",
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const items: WishlistItem[] = Array.isArray(
            refreshData?.wishlist?.items
          )
            ? refreshData.wishlist.items
            : [];

          const matchingItem = items.find(
            (item) => getProductId(item) === productId
          );

          if (matchingItem) {
            itemId = getWishlistItemId(matchingItem);
          }
        }
      }

      if (itemId) {
        setWishlistItems((current) => ({
          ...current,
          [productId]: itemId,
        }));
      }

      setNotice({
        type: "success",
        message: `${product.name} added to wishlist.`,
      });
    } catch (err) {
      setNotice({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to update wishlist.",
      });
    } finally {
      setBusyActions((current) => ({
        ...current,
        [actionKey]: false,
      }));
    }
  }

  const categories = useMemo(
    () =>
      [
        ...new Set(
          products.map((product) => product.category_name)
        ),
      ].sort(),
    [products]
  );

  useEffect(() => {
    if (!categorySlug) {
      setSelectedCategory("all");
      return;
    }

    const matchingProduct = products.find(
      (product) =>
        product.category_slug?.toLowerCase() ===
        categorySlug.toLowerCase()
    );

    setSelectedCategory(
      matchingProduct?.category_name || `slug:${categorySlug}`
    );
  }, [categorySlug, products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const query = searchQuery.trim().toLowerCase();

    if (query) {
      const normalize = (value: string) =>
        value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();

      const singularize = (word: string) => {
        if (word.length > 4 && word.endsWith("ies")) {
          return word.slice(0, -3) + "y";
        }

        if (
          word.length > 3 &&
          word.endsWith("s") &&
          !word.endsWith("ss")
        ) {
          return word.slice(0, -1);
        }

        return word;
      };

      const queryWords = normalize(query)
        .split(/\s+/)
        .filter(Boolean)
        .map(singularize);

      result = result.filter((product) => {
        const searchableText = normalize(
          [
            product.name,
            product.brand || "",
            product.category_name,
            product.description || "",
          ].join(" ")
        );

        const productWords = searchableText
          .split(/\s+/)
          .filter(Boolean)
          .map(singularize);

        return queryWords.every((word) =>
          productWords.some((productWord) =>
            productWord.includes(word)
          )
        );
      });
    }

    if (categorySlug) {
      result = result.filter(
        (product) =>
          product.category_slug?.toLowerCase() ===
          categorySlug.toLowerCase()
      );
    } else if (selectedCategory !== "all") {
      result = result.filter(
        (product) => product.category_name === selectedCategory
      );
    }

    switch (sortBy) {
      case "price-low":
        result.sort(
          (a, b) => Number(a.price) - Number(b.price)
        );
        break;

      case "price-high":
        result.sort(
          (a, b) => Number(b.price) - Number(a.price)
        );
        break;

      case "rating":
        result.sort(
          (a, b) =>
            Number(b.rating || 0) - Number(a.rating || 0)
        );
        break;

      case "newest":
        result.sort(
          (a, b) => Number(b.id) - Number(a.id)
        );
        break;

      default:
        result.sort(
          (a, b) =>
            Number(Boolean(b.is_featured)) -
            Number(Boolean(a.is_featured))
        );
    }

    return result;
  }, [
    products,
    searchQuery,
    categorySlug,
    selectedCategory,
    sortBy,
  ]);

  const selectedCategoryName = products.find(
    (product) =>
      product.category_slug?.toLowerCase() ===
      categorySlug.toLowerCase()
  )?.category_name;

  const pageTitle = categorySlug
    ? selectedCategoryName || "Category Products"
    : searchQuery
      ? "Search Results"
      : "All Products";

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#17202a]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-[#e5e2dc] pb-7">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#2e7d32]">
            Discover ShopSphere
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {pageTitle}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            {categorySlug
              ? `Explore products in ${
                  selectedCategoryName || "this category"
                }.`
              : searchQuery
                ? `Products matching "${searchQuery}"`
                : "Explore our collection and find something you'll love."}
          </p>

          {(categorySlug || searchQuery) && (
            <Link
              href="/products"
              className="mt-4 inline-block text-sm font-medium text-[#2e7d32] hover:underline"
            >
              ← View all products
            </Link>
          )}
        </div>

        {notice && (
          <div
            role="status"
            aria-live="polite"
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              notice.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {notice.message}
          </div>
        )}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/products"
              className={`rounded-full border px-4 py-2 text-sm transition ${
                !categorySlug && selectedCategory === "all"
                  ? "border-[#17202a] bg-[#17202a] text-white"
                  : "border-[#e5e2dc] bg-white hover:border-[#17202a]"
              }`}
            >
              All Categories
            </Link>

            {categories.map((category) => {
              const categoryProduct = products.find(
                (product) => product.category_name === category
              );

              const slug = categoryProduct?.category_slug;

              if (!slug) return null;

              const isSelected = categorySlug
                ? categorySlug.toLowerCase() === slug.toLowerCase()
                : selectedCategory === category;

              return (
                <Link
                  key={category}
                  href={`/products?category=${encodeURIComponent(slug)}`}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    isSelected
                      ? "border-[#17202a] bg-[#17202a] text-white"
                      : "border-[#e5e2dc] bg-white hover:border-[#17202a]"
                  }`}
                >
                  {category}
                </Link>
              );
            })}
          </div>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort products"
            className="rounded-lg border border-[#e5e2dc] bg-white px-4 py-3 text-sm outline-none focus:border-[#17202a]"
          >
            <option value="featured">Featured First</option>
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        <p className="mb-5 text-sm text-gray-500">
          {loading
            ? "Loading products..."
            : `${filteredProducts.length} product${
                filteredProducts.length === 1 ? "" : "s"
              } found`}
        </p>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-xl border border-[#e5e2dc] bg-white"
              >
                <div className="aspect-square bg-gray-200" />
                <div className="space-y-3 p-4">
                  <div className="h-3 w-1/3 rounded bg-gray-200" />
                  <div className="h-4 w-4/5 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
            <p className="font-semibold text-red-600">{error}</p>

            <p className="mt-2 text-sm text-gray-500">
              Check that your backend is running on port 5000.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-[#17202a] px-5 py-3 text-sm text-white"
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-[#e5e2dc] bg-white px-5 py-16 text-center">
            <h2 className="text-xl font-semibold">
              No Products Found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Try another search or choose a different category.
            </p>

            <Link
              href="/products"
              className="mt-5 inline-block rounded-lg bg-[#17202a] px-5 py-3 text-sm text-white"
            >
              View All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const image =
                product.images?.find((item) => item.is_primary) ||
                product.images?.[0];

              const price = Number(product.price);
              const comparePrice = Number(product.compare_at_price);

              const hasDiscount =
                Number.isFinite(comparePrice) &&
                comparePrice > price;

              const discount = hasDiscount
                ? Math.round(
                    ((comparePrice - price) / comparePrice) * 100
                  )
                : 0;

              const productId = String(product.id);
              const isWishlisted = Boolean(
                wishlistItems[productId]
              );

              return (
                <article
                  key={productId}
                  className="group relative overflow-hidden rounded-xl border border-[#e5e2dc] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <button
                    type="button"
                    onClick={() => void toggleWishlist(product)}
                    disabled={
                      Boolean(
                        busyActions[`wishlist-${productId}`]
                      )
                    }
                    aria-label={
                      isWishlisted
                        ? `Remove ${product.name} from wishlist`
                        : `Add ${product.name} to wishlist`
                    }
                    aria-pressed={isWishlisted}
                    className={`absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-2xl shadow transition hover:scale-105 disabled:opacity-60 ${
                      isWishlisted
                        ? "text-rose-600"
                        : "text-gray-600 hover:text-rose-600"
                    }`}
                  >
                    {busyActions[`wishlist-${productId}`]
                      ? "…"
                      : isWishlisted
                        ? "♥"
                        : "♡"}
                  </button>

                  <Link
                    href={`/products/${product.slug}`}
                    className="block"
                    aria-label={`View ${product.name}`}
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#f1f0ec]">
                      {image?.image_url ? (
                        <img
                          src={image.image_url}
                          alt={image.alt_text || product.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                          No Image Available
                        </div>
                      )}

                      {hasDiscount && (
                        <span className="absolute left-3 top-3 rounded-full bg-[#2e7d32] px-2.5 py-1 text-xs font-semibold text-white">
                          -{discount}%
                        </span>
                      )}

                      {product.stock_quantity <= 0 && (
                        <span className="absolute inset-x-0 bottom-0 bg-black/70 px-2 py-2 text-center text-xs font-medium text-white">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <div className="p-3 sm:p-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#2e7d32]">
                        {product.category_name}
                      </p>

                      <h2 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 sm:text-base">
                        {product.name}
                      </h2>

                      {product.rating != null && (
                        <p className="mt-2 text-xs text-gray-500">
                          <span className="text-amber-500">★</span>{" "}
                          {Number(product.rating).toFixed(1)}
                          {product.review_count > 0 &&
                            ` (${product.review_count})`}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold">
                          ₹{price.toLocaleString("en-IN")}
                        </span>

                        {hasDiscount && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{comparePrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="space-y-2 px-3 pb-4 sm:px-4">
                    <button
                      type="button"
                      onClick={() => void addToCart(product)}
                      disabled={
                        product.stock_quantity <= 0 ||
                        Boolean(busyActions[`cart-${productId}`])
                      }
                      className="block w-full rounded-lg bg-[#2e7d32] px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#256628] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
                    >
                      {product.stock_quantity <= 0
                        ? "Out of Stock"
                        : busyActions[`cart-${productId}`]
                          ? "Adding..."
                          : "Add to Cart"}
                    </button>

                    <Link
                      href={`/products/${product.slug}`}
                      className="block rounded-lg border border-[#17202a] px-3 py-2.5 text-center text-sm font-medium transition hover:bg-[#17202a] hover:text-white"
                    >
                      View Product
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}