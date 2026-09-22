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
      "http://localhost:5000/api/auth/login",
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

    window.location.href = "/dashboard";
  } catch (error) {
    console.error("Login error:", error);
    setError("Unable to connect to the server. Please try again.");
  } finally {
    setLoading(false);
  }
}
  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#17202a] flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
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
<div className="bg-white border border-[#e5e2dc] rounded-2xl p-7 shadow-sm">

  {error && (
    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
      {error}
    </div>
  )}

 <form onSubmit={handleSubmit} className="space-y-5">

  {/* Email */}
  <div>
    <label className="block text-sm font-medium mb-2">
      Gmail address
    </label>

    <input
      type="email"
      placeholder="you@gmail.com"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
      pattern="[a-zA-Z0-9._%+-]+@gmail\.com"
      className="w-full rounded-xl border border-[#e5e2dc] bg-white px-4 py-3 outline-none focus:border-[#17202a]"
    />
  </div>

  {/* Password */}
  <div>
    <label className="block text-sm font-medium mb-2">
      Password
    </label>

    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full rounded-xl border border-[#e5e2dc] bg-white px-4 py-3 pr-12 outline-none focus:border-[#17202a]"
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#687280] hover:text-[#17202a]"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? "🙈" : "👁️"}
      </button>
    </div>
  </div>

  {/* Login Button */}
  <button
    type="submit"
    disabled={loading}
    className="w-full rounded-xl bg-[#17202a] py-3.5 text-white font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="text-center mt-6">
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