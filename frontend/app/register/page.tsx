"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");

  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;
    const isFormComplete =
  firstName.trim() !== "" &&
  lastName.trim() !== "" &&
  email.trim() !== "" &&
  phone.trim() !== "" &&
  password.trim() !== "" &&
  confirmPassword.trim() !== "";

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  setError("");
  setSuccess("");

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  const formData = new FormData(e.currentTarget);

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;

  try {
    setLoading(true);

    const response = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Registration failed.");
      return;
    }

    setSuccess("Account created successfully!");

    setTimeout(() => {
      window.location.href = "/login";
    }, 1200);
  } catch (error) {
    console.error("Registration error:", error);
    setError("Unable to connect to the server. Please try again.");
  } finally {
    setLoading(false);
  }

  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#17202a] flex items-center justify-center px-4 sm:px-6 py-10 sm:py-12">
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
            Create your account
          </h1>

          <p className="mt-2 text-[#687280]">
            Join ShopSphere and start shopping.
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white border border-[#e5e2dc] rounded-2xl p-5 sm:p-7 shadow-sm">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* First + Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium mb-2">
                  First name
                </label>

                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  name="firstName"
                  type="text"
                  placeholder="First name"
                  required
                  className="w-full rounded-xl border border-[#e5e2dc] bg-white px-4 py-3 outline-none focus:border-[#17202a]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Last name
                </label>

                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  name="lastName"
                  type="text"
                  placeholder="Last name"
                  className="w-full rounded-xl border border-[#e5e2dc] bg-white px-4 py-3 outline-none focus:border-[#17202a]"
                />
              </div>

            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Gmail address
              </label>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                type="email"
                placeholder="you@gmail.com"
                required
                className="w-full rounded-xl border border-[#e5e2dc] bg-white px-4 py-3 outline-none focus:border-[#17202a]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Phone number
              </label>

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                name="phone"
                type="tel"
                placeholder="10-digit phone number"
                required
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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
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

              <p className="mt-2 text-xs text-[#687280]">
                Password must be at least 8 characters.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full rounded-xl border bg-white px-4 py-3 pr-12 outline-none focus:border-[#17202a] ${
                    passwordsMismatch
                      ? "border-red-400"
                      : "border-[#e5e2dc]"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#687280] hover:text-[#17202a]"
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {/* Password mismatch message */}
              {passwordsMismatch && (
                <p className="mt-2 text-xs text-red-500">
                  Passwords do not match.
                </p>
              )}
            </div>

            {/* Create Account */}
<button
  type="submit"
  disabled={!isFormComplete || passwordsMismatch || loading}
  className="w-full rounded-xl bg-[#17202a] py-3.5 text-white font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
>
  {loading ? "Creating account..." : "Create Account"}
</button>

          </form>

          {/* Login */}
          <div className="mt-6 text-center text-sm text-[#687280]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#17202a] hover:underline"
            >
              Login
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
