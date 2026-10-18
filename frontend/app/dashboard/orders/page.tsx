
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000";

type OrderItem = {
  id?: string;
  product_id?: string;
  product_name?: string;
  name?: string;
  quantity: number;
  price?: number | string;
  unit_price?: number | string;
  image_url?: string | null;
};

type Order = {
  id: string;
  order_number?: string;
  status: string;
  payment_status?: string;
  payment_method?: string;
  subtotal?: number | string;
  shipping_fee?: number | string;
  discount_amount?: number | string;
  total_amount: number | string;
  created_at?: string;
  items?: OrderItem[];
  order_items?: OrderItem[];
};

function formatPrice(value: number | string | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function formatDate(value?: string) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusStyle(status: string) {
  const value = status.toLowerCase();

  if (["confirmed", "delivered", "completed", "paid"].includes(value)) {
    return "bg-green-50 text-green-700";
  }

  if (["cancelled", "failed", "refunded"].includes(value)) {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-700";
}

export default function MyOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load your orders.");
      }

      // Supports either { orders: [...] } or { orders: { items: [...] } }.
      const result = data.orders;
      const orderList = Array.isArray(result)
        ? result
        : Array.isArray(result?.items)
        ? result.items
        : [];

      setOrders(orderList);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-4 py-8 text-[#17202a] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-6 text-sm font-medium text-gray-500 transition hover:text-[#2e7d32]"
        >
          ← Back to Dashboard
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#2e7d32]">
              YOUR ACCOUNT
            </p>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
              My Orders
            </h1>
            <p className="mt-2 text-gray-500">
              Track and manage your ShopSphere purchases.
            </p>
          </div>

          <button
            onClick={() => void loadOrders()}
            disabled={loading}
            className="rounded-xl border border-[#e5e2dc] bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-[#2e7d32] disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh Orders"}
          </button>
        </div>

        {loading ? (
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl border border-[#e5e2dc] bg-white"
              />
            ))}
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-white p-6 text-center">
            <p className="font-semibold text-red-700">
              Could not load your orders
            </p>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <button
              onClick={() => void loadOrders()}
              className="mt-5 rounded-xl bg-[#2e7d32] px-5 py-3 font-semibold text-white hover:bg-green-800"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#e5e2dc] bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f8f7f4]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-8 w-8 text-gray-500"
              >
                <path
                  d="M3 3h2l2.4 12.2a2 2 0 002 1.6h8.8a2 2 0 002-1.6L22 8H6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="21" r="1" />
                <circle cx="18" cy="21" r="1" />
              </svg>
            </div>

            <h2 className="mt-5 text-xl font-bold">No orders yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              Your purchases will appear here once you place your first order.
            </p>

            <button
              onClick={() => router.push("/products")}
              className="mt-6 rounded-xl bg-[#2e7d32] px-6 py-3 font-semibold text-white transition hover:bg-green-800"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            <p className="text-sm text-gray-500">
              {orders.length} {orders.length === 1 ? "order" : "orders"} found
            </p>

            {orders.map((order) => {
              const items = order.items ?? order.order_items ?? [];

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-[#e5e2dc] bg-white"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#eeeae4] p-5 sm:p-6">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Order ID
                      </p>
                      <p className="mt-1 break-all font-bold">
                        {order.order_number || order.id}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusStyle(order.status)}`}
                      >
                        {order.status.replaceAll("_", " ")}
                      </span>

                      {order.payment_status && (
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusStyle(order.payment_status)}`}
                        >
                          Payment: {order.payment_status.replaceAll("_", " ")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    {items.length > 0 && (
                      <div className="mb-5 space-y-4">
                        {items.map((item, index) => (
                          <div
                            key={item.id || item.product_id || index}
                            className="flex items-center justify-between gap-4"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {item.product_name ||
                                  item.name ||
                                  "Product"}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                Quantity: {item.quantity}
                              </p>
                            </div>

                            <p className="shrink-0 text-sm font-semibold">
                              {formatPrice(
                                item.price ?? item.unit_price
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#eeeae4] pt-5">
                      <div>
                        <p className="text-sm text-gray-500">
                          Total amount
                        </p>
                        <p className="mt-1 text-xl font-bold">
                          {formatPrice(order.total_amount)}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          router.push(`/orders/${order.id}`)
                        }
                        className="rounded-xl border border-[#17202a] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#17202a] hover:text-white"
                      >
                        View Order
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
