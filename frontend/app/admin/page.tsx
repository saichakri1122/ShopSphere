
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

export default function AdminDashboard() {
  const [totalProducts, setTotalProducts] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProductCount() {
      try {
        const response = await fetch(
          `${API_URL}/api/admin/products/count`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch product count"
          );
        }

        if (typeof data.totalProducts === "number") {
          setTotalProducts(data.totalProducts);
        } else {
          throw new Error("Invalid product count API response");
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Product count error:", error);
      }
    }

    fetchProductCount();

    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#2e7d32]">
              ShopSphere Admin
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#17202a]">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-[#687280]">
              Manage your store, products and orders from one place.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center rounded-xl bg-[#17202a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#263440]"
          >
            Manage Products
          </Link>
        </div>

        {/* Overview Cards */}
        <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#e5e2dc] bg-white p-6">
            <p className="text-sm text-[#687280]">Total Products</p>

            <p className="mt-3 text-3xl font-semibold text-[#17202a]">
              {totalProducts === null ? "—" : totalProducts}
            </p>

            <p className="mt-2 text-xs text-[#687280]">
              Active products in catalog
            </p>
          </div>

          <div className="rounded-2xl border border-[#e5e2dc] bg-white p-6">
            <p className="text-sm text-[#687280]">Total Orders</p>
            <p className="mt-3 text-3xl font-semibold text-[#17202a]">
              —
            </p>
            <p className="mt-2 text-xs text-[#687280]">
              Orders received
            </p>
          </div>

          <div className="rounded-2xl border border-[#e5e2dc] bg-white p-6">
            <p className="text-sm text-[#687280]">Customers</p>
            <p className="mt-3 text-3xl font-semibold text-[#17202a]">
              —
            </p>
            <p className="mt-2 text-xs text-[#687280]">
              Registered customers
            </p>
          </div>

          <div className="rounded-2xl border border-[#e5e2dc] bg-white p-6">
            <p className="text-sm text-[#687280]">Revenue</p>
            <p className="mt-3 text-3xl font-semibold text-[#17202a]">
              ₹—
            </p>
            <p className="mt-2 text-xs text-[#687280]">
              Completed payments
            </p>
          </div>
        </section>

        {/* Main Sections */}
        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Orders */}
          <div className="rounded-2xl border border-[#e5e2dc] bg-white lg:col-span-2">
            <div className="flex items-center justify-between border-b border-[#e5e2dc] px-6 py-5">
              <div>
                <h2 className="font-semibold text-[#17202a]">
                  Recent Orders
                </h2>
                <p className="mt-1 text-xs text-[#687280]">
                  Latest customer orders
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-[#17202a] underline underline-offset-4"
              >
                View all
              </Link>
            </div>

            <div className="p-6">
              <div className="rounded-xl bg-[#f8f7f4] p-8 text-center">
                <p className="text-sm font-medium text-[#17202a]">
                  No orders to display
                </p>
                <p className="mt-1 text-xs text-[#687280]">
                  Orders will appear here once customers place them.
                </p>
              </div>
            </div>
          </div>

          {/* Low Stock */}
          <div className="rounded-2xl border border-[#e5e2dc] bg-white">
            <div className="border-b border-[#e5e2dc] px-6 py-5">
              <h2 className="font-semibold text-[#17202a]">
                Low Stock
              </h2>
              <p className="mt-1 text-xs text-[#687280]">
                Products that need attention
              </p>
            </div>

            <div className="p-6">
              <div className="rounded-xl bg-[#f8f7f4] p-8 text-center">
                <p className="text-sm font-medium text-[#17202a]">
                  No low-stock products
                </p>
                <p className="mt-1 text-xs text-[#687280]">
                  Stock alerts will appear here.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-[#17202a]">
            Quick Actions
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/products"
              className="rounded-2xl border border-[#e5e2dc] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <p className="font-semibold text-[#17202a]">Products</p>
              <p className="mt-1 text-xs text-[#687280]">
                Add or manage products
              </p>
            </Link>

            <Link
              href="/admin/orders"
              className="rounded-2xl border border-[#e5e2dc] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <p className="font-semibold text-[#17202a]">Orders</p>
              <p className="mt-1 text-xs text-[#687280]">
                Manage customer orders
              </p>
            </Link>

            <Link
              href="/admin/customers"
              className="rounded-2xl border border-[#e5e2dc] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <p className="font-semibold text-[#17202a]">Customers</p>
              <p className="mt-1 text-xs text-[#687280]">
                View registered customers
              </p>
            </Link>

            <Link
              href="/admin/products/new"
              className="rounded-2xl border border-[#e5e2dc] bg-[#17202a] p-5 text-white transition hover:bg-[#263440]"
            >
              <p className="font-semibold">+ Add Product</p>
              <p className="mt-1 text-xs text-white/70">
                Create a new catalog item
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
