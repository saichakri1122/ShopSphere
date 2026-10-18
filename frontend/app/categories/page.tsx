"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";

type Category = {
  id: number;
  name: string;
  slug: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load categories");
        return res.json();
      })
      .then((data) => setCategories(data.categories || []))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#17202a]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold">Categories</h1>

        {loading ? (
          <p className="text-gray-500">Loading categories...</p>
        ) : (
          <div className="flex flex-col">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.slug)}`}
                className="border-b border-[#e5e2dc] py-4 text-base transition hover:pl-2 hover:text-[#2e7d32]"
              >
                {category.name} →
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}