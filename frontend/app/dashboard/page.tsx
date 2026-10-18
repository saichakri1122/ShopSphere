
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, type User } from "@/lib/auth";

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();

        if (cancelled) return;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        // Admins should use the admin dashboard.
        if (currentUser.role === "admin") {
          router.replace("/admin");
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error("Dashboard loading error:", error);

        if (!cancelled) {
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4]">
        <p className="text-sm text-[#687280]">
          Loading your dashboard...
        </p>
      </main>
    );
  }

  const fullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ");

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-4 py-8 text-[#17202a] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#2e7d32]">
              ShopSphere
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Welcome back, {user.first_name}!
            </h1>

            <p className="mt-2 text-sm text-[#687280]">
              Your account, shopping, all in one place.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#17202a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#263440]"
          >
            Continue Shopping
          </Link>
        </header>

        {/* Profile */}
        <section className="mt-8 rounded-2xl border border-[#e5e2dc] bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e8f2e8] text-2xl font-semibold text-[#2e7d32]">
              {user.first_name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold">{fullName}</h2>

              <p className="mt-1 break-words text-sm text-[#687280]">
                {user.email}
              </p>

              <p className="mt-1 text-xs text-[#687280]">
                Member since {memberSince}
              </p>
            </div>

            <div className="rounded-xl bg-[#f8f7f4] px-4 py-3">
              <p className="text-xs text-[#687280]">Account status</p>
              <p className="mt-1 text-sm font-semibold text-[#2e7d32]">
                {user.is_active ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </section>

        {/* Account links */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold">My Account</h2>

          <p className="mt-1 text-sm text-[#687280]">
            Quickly access your shopping activities.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Updated route */}
            <DashboardCard
              href="/dashboard/orders"
              icon="📦"
              title="My Orders"
              description="View your purchases and track order status."
            />

            {/* Updated route */}
            <DashboardCard
              href="/dashboard/wishlist"
              icon="♡"
              title="My Wishlist"
              description="Find the products you've saved for later."
            />

            {/* Existing cart route preserved */}
            <DashboardCard
              href="/cart"
              icon="🛒"
              title="My Cart"
              description="Review products, update quantities, and checkout."
            />

            {/* Updated route */}
            <DashboardCard
              href="/dashboard/addresses"
              icon="📍"
              title="My Addresses"
              description="Manage your delivery addresses."
            />

            {/* Customer details */}
            <div className="rounded-2xl border border-[#e5e2dc] bg-white p-6">
              <span className="text-2xl">👤</span>
              <h3 className="mt-4 font-semibold">Personal Details</h3>

              <div className="mt-3 space-y-2 text-sm text-[#687280]">
                <p>
                  <span className="font-medium text-[#17202a]">
                    Name:
                  </span>{" "}
                  {fullName}
                </p>

                <p className="break-words">
                  <span className="font-medium text-[#17202a]">
                    Email:
                  </span>{" "}
                  {user.email}
                </p>

                <p>
                  <span className="font-medium text-[#17202a]">
                    Phone:
                  </span>{" "}
                  {user.phone || "Not added"}
                </p>
              </div>
            </div>

            {/* Email verification */}
            <div className="rounded-2xl border border-[#e5e2dc] bg-white p-6">
              <span className="text-2xl">🛡️</span>
              <h3 className="mt-4 font-semibold">Account Security</h3>

              <p className="mt-2 text-sm text-[#687280]">
                Email verification status
              </p>

              <p
                className={`mt-3 text-sm font-semibold ${
                  user.email_verified
                    ? "text-[#2e7d32]"
                    : "text-amber-600"
                }`}
              >
                {user.email_verified
                  ? "Email verified"
                  : "Email not verified"}
              </p>
            </div>
          </div>
        </section>

        {/* Shopping CTA */}
        <section className="mt-8 rounded-2xl bg-[#17202a] p-6 text-white sm:p-8">
          <h2 className="text-xl font-semibold">
            Find something you love.
          </h2>

          <p className="mt-2 text-sm text-white/70">
            Explore the latest products and discover your next favorite.
          </p>

          <Link
            href="/products"
            className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#17202a] transition hover:bg-[#efede8]"
          >
            Explore Products →
          </Link>
        </section>
      </div>
    </main>
  );
}

function DashboardCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-[#e5e2dc] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#c8d9c8] hover:shadow-sm"
    >
      <span className="text-2xl text-[#2e7d32]">{icon}</span>

      <h3 className="mt-4 font-semibold group-hover:text-[#2e7d32]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#687280]">
        {description}
      </p>

      <p className="mt-4 text-sm font-semibold">
        View details →
      </p>
    </Link>
  );
}
