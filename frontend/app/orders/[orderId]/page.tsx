
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  shipping_address?: {
    full_name?: string;
    phone?: string;
    address_line1?: string;
    address_line2?: string | null;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  } | null;
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
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status: string) {
  const value = status.toLowerCase();

  if (
    ["confirmed", "delivered", "completed", "paid"].includes(value)
  ) {
    return "bg-green-50 text-green-700";
  }

  if (
    ["cancelled", "failed", "refunded"].includes(value)
  ) {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-700";
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = String(params.orderId);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/orders/${encodeURIComponent(orderId)}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load order details."
        );
      }

      const result = data.order;

      if (!result || typeof result !== "object") {
        throw new Error("Order details were not returned by the server.");
      }

      setOrder(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading this order."
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4]">
        <p className="text-sm text-gray-500">
          Loading order details...
        </p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-4">
        <section className="w-full max-w-md rounded-2xl border border-[#e5e2dc] bg-white p-7 text-center">
          <div className="text-4xl">📦</div>

          <h1 className="mt-4 text-xl font-bold">
            Unable to load order
          </h1>

          <p className="mt-2 break-words text-sm text-gray-500">
            {error || "This order could not be found."}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => void loadOrder()}
              className="rounded-xl bg-[#2e7d32] px-4 py-3 text-sm font-semibold text-white"
            >
              Try Again
            </button>

            <button
              onClick={() => router.push("/dashboard/orders")}
              className="rounded-xl border border-[#e5e2dc] px-4 py-3 text-sm font-semibold"
            >
              My Orders
            </button>
          </div>
        </section>
      </main>
    );
  }

  const items = order.items ?? order.order_items ?? [];
  const address = order.shipping_address;

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-4 py-8 text-[#17202a] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.push("/dashboard/orders")}
          className="mb-6 text-sm font-medium text-gray-500 transition hover:text-[#2e7d32]"
        >
          ← Back to My Orders
        </button>

        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#2e7d32]">
              ORDER DETAILS
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Your Order
            </h1>

            <p className="mt-2 break-all text-sm text-gray-500">
              Order ID: {order.order_number || order.id}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${statusClass(order.status)}`}
          >
            {order.status.replaceAll("_", " ")}
          </span>
        </header>

        {/* Payment status */}
        <section className="mt-6 rounded-2xl border border-[#e5e2dc] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold">Payment Information</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Payment status</p>
              <span
                className={`mt-2 inline-block rounded-full px-3 py-1.5 text-sm font-semibold capitalize ${statusClass(order.payment_status || "pending")}`}
              >
                {(order.payment_status || "pending").replaceAll("_", " ")}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-500">Payment method</p>
              <p className="mt-2 font-semibold capitalize">
                {(order.payment_method || "Not specified").replaceAll("_", " ")}
              </p>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="mt-6 rounded-2xl border border-[#e5e2dc] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold">
            Products Ordered ({items.length})
          </h2>

          {items.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              Product details are not available in this response.
            </p>
          ) : (
            <div className="mt-5 divide-y divide-[#eeeae4]">
              {items.map((item, index) => (
                <div
                  key={item.id || item.product_id || index}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f8f7f4]">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name || item.name || "Product"}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">
                      {item.product_name || item.name || "Product"}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Unit price: {formatPrice(item.price ?? item.unit_price)}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-bold">
                    {formatPrice(
                      Number(item.price ?? item.unit_price ?? 0) *
                        Number(item.quantity ?? 0)
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Price breakdown */}
        <section className="mt-6 rounded-2xl border border-[#e5e2dc] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold">Price Summary</h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">
                {formatPrice(order.subtotal)}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Shipping</span>
              <span className="font-medium">
                {formatPrice(order.shipping_fee)}
              </span>
            </div>

            {Number(order.discount_amount ?? 0) > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Discount</span>
                <span className="font-medium text-green-700">
                  -{formatPrice(order.discount_amount)}
                </span>
              </div>
            )}

            <div className="flex justify-between gap-4 border-t border-[#eeeae4] pt-4 text-base">
              <span className="font-bold">Total</span>
              <span className="font-bold">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>
        </section>

        {/* Delivery address */}
        <section className="mt-6 rounded-2xl border border-[#e5e2dc] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold">Delivery Address</h2>

          {address ? (
            <div className="mt-4 space-y-1 text-sm leading-6 text-gray-600">
              {address.full_name && (
                <p className="font-semibold text-[#17202a]">
                  {address.full_name}
                </p>
              )}

              {address.phone && <p>Phone: {address.phone}</p>}
              {address.address_line1 && <p>{address.address_line1}</p>}
              {address.address_line2 && <p>{address.address_line2}</p>}

              <p>
                {[address.city, address.state, address.postal_code]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              {address.country && <p>{address.country}</p>}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">
              Delivery address details are not included in the response.
            </p>
          )}
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => router.push("/dashboard/orders")}
            className="rounded-xl border border-[#e5e2dc] bg-white px-5 py-3 text-sm font-semibold transition hover:border-[#2e7d32]"
          >
            All Orders
          </button>

          <button
            onClick={() => router.push("/products")}
            className="rounded-xl bg-[#17202a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#263440]"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </main>
  );
}
