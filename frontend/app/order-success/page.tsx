
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrderSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-[#f8f7f4] px-4">
      <div className="text-center max-w-md">
        <div className="success-check mx-auto mb-6">
          <svg
            viewBox="0 0 52 52"
            className="w-20 h-20"
            fill="none"
          >
            <circle
              cx="26"
              cy="26"
              r="24"
              stroke="#2e7d32"
              strokeWidth="2.5"
              className="success-circle"
            />
            <path
              d="M14 27l8 8 16-17"
              stroke="#2e7d32"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="success-tick"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-[#17202a] mb-3">
          Order Confirmed!
        </h1>

        <p className="text-gray-600 mb-6 leading-7">
          Thank you for shopping with ShopSphere.
          Your order has been placed successfully.
        </p>

        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mb-4">
          <div className="progress-bar h-full bg-[#2e7d32] rounded-full" />
        </div>

        <p className="text-sm text-gray-500">
          Taking you back to the home page...
        </p>

        <button
          onClick={() => router.replace("/")}
          className="mt-6 px-6 py-3 bg-[#17202a] text-white rounded-lg hover:bg-[#2e7d32] transition-colors"
        >
          Continue Shopping
        </button>
      </div>

      <style jsx>{`
        .success-circle {
          stroke-dasharray: 151;
          stroke-dashoffset: 151;
          animation: draw-circle 0.6s ease-out forwards;
        }

        .success-tick {
          stroke-dasharray: 36;
          stroke-dashoffset: 36;
          animation: draw-tick 0.4s ease-out 0.5s forwards;
        }

        .progress-bar {
          width: 0%;
          animation: progress 3s linear forwards;
        }

        @keyframes draw-circle {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes draw-tick {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes progress {
          to {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
