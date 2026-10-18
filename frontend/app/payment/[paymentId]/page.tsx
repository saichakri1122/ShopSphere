
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Payment = {
  id: string;
  order_id: string;
  amount: number | string;
  currency: string;
  status: string;
  razorpay_order_id?: string;
  failure_reason?: string | null;
};

export default function MockPaymentPage() {
  const params = useParams();
  const router = useRouter();

  const paymentId = String(params.paymentId);

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const loadPayment = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/payments/${encodeURIComponent(paymentId)}`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load payment.");
      }

      setPayment(data.payment);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load payment."
      );
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    void loadPayment();
  }, [loadPayment]);

  const simulatePayment = async (
    result: "success" | "failure"
  ) => {
    if (processing || !payment) return;

    if (payment.status.toLowerCase() === "paid") {
      router.replace("/order-success");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const endpoint =
        result === "success"
          ? "simulate-success"
          : "simulate-failure";

      const response = await fetch(
        `${API_URL}/api/payments/${encodeURIComponent(paymentId)}/${endpoint}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: "Payment declined in mock gateway",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Payment simulation failed."
        );
      }

      setPayment(data.payment);

      if (result === "success") {
        // Update the navbar cart count.
        window.dispatchEvent(
          new Event("shopsphere:cart-updated")
        );

        // Show the order confirmation animation.
        router.replace("/order-success");
      } else {
        setError(
          data.message ||
            "Mock payment failed. Please try again."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process mock payment."
      );

      await loadPayment();
    } finally {
      setProcessing(false);
    }
  };

  const amount = Number(payment?.amount ?? 0);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4]">
        <p className="text-gray-600">
          Loading mock payment gateway...
        </p>
      </main>
    );
  }

  if (!payment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#e5e2dc] bg-white p-6 text-center">
          <h1 className="text-xl font-bold text-[#17202a]">
            Payment unavailable
          </h1>

          <p className="mt-3 text-sm text-red-600">
            {error || "Payment details could not be loaded."}
          </p>

          <button
            onClick={() => router.push("/checkout")}
            className="mt-6 rounded-xl bg-[#2e7d32] px-5 py-3 font-semibold text-white"
          >
            Back to checkout
          </button>
        </div>
      </main>
    );
  }

  const alreadyPaid = payment.status.toLowerCase() === "paid";
  const paymentFailed = payment.status.toLowerCase() === "failed";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-4 py-10 text-[#17202a]">
      <section className="w-full max-w-lg rounded-3xl border border-[#e5e2dc] bg-white p-6 shadow-sm sm:p-9">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl">
            <span aria-hidden="true">🔒</span>
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#2e7d32]">
            ShopSphere Demo
          </p>

          <h1 className="mt-2 text-2xl font-bold">
            Mock Payment Gateway
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            This is a simulated payment. No real money will be charged.
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-[#f8f7f4] p-5">
          <p className="text-sm text-gray-500">
            Amount to pay
          </p>

          <p className="mt-1 text-3xl font-bold">
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: payment.currency || "INR",
              maximumFractionDigits: 2,
            }).format(amount)}
          </p>

          <div className="mt-4 border-t border-[#e5e2dc] pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Payment ID</span>
              <span className="max-w-[60%] break-all text-right font-medium">
                {payment.id}
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-4">
              <span className="text-gray-500">Status</span>
              <span
                className={`font-semibold capitalize ${
                  alreadyPaid
                    ? "text-green-700"
                    : paymentFailed
                    ? "text-red-600"
                    : "text-gray-700"
                }`}
              >
                {payment.status}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {alreadyPaid ? (
          <button
            onClick={() => router.replace("/order-success")}
            className="mt-6 w-full rounded-xl bg-[#2e7d32] px-5 py-3.5 font-semibold text-white hover:bg-green-800"
          >
            Continue
          </button>
        ) : (
          <>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => simulatePayment("success")}
                disabled={processing || paymentFailed}
                className="w-full rounded-xl bg-[#2e7d32] px-5 py-3.5 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing
                  ? "Processing..."
                  : "Simulate Payment Success"}
              </button>

              <button
                onClick={() => simulatePayment("failure")}
                disabled={processing || paymentFailed}
                className="w-full rounded-xl border border-red-200 bg-white px-5 py-3.5 font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Simulate Payment Failure
              </button>

              {paymentFailed && (
                <p className="text-center text-sm text-red-600">
                  This payment attempt failed. A new payment attempt
                  may be required to retry.
                </p>
              )}

              <button
                onClick={() =>
                  router.push(`/orders/${payment.order_id}`)
                }
                disabled={processing}
                className="w-full rounded-xl px-5 py-3 font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
              >
                Return to order
              </button>
            </div>
          </>
        )}

        <p className="mt-6 text-center text-xs leading-5 text-gray-400">
          Development mode only. Do not enter real card details or
          banking credentials.
        </p>
      </section>
    </main>
  );
}
