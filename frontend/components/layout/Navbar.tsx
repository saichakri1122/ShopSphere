"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser, User } from "@/lib/auth";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
const initials = user
  ? `${user.first_name.charAt(0)}${user.last_name?.charAt(0) || ""}`.toUpperCase()
  : "";
  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoadingUser(false);
    }

    loadUser();
  }, []);

  async function handleLogout() {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-[#17202a] px-4 py-2 text-center text-[11px] font-medium tracking-wide text-white">
        Free shipping on orders over ₹999&nbsp;&nbsp; • &nbsp;&nbsp;10% off on your first order
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
            <Link
              href="/"
              className="border-b-2 border-[#17202a] pb-1 text-[13px] font-semibold text-[#17202a]"
            >
              Home
            </Link>

            <Link
              href="/products"
              className="text-[13px] font-medium text-[#687280] transition-colors hover:text-[#17202a]"
            >
              Shop
            </Link>

            <Link
              href="/categories"
              className="text-[13px] font-medium text-[#687280] transition-colors hover:text-[#17202a]"
            >
              Categories
            </Link>

            <Link
              href="/new-arrivals"
              className="text-[13px] font-medium text-[#687280] transition-colors hover:text-[#17202a]"
            >
              New Arrivals
            </Link>

            <Link
              href="/deals"
              className="text-[13px] font-medium text-[#687280] transition-colors hover:text-[#17202a]"
            >
              Deals
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-4 md:flex">

            {/* Search */}
            <button
              aria-label="Search products"
              className="flex h-10 w-[185px] items-center gap-2 rounded-full bg-[#efede8] px-4 text-left text-xs text-[#687280] transition-colors hover:bg-[#e7e4de]"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>

              <span>Search for products...</span>
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#17202a] transition-colors hover:bg-[#efede8]"
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

            {/* Bag */}
            <Link
              href="/cart"
              aria-label="Shopping bag"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#17202a] transition-colors hover:bg-[#efede8]"
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
    {/* Profile Button */}
    <button
      onClick={() => setProfileOpen(!profileOpen)}
      aria-label="Open profile menu"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#17202a] text-xs font-semibold text-white transition hover:bg-[#263440]"
    >
      {initials}
    </button>

    {/* Profile Dropdown */}
    {profileOpen && (
      <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-[#e5e2dc] bg-white shadow-lg">

        {/* Email */}
        <div className="border-b border-[#e5e2dc] px-4 py-4">
          <p className="truncate text-sm font-semibold text-[#17202a]">
            {user.email}
          </p>
          <p className="mt-1 text-xs text-[#687280]">
            {user.first_name} {user.last_name || ""}
          </p>
        </div>

        {/* Dashboard */}
        <Link
          href="/dashboard"
          onClick={() => setProfileOpen(false)}
          className="block px-4 py-3 text-sm font-medium text-[#17202a] transition hover:bg-[#f8f7f4]"
        >
          Dashboard
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="block w-full border-t border-[#e5e2dc] px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    )}
  </div>
) : !loadingUser ? (
  <Link
    href="/login"
    className="rounded-full bg-[#17202a] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#263440]"
  >
    Login
  </Link>
) : (
  <div className="h-10 w-10 animate-pulse rounded-full bg-[#efede8]" />
)}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1 md:hidden">

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
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
                <path d="M20.8 8.6c0 5.5-8.8 10.2-8.8 10.2S3.2 14.1 3.2 8.6A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4Z" />
              </svg>
            </Link>

            {/* Bag */}
            <Link
              href="/cart"
              aria-label="Shopping bag"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#17202a]"
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

              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2e7d32] px-1 text-[8px] font-bold text-white">
                0
              </span>
            </Link>

            {/* Menu */}
            <button
              aria-label="Open navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#17202a]"
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}