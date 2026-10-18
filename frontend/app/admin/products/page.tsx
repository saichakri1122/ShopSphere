
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const API_URL = "https://shopsphere-yx9j.onrender.com";


type Product = {
  id: string | number;
  name: string;
  slug?: string;
  description?: string;
  brand?: string | null;
  price: number | string;
  compare_at_price?: number | string | null;
  stock_quantity: number;
  is_active: boolean;
  category_name?: string;
  category_id?: string | number;
  images?: {
    image_url: string;
    alt_text?: string;
    is_primary?: boolean;
    display_order?: number;
  }[];
};

type EditForm = {
  name: string;
  price: string;
  compare_at_price: string;
  stock_quantity: string;
  is_active: boolean;
};

const inputClass =
  "w-full rounded-xl border border-[#e5e2dc] bg-white px-3 py-2.5 text-sm text-[#17202a] outline-none focus:border-[#2e7d32]";

export default function ManageProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<EditForm>({
    name: "",
    price: "",
    compare_at_price: "",
    stock_quantity: "",
    is_active: true,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/admin/products`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load products.");
      }

      const list = Array.isArray(data.products)
        ? data.products
        : Array.isArray(data.data?.products)
          ? data.data.products
          : Array.isArray(data.data)
            ? data.data
            : null;

      if (!list) {
        throw new Error(
          "The products API returned an unexpected response. Check its response structure."
        );
      }

      setProducts(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function startEdit(product: Product) {
    setEditing(product);
    setForm({
      name: product.name ?? "",
      price: String(product.price ?? ""),
      compare_at_price:
        product.compare_at_price == null
          ? ""
          : String(product.compare_at_price),
      stock_quantity: String(product.stock_quantity ?? 0),
      is_active: Boolean(product.is_active),
    });
    setError("");
    setNotice("");
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    const price = Number(form.price);
    const stock = Number(form.stock_quantity);
    const comparePrice =
      form.compare_at_price.trim() === ""
        ? null
        : Number(form.compare_at_price);

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid product price.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a non-negative whole number.");
      return;
    }

    if (
      comparePrice !== null &&
      (!Number.isFinite(comparePrice) || comparePrice < price)
    ) {
      setError("Compare-at price must be greater than or equal to the price.");
      return;
    }

    setBusyId(editing.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/products/${encodeURIComponent(String(editing.id))}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            price,
            compare_at_price: comparePrice,
            stock_quantity: stock,
            is_active: form.is_active,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to update product.");
      }

      setEditing(null);
      setNotice("Product updated successfully.");
      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action may not be reversible.`
    );

    if (!confirmed) return;

    setBusyId(product.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/products/${encodeURIComponent(String(product.id))}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete product.");
      }

      setProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );

      setNotice(`"${product.name}" was deleted.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  const filteredProducts = products.filter((product) => {
    const term = search.toLowerCase().trim();

    return (
      product.name?.toLowerCase().includes(term) ||
      product.brand?.toLowerCase().includes(term) ||
      product.category_name?.toLowerCase().includes(term) ||
      product.slug?.toLowerCase().includes(term)
    );
  });

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm text-[#687280] hover:text-[#2e7d32]"
            >
              ← Back to Dashboard
            </Link>

            <p className="mt-5 text-sm font-medium text-[#2e7d32]">
              ShopSphere Admin
            </p>

            <h1 className="mt-1 text-3xl font-semibold text-[#17202a]">
              Manage Products
            </h1>

            <p className="mt-2 text-sm text-[#687280]">
              View, edit, activate, and remove catalog products.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center rounded-xl bg-[#17202a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#263440]"
          >
            + Add Product
          </Link>
        </div>

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e5e2dc] bg-white p-5">
            <p className="text-sm text-[#687280]">Products loaded</p>
            <p className="mt-2 text-2xl font-semibold text-[#17202a]">
              {loading ? "—" : products.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e5e2dc] bg-white p-5">
            <p className="text-sm text-[#687280]">Active products</p>
            <p className="mt-2 text-2xl font-semibold text-[#2e7d32]">
              {loading
                ? "—"
                : products.filter((product) => product.is_active).length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e5e2dc] bg-white p-5">
            <p className="text-sm text-[#687280]">Out of stock</p>
            <p className="mt-2 text-2xl font-semibold text-[#17202a]">
              {loading
                ? "—"
                : products.filter(
                    (product) => Number(product.stock_quantity) === 0
                  ).length}
            </p>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#e5e2dc] bg-white">
          <div className="flex flex-col gap-4 border-b border-[#e5e2dc] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-[#17202a]">
                Product Catalog
              </h2>
              <p className="mt-1 text-xs text-[#687280]">
                {filteredProducts.length} matching product(s)
              </p>
            </div>

            <div className="flex gap-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className={`${inputClass} min-w-0 sm:w-64`}
              />

              <button
                type="button"
                onClick={fetchProducts}
                disabled={loading}
                className="shrink-0 rounded-xl border border-[#e5e2dc] px-4 py-2 text-sm font-semibold text-[#17202a] hover:bg-[#f8f7f4] disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="m-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
            >
              {notice}
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-sm text-[#687280]">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-medium text-[#17202a]">
                {products.length === 0
                  ? "No products found."
                  : "No matching products."}
              </p>
              <p className="mt-2 text-sm text-[#687280]">
                Add a product or try another search.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-[#f8f7f4] text-xs uppercase tracking-wider text-[#687280]">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Product</th>
                      <th className="px-5 py-4 font-semibold">Category</th>
                      <th className="px-5 py-4 font-semibold">Price</th>
                      <th className="px-5 py-4 font-semibold">Stock</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#e5e2dc]">
                    {filteredProducts.map((product) => {
                      const primaryImage =
                        product.images?.find((image) => image.is_primary) ??
                        [...(product.images ?? [])].sort(
                          (a, b) =>
                            (a.display_order ?? 0) - (b.display_order ?? 0)
                        )[0];

                      return (
                        <tr key={product.id} className="hover:bg-[#fcfbf9]">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e5e2dc] bg-[#f8f7f4]">
                                {primaryImage?.image_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={primaryImage.image_url}
                                    alt={primaryImage.alt_text || product.name}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <span className="text-xs text-[#687280]">
                                    No image
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="max-w-56 truncate text-sm font-semibold text-[#17202a]">
                                  {product.name}
                                </p>
                                <p className="mt-1 text-xs text-[#687280]">
                                  ID: {product.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-[#687280]">
                            {product.category_name || "—"}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-[#17202a]">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </td>

                          <td className="px-5 py-4 text-sm text-[#17202a]">
                            {product.stock_quantity}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                product.is_active
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {product.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(product)}
                                disabled={busyId === product.id}
                                className="rounded-lg border border-[#e5e2dc] px-3 py-2 text-xs font-semibold text-[#17202a] hover:bg-[#f8f7f4] disabled:opacity-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteProduct(product)}
                                disabled={busyId === product.id}
                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                              >
                                {busyId === product.id ? "Wait..." : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="grid gap-4 p-4 md:hidden">
                {filteredProducts.map((product) => {
                  const image =
                    product.images?.find((item) => item.is_primary) ??
                    product.images?.[0];

                  return (
                    <article
                      key={product.id}
                      className="rounded-xl border border-[#e5e2dc] p-4"
                    >
                      <div className="flex gap-3">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f8f7f4]">
                          {image?.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={image.image_url}
                              alt={image.alt_text || product.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-[#687280]">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-[#17202a]">
                            {product.name}
                          </h3>
                          <p className="mt-1 text-sm text-[#687280]">
                            {product.category_name || "Uncategorized"}
                          </p>
                          <p className="mt-2 font-semibold text-[#17202a]">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-[#687280]">
                        <span>Stock: {product.stock_quantity}</span>
                        <span>{product.is_active ? "Active" : "Inactive"}</span>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(product)}
                          className="flex-1 rounded-lg border border-[#e5e2dc] px-3 py-2 text-sm font-semibold text-[#17202a]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProduct(product)}
                          disabled={busyId === product.id}
                          className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
                        >
                          {busyId === product.id ? "Wait..." : "Delete"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Edit dialog */}
        {editing && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#17202a]/50 p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && busyId === null) {
                setEditing(null);
                setError("");
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-product-title"
              className="my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            >
              <h2
                id="edit-product-title"
                className="text-xl font-semibold text-[#17202a]"
              >
                Edit Product
              </h2>
              <p className="mt-1 text-sm text-[#687280]">
                Update the product details below.
              </p>

              <form onSubmit={saveProduct} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#17202a]">
                    Product Name
                  </label>
                  <input
                    className={inputClass}
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#17202a]">
                    Price (₹)
                  </label>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      setForm({ ...form, price: event.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#17202a]">
                    Compare-at Price (₹)
                  </label>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.compare_at_price}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        compare_at_price: event.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#17202a]">
                    Stock Quantity
                  </label>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock_quantity}
                    onChange={(event) =>
                      setForm({ ...form, stock_quantity: event.target.value })
                    }
                    required
                  />
                </div>

                <label className="flex items-center gap-3 text-sm text-[#17202a]">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(event) =>
                      setForm({ ...form, is_active: event.target.checked })
                    }
                    className="h-4 w-4 accent-[#2e7d32]"
                  />
                  Product is active and visible to customers
                </label>

                {error && (
                  <p role="alert" className="text-sm text-red-700">
                    {error}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={() => {
                      setEditing(null);
                      setError("");
                    }}
                    className="rounded-xl border border-[#e5e2dc] px-5 py-3 text-sm font-semibold text-[#17202a] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={busyId !== null}
                    className="rounded-xl bg-[#17202a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#263440] disabled:opacity-50"
                  >
                    {busyId !== null ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
