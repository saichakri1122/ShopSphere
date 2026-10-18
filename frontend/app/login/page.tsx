
"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      console.log("Login successful:", data.user);

      // Redirect based on the logged-in user's role.
      if (data.user?.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-6 text-[#17202a]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            ShopSphere
          </Link>

          <h1 className="mt-8 text-3xl font-semibold">
            Welcome back
          </h1>

          <p className="mt-2 text-[#687280]">
            Sign in to continue shopping.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-[#e5e2dc] bg-white p-7 shadow-sm">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Gmail address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                pattern="[a-zA-Z0-9._%+-]+@gmail\.com"
                title="Please enter a valid Gmail address."
                autoComplete="email"
                className="w-full rounded-xl border border-[#e5e2dc] bg-white px-4 py-3 outline-none focus:border-[#17202a]"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#e5e2dc] bg-white px-4 py-3 pr-12 outline-none focus:border-[#17202a]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#687280] hover:text-[#17202a]"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#17202a] py-3.5 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Register */}
          <div className="mt-6 text-center text-sm text-[#687280]">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#17202a] hover:underline"
            >
              Register now
            </Link>
          </div>
        </div>

        {/* Back Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-[#687280] hover:text-[#17202a]"
          >
            ← Back to ShopSphere
          </Link>
        </div>
      </div>
    </main>
  );
}
