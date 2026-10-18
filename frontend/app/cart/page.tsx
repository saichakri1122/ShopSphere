
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000";

type CartItem = {
  cart_item_id?: string;
  id?: string;
  product_id: string;
  name: string;
  slug?: string;
  price: number | string;
  compare_at_price?: number | string | null;
  quantity: number;
  stock_quantity?: number;
  image_url?: string | null;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  cart?: {
    items?: CartItem[];
  };
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CartPage() {
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/cart`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (response.status === 401
              ? "Please log in to view your cart."
              : "Unable to load your cart.")
        );
      }

      setItems(data.cart?.items ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load your cart."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  const notifyCartUpdated = () => {
    window.dispatchEvent(new Event("shopsphere:cart-updated"));
  };

  const updateQuantity = async (item: CartItem, nextQuantity: number) => {
    const itemId = item.cart_item_id ?? item.id;

    if (!itemId || nextQuantity < 1) return;

    if (
      item.stock_quantity !== undefined &&
      nextQuantity > item.stock_quantity
    ) {
      setError(`Only ${item.stock_quantity} units are available.`);
      return;
    }

    try {
      setUpdatingId(itemId);
      setError("");
      setNotice("");

      const response = await fetch(
        `${API_URL}/api/cart/items/${encodeURIComponent(itemId)}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity: nextQuantity }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update quantity.");
      }

      setItems((current) =>
        current.map((cartItem) =>
          (cartItem.cart_item_id ?? cartItem.id) === itemId
            ? { ...cartItem, quantity: nextQuantity }
            : cartItem
        )
      );

      notifyCartUpdated();
      setNotice("Cart updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update quantity."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (item: CartItem) => {
    const itemId = item.cart_item_id ?? item.id;

    if (!itemId) {
      setError("Unable to identify this cart item.");
      return;
    }

    try {
      setUpdatingId(itemId);
      setError("");
      setNotice("");

      const response = await fetch(
        `${API_URL}/api/cart/items/${encodeURIComponent(itemId)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to remove this item.");
      }

      setItems((current) =>
        current.filter(
          (cartItem) =>
            (cartItem.cart_item_id ?? cartItem.id) !== itemId
        )
      );

      notifyCartUpdated();
      setNotice("Item removed from your cart.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to remove this item."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const clearCart = async () => {
    if (items.length === 0) return;

    if (!window.confirm("Are you sure you want to clear your cart?")) {
      return;
    }

    try {
      setError("");
      setNotice("");

      const response = await fetch(`${API_URL}/api/cart`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to clear your cart.");
      }

      setItems([]);
      notifyCartUpdated();
      setNotice("Your cart has been cleared.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to clear your cart."
      );
    }
  };

  const subtotal = items.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalSavings = items.reduce((total, item) => {
    const originalPrice = Number(item.compare_at_price ?? item.price);
    const currentPrice = Number(item.price);

    return (
      total +
      Math.max(0, originalPrice - currentPrice) * item.quantity
    );
  }, 0);

  const isEmpty = !loading && !error && items.length === 0;

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-4 py-8 text-[#17202a] sm:px-6 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#2e7d32]">
              ShopSphere
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Shopping Cart
            </h1>

            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Review your items before proceeding to checkout.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/products")}
            className="rounded-xl border border-[#e5e2dc] bg-white px-5 py-3 text-sm font-semibold transition hover:border-[#2e7d32] hover:text-[#2e7d32]"
          >
            Continue Shopping
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{error}</span>

            {error.toLowerCase().includes("log in") && (
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="font-bold underline"
              >
                Log in
              </button>
            )}
          </div>
        )}

        {notice && !error && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {notice}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-[#e5e2dc] bg-white px-6 py-20 text-center">
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-[#2e7d32]" />
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        )}

        {/* Empty cart */}
        {isEmpty && (
          <div className="rounded-2xl border border-[#e5e2dc] bg-white px-6 py-16 text-center shadow-sm sm:py-24">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#f2f5ef] text-4xl">
              🛒
            </div>

            <h2 className="text-2xl font-bold">Your cart is empty</h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600 sm:text-base">
              Looks like you haven&apos;t added anything yet. Explore our
              products and find something you love.
            </p>

            <button
              type="button"
              onClick={() => router.push("/products")}
              className="mt-7 rounded-xl bg-[#2e7d32] px-7 py-3.5 font-semibold text-white transition hover:bg-[#256528]"
            >
              Explore Products
            </button>
          </div>
        )}

        {/* Cart content */}
        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* Cart items */}
            <section className="overflow-hidden rounded-2xl border border-[#e5e2dc] bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e2dc] px-5 py-5 sm:px-7">
                <div>
                  <h2 className="text-lg font-bold">Your Items</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {totalQuantity}{" "}
                    {totalQuantity === 1 ? "item" : "items"} in your cart
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearCart}
                  className="text-sm font-semibold text-red-600 transition hover:text-red-800"
                >
                  Clear Cart
                </button>
              </div>

              <div className="divide-y divide-[#e5e2dc]">
                {items.map((item) => {
                  const itemId = item.cart_item_id ?? item.id;
                  const price = Number(item.price);
                  const originalPrice = Number(
                    item.compare_at_price ?? item.price
                  );
                  const isUpdating = updatingId === itemId;

                  return (
                    <article
                      key={itemId ?? item.product_id}
                      className={`flex flex-col gap-4 p-5 transition-opacity sm:flex-row sm:items-center sm:gap-6 sm:p-7 ${
                        isUpdating ? "opacity-60" : ""
                      }`}
                    >
                      {/* Product image */}
                      <button
                        type="button"
                        onClick={() =>
                          item.slug && router.push(`/products/${item.slug}`)
                        }
                        disabled={!item.slug}
                        aria-label={`View ${item.name}`}
                        className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-[#f8f7f4] sm:h-28 sm:w-28"
                      >
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-4xl">
                            📦
                          </div>
                        )}
                      </button>

                      {/* Product details */}
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          disabled={!item.slug}
                          onClick={() =>
                            item.slug &&
                            router.push(`/products/${item.slug}`)
                          }
                          className="text-left text-base font-bold transition hover:text-[#2e7d32] sm:text-lg"
                        >
                          {item.name}
                        </button>

                        <p className="mt-2 text-sm text-gray-500">
                          Price: {formatPrice(price)}
                        </p>

                        {originalPrice > price && (
                          <p className="mt-1 text-sm text-gray-400">
                            <span className="line-through">
                              {formatPrice(originalPrice)}
                            </span>
                            <span className="ml-2 font-semibold text-[#2e7d32]">
                              Save {formatPrice(originalPrice - price)}
                            </span>
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-4">
                          {/* Quantity selector */}
                          <div className="inline-flex items-center overflow-hidden rounded-lg border border-[#e5e2dc]">
                            <button
                              type="button"
                              disabled={isUpdating || item.quantity <= 1}
                              onClick={() =>
                                updateQuantity(item, item.quantity - 1)
                              }
                              aria-label={`Decrease quantity of ${item.name}`}
                              className="h-9 w-10 text-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              −
                            </button>

                            <span
                              aria-label="Quantity"
                              className="min-w-10 text-center text-sm font-semibold"
                            >
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              disabled={
                                isUpdating ||
                                (item.stock_quantity !== undefined &&
                                  item.quantity >= item.stock_quantity)
                              }
                              onClick={() =>
                                updateQuantity(item, item.quantity + 1)
                              }
                              aria-label={`Increase quantity of ${item.name}`}
                              className="h-9 w-10 text-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => void removeItem(item)}
                            className="text-sm font-medium text-red-600 transition hover:text-red-800 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>

                        {item.stock_quantity !== undefined && (
                          <p className="mt-2 text-xs text-gray-500">
                            {item.stock_quantity > 0
                              ? `${item.stock_quantity} available`
                              : "Currently out of stock"}
                          </p>
                        )}
                      </div>

                      {/* Line total */}
                      <div className="shrink-0 sm:min-w-28 sm:text-right">
                        <p className="text-xs text-gray-500 sm:hidden">
                          Item total
                        </p>
                        <p className="mt-1 text-lg font-bold sm:mt-0">
                          {formatPrice(price * item.quantity)}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="border-t border-[#e5e2dc] bg-[#fcfbf9] px-5 py-4 sm:px-7">
                <button
                  type="button"
                  onClick={() => router.push("/products")}
                  className="text-sm font-semibold text-[#2e7d32] hover:underline"
                >
                  ← Continue shopping
                </button>
              </div>
            </section>

            {/* Order summary */}
            <aside className="rounded-2xl border border-[#e5e2dc] bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
              <h2 className="text-xl font-bold">Order Summary</h2>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-600">
                    Subtotal ({totalQuantity}{" "}
                    {totalQuantity === 1 ? "item" : "items"})
                  </span>
                  <span className="font-semibold">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {totalSavings > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600">Product savings</span>
                    <span className="font-semibold text-[#2e7d32]">
                      −{formatPrice(totalSavings)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-[#2e7d32]">
                    Calculated at checkout
                  </span>
                </div>

                <div className="border-t border-dashed border-[#e5e2dc]" />

                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-bold">Estimated Total</span>
                  <span className="text-xl font-bold">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <p className="text-xs leading-5 text-gray-500">
                  Final shipping charges, coupon discounts and payment details
                  will be shown during checkout.
                </p>
              </div>

              <button
                type="button"
                disabled={items.some(
                  (item) =>
                    item.stock_quantity !== undefined &&
                    (item.stock_quantity < 1 ||
                      item.quantity > item.stock_quantity)
                )}
                onClick={() => router.push("/checkout")}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2e7d32] px-5 py-4 font-bold text-white transition hover:bg-[#256528] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Proceed to Checkout
                <span aria-hidden="true">→</span>
              </button>

              <div className="mt-5 space-y-3 border-t border-[#e5e2dc] pt-5">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-lg">🔒</span>
                  <span>Secure checkout</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-lg">📦</span>
                  <span>Review your order before payment</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
