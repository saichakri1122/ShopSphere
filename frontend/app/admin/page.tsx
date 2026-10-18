
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

export default function AdminDashboard() {
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCounts() {
      const endpoints = [
        {
          url: `${API_URL}/api/admin/products/count`,
          update: setTotalProducts,
          key: "totalProducts",
        },
        {
          url: `${API_URL}/api/admin/customers/count`,
          update: setTotalCustomers,
          key: "totalCustomers",
        },
      ];

      await Promise.all(
        endpoints.map(async ({ url, update, key }) => {
          try {
            const response = await fetch(url, {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              signal: controller.signal,
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.message || `Failed to fetch ${key}`);
            }

            if (typeof data[key] !== "number") {
              throw new Error(`Invalid ${key} API response`);
            }

            update(data[key]);
          } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
              return;
            }

            console.error(`${key} error:`, error);
          }
        })
      );
    }

    fetchCounts();

    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
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

        <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Products"
            value={totalProducts === null ? "—" : totalProducts}
            description="Active products in catalog"
          />
          <StatCard
            title="Total Orders"
            value="—"
            description="Orders received"
          />
          <StatCard
            title="Customers"
            value={totalCustomers === null ? "—" : totalCustomers}
            description="Registered customers"
          />
          <StatCard
            title="Revenue"
            value="₹—"
            description="Completed payments"
          />
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#e5e2dc] bg-white lg:col-span-2">
            <div className="flex items-center justify-between border-b border-[#e5e2dc] px-6 py-5">
              <div>
                <h2 className="font-semibold text-[#17202a]">Recent Orders</h2>
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

          <div className="rounded-2xl border border-[#e5e2dc] bg-white">
            <div className="border-b border-[#e5e2dc] px-6 py-5">
              <h2 className="font-semibold text-[#17202a]">Low Stock</h2>
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

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-[#17202a]">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ActionLink
              href="/admin/products"
              title="Products"
              description="Add or manage products"
            />
            <ActionLink
              href="/admin/orders"
              title="Orders"
              description="Manage customer orders"
            />
            <ActionLink
              href="/admin/customers"
              title="Customers"
              description="View registered customers"
            />
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

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e5e2dc] bg-white p-6">
      <p className="text-sm text-[#687280]">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-[#17202a]">{value}</p>
      <p className="mt-2 text-xs text-[#687280]">{description}</p>
    </div>
  );
}

function ActionLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-[#e5e2dc] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <p className="font-semibold text-[#17202a]">{title}</p>
      <p className="mt-1 text-xs text-[#687280]">{description}</p>
    </Link>
  );
}
