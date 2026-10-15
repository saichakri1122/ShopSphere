"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, type User } from "@/lib/auth";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Deals", href: "/deals" },
];

type Category = {
  id: number;
  name: string;
  slug: string;
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const initials = user
    ? `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`.toUpperCase()
    : "";

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Load user error:", error);
      } finally {
        setLoadingUser(false);
      }
    }

    void loadUser();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/categories",
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to load categories");
        }

        const data = await response.json();

        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Load categories error:", error);
        }
      }
    }

    void loadCategories();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setMobileOpen(false);
    setMobileCategoriesOpen(false);
  }, [pathname]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = search.trim();

    if (!query) return;

    setMobileOpen(false);
    router.push(`/products?search=${encodeURIComponent(query)}`);
  }

  async function handleLogout() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
      setProfileOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  function categoryUrl(slug: string) {
    return `/products?category=${encodeURIComponent(slug)}`;
  }

  return (
    <>
      {/* Announcement */}
      <div className="bg-[#17202a] px-4 py-2 text-center text-[11px] font-medium tracking-wide text-white">
        Free shipping on orders over ₹999&nbsp;&nbsp; • &nbsp;&nbsp;
        10% off on your first order
      </div>

      <header className="sticky top-0 z-50 border-b border-[#e5e2dc] bg-[#f8f7f4]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 text-[25px] font-semibold tracking-[-0.045em] text-[#17202a]"
          >
            ShopSphere
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-7 lg:flex">
            {navigation.map((item) => {
              const active = pathname === item.href;

              if (item.label === "Categories") {
                return (
                  <div key={item.label} className="group relative">
                    <button
                      type="button"
                      aria-haspopup="true"
                      className={`flex items-center gap-1 border-b-2 pb-1 text-[13px] transition-colors ${
                        active
                          ? "border-[#17202a] font-semibold text-[#17202a]"
                          : "border-transparent font-medium text-[#687280] hover:text-[#17202a]"
                      }`}
                    >
                      Categories
                      <span className="text-[10px]">▾</span>
                    </button>

                    {/* Hover Dropdown */}
                    <div className="invisible absolute left-0 top-full z-50 w-56 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      <div className="overflow-hidden rounded-xl border border-[#e5e2dc] bg-white py-2 shadow-lg">
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            href={categoryUrl(category.slug)}
                            className="block px-4 py-3 text-sm text-[#17202a] transition hover:bg-[#f8f7f4] hover:text-[#2e7d32]"
                          >
                            {category.name}
                          </Link>
                        ))}

                        {categories.length === 0 && (
                          <p className="px-4 py-3 text-sm text-gray-500">
                            No categories available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`border-b-2 pb-1 text-[13px] transition-colors ${
                    active
                      ? "border-[#17202a] font-semibold text-[#17202a]"
                      : "border-transparent font-medium text-[#687280] hover:text-[#17202a]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-4 md:flex">
            {/* Search */}
            <form onSubmit={handleSearch} role="search">
              <div className="flex h-10 w-[185px] items-center gap-2 rounded-full bg-[#efede8] px-3 focus-within:ring-2 focus-within:ring-[#2e7d32]/30">
                <button
                  type="submit"
                  aria-label="Search products"
                  className="shrink-0 text-[#687280]"
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>
                </button>

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="w-full min-w-0 bg-transparent text-xs text-[#17202a] outline-none placeholder:text-[#687280]"
                />
              </div>
            </form>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#17202a] transition hover:bg-[#efede8]"
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M20.8 8.6c0 5.5-8.8 10.2-8.8 10.2S3.2 14.1 3.2 8.6A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4Z" />
              </svg>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="Shopping bag"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#17202a] transition hover:bg-[#efede8]"
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M6 8h12l1 12H5L6 8Z" />
                <path d="M9 8a3 3 0 0 1 6 0" />
              </svg>

              <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#2e7d32] px-1 text-[9px] font-bold text-white">
                0
              </span>
            </Link>

            {/* Authentication */}
            {!loadingUser && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#17202a] text-xs font-semibold text-white hover:bg-[#263440]"
                >
                  {initials}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-[#e5e2dc] bg-white shadow-lg">
                    <div className="border-b border-[#e5e2dc] px-4 py-4">
                      <p className="truncate text-sm font-semibold text-[#17202a]">
                        {user.email}
                      </p>
                      <p className="mt-1 text-xs text-[#687280]">
                        {user.first_name} {user.last_name || ""}
                      </p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-3 text-sm font-medium text-[#17202a] hover:bg-[#f8f7f4]"
                    >
                      Dashboard
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-3 text-sm font-medium text-[#17202a] hover:bg-[#f8f7f4]"
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full border-t border-[#e5e2dc] px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : !loadingUser ? (
              <Link
                href="/login"
                className="rounded-full bg-[#17202a] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#263440]"
              >
                Login
              </Link>
            ) : (
              <div className="h-10 w-10 animate-pulse rounded-full bg-[#efede8]" />
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1 md:hidden">
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#17202a]"
            >
              ♡
            </Link>

            <Link
              href="/cart"
              aria-label="Shopping bag"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#17202a]"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M6 8h12l1 12H5L6 8Z" />
                <path d="M9 8a3 3 0 0 1 6 0" />
              </svg>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={
                mobileOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#17202a]"
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="border-t border-[#e5e2dc] bg-[#f8f7f4] px-5 py-5 md:hidden">
            <form onSubmit={handleSearch} className="mb-5" role="search">
              <div className="flex gap-2">
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="min-w-0 flex-1 rounded-xl border border-[#e5e2dc] bg-white px-4 py-3 text-sm text-[#17202a] outline-none"
                />

                <button
                  type="submit"
                  className="rounded-xl bg-[#17202a] px-4 py-3 text-sm font-semibold text-white"
                >
                  Search
                </button>
              </div>
            </form>

            <nav className="flex flex-col gap-1">
              {navigation.map((item) => {
                if (item.label === "Categories") {
                  return (
                    <div key={item.label}>
                      <button
                        type="button"
                        onClick={() =>
                          setMobileCategoriesOpen(!mobileCategoriesOpen)
                        }
                        className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium text-[#17202a] hover:bg-[#efede8]"
                      >
                        Categories
                        <span>
                          {mobileCategoriesOpen ? "−" : "+"}
                        </span>
                      </button>

                      {mobileCategoriesOpen && (
                        <div className="ml-4 border-l border-[#e5e2dc] pl-3">
                          {categories.map((category) => (
                            <Link
                              key={category.id}
                              href={categoryUrl(category.slug)}
                              onClick={() => {
                                setMobileOpen(false);
                                setMobileCategoriesOpen(false);
                              }}
                              className="block rounded-lg px-3 py-3 text-sm text-[#687280] hover:bg-[#efede8] hover:text-[#17202a]"
                            >
                              {category.name}
                            </Link>
                          ))}

                          {categories.length === 0 && (
                            <p className="px-3 py-3 text-sm text-gray-500">
                              No categories available
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-medium text-[#17202a] hover:bg-[#efede8]"
                  >
                    {item.label}
                  </Link>
                );
              })}

              {!loadingUser &&
                (user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl px-3 py-3 text-sm font-medium text-[#17202a] hover:bg-[#efede8]"
                    >
                      Dashboard
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-xl px-3 py-3 text-sm font-medium text-[#17202a] hover:bg-[#efede8]"
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-semibold text-[#17202a] hover:bg-[#efede8]"
                  >
                    Login
                  </Link>
                ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}