
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  id?: string;
  product?: { id?: string };
  data?: {
    id?: string;
    product?: { id?: string };
  };
};

const API_URL = "http://localhost:5000";

const inputClass =
  "w-full rounded-xl border border-[#e5e2dc] bg-white px-4 py-3 text-sm text-[#17202a] outline-none transition focus:border-[#17202a] disabled:cursor-not-allowed disabled:bg-[#f8f7f4]";

export default function AddProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    category_id: "",
    brand: "",
    price: "",
    compare_at_price: "",
    stock_quantity: "",
    is_featured: false,
    is_new_arrival: false,
    is_essential: false,
    is_active: true,
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [createdProductId, setCreatedProductId] = useState<string | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(`${API_URL}/api/categories`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch categories.");
        }

        setCategories(data.categories || []);
      } catch (err) {
        console.error("Fetch categories error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load categories."
        );
      } finally {
        setLoadingCategories(false);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!image) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [image]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setImage(null);
      e.target.value = "";
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImage(null);
      e.target.value = "";
      setError("Image size must be 5 MB or less.");
      return;
    }

    setImage(file);
  }

  async function readResponse(response: Response): Promise<ApiResponse> {
    return response.json().catch(() => ({}));
  }

  async function uploadProductImage(productId: string) {
    if (!image) {
      throw new Error("Please select a product image.");
    }

    const imageFormData = new FormData();
    imageFormData.append("image", image);
    imageFormData.append("alt_text", formData.name.trim());
    imageFormData.append("display_order", "0");
    imageFormData.append("is_primary", "true");

    const response = await fetch(
      `${API_URL}/api/products/${encodeURIComponent(productId)}/images`,
      {
        method: "POST",
        credentials: "include",
        body: imageFormData,
      }
    );

    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Failed to upload product image.");
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("FORM SUBMITTED — handleSubmit called");

    setError("");
    setSuccess("");

    // Validate explicitly so users receive an on-page message.
    if (
      !formData.name.trim() ||
      !formData.slug.trim() ||
      !formData.description.trim() ||
      !formData.category_id ||
      formData.price.trim() === "" ||
      formData.stock_quantity.trim() === ""
    ) {
      setError("Please fill in all required product details.");
      return;
    }

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(formData.slug.trim())) {
      setError(
        "Slug must use lowercase letters, numbers, and single hyphens."
      );
      return;
    }

    const price = Number(formData.price);
    const stock = Number(formData.stock_quantity);

    if (!Number.isFinite(price) || price < 0) {
      setError("Please enter a valid, non-negative product price.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock quantity must be a non-negative whole number.");
      return;
    }

    if (formData.compare_at_price.trim() !== "") {
      const comparePrice = Number(formData.compare_at_price);

      if (!Number.isFinite(comparePrice) || comparePrice < price) {
        setError(
          "Compare-at price must be valid and greater than or equal to the price."
        );
        return;
      }
    }

    if (!image) {
      setError("Please select a product image.");
      return;
    }

    setLoading(true);

    // Use a local variable so the catch block knows whether creation
    // succeeded, even before React updates state.
    let productId: string | null = createdProductId;

    try {
      // Step 1: Create the product only once.
      if (!productId) {
        const response = await fetch(`${API_URL}/api/admin/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            description: formData.description.trim(),
            category_id: formData.category_id,
            brand: formData.brand.trim() || null,
            price,
            compare_at_price:
              formData.compare_at_price.trim() !== ""
                ? Number(formData.compare_at_price)
                : null,
            stock_quantity: stock,
            is_featured: formData.is_featured,
            is_new_arrival: formData.is_new_arrival,
            is_essential: formData.is_essential,
            is_active: formData.is_active,
          }),
        });

        const data = await readResponse(response);

        if (!response.ok) {
          throw new Error(
            data.message || `Product creation failed (HTTP ${response.status}).`
          );
        }

        productId =
          data.product?.id ??
          data.data?.product?.id ??
          data.id ??
          data.data?.id ??
          null;

        if (!productId) {
          throw new Error(
            "The product API did not return its ID. Check the backend response before submitting again."
          );
        }

        setCreatedProductId(productId);
      }

      // Step 2: Upload the image to Cloudinary through the backend.
      await uploadProductImage(productId);

      // Step 3: Notify the admin only after both operations succeed.
      setSuccess("Product and image added successfully!");

      window.alert("Success! Product has been added to ShopSphere.");

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      console.error("Save product error:", err);

      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";

      if (productId) {
        setCreatedProductId(productId);
        setError(
          `Product was created, but the image step did not finish: ${message} Select an image and retry.`
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  const productAlreadyCreated = Boolean(createdProductId);

  const settings = [
    ["is_featured", "Featured Product"],
    ["is_new_arrival", "New Arrival"],
    ["is_essential", "Everyday Essential"],
    ["is_active", "Active Product"],
  ] as const;

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 text-sm font-medium text-[#687280] hover:text-[#17202a]"
          >
            ← Back
          </button>

          <p className="text-sm font-medium text-[#2e7d32]">Admin</p>

          <h1 className="mt-1 text-3xl font-semibold text-[#17202a]">
            Add Product
          </h1>

          <p className="mt-2 text-sm text-[#687280]">
            Add a new product and its image to the ShopSphere catalog.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        {productAlreadyCreated && (
          <div className="mb-6 rounded-xl border border-[#e5e2dc] bg-white px-4 py-3 text-sm text-[#687280]">
            Product details are saved. Retry the image upload without creating
            the product again.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-6"
        >
          <fieldset
            disabled={loading || productAlreadyCreated}
            className="space-y-6"
          >
            {/* Product Information */}
            <section className="rounded-2xl border border-[#e5e2dc] bg-white p-6">
              <h2 className="text-lg font-semibold text-[#17202a]">
                Product Information
              </h2>

              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#17202a]">
                    Product Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Wireless Headphones"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="slug" className="mb-2 block text-sm font-medium text-[#17202a]">
                    Slug
                  </label>
                  <input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="wireless-headphones"
                    className={inputClass}
                    required
                  />
                  <p className="mt-1 text-xs text-[#687280]">
                    Use lowercase letters, numbers, and hyphens.
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="mb-2 block text-sm font-medium text-[#17202a]">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe your product..."
                    className={`${inputClass} resize-none`}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="category_id" className="mb-2 block text-sm font-medium text-[#17202a]">
                      Category
                    </label>
                    <select
                      id="category_id"
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      disabled={loadingCategories}
                      className={inputClass}
                      required
                    >
                      <option value="">
                        {loadingCategories ? "Loading categories..." : "Select a category"}
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="brand" className="mb-2 block text-sm font-medium text-[#17202a]">
                      Brand
                    </label>
                    <input
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="ShopSphere"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Pricing & Inventory */}
            <section className="rounded-2xl border border-[#e5e2dc] bg-white p-6">
              <h2 className="text-lg font-semibold text-[#17202a]">
                Pricing & Inventory
              </h2>

              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
                <div>
                  <label htmlFor="price" className="mb-2 block text-sm font-medium text-[#17202a]">
                    Price (₹)
                  </label>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="2999"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="compare_at_price" className="mb-2 block text-sm font-medium text-[#17202a]">
                    Compare-at Price (₹)
                  </label>
                  <input
                    id="compare_at_price"
                    type="number"
                    name="compare_at_price"
                    value={formData.compare_at_price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="3999"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="stock_quantity" className="mb-2 block text-sm font-medium text-[#17202a]">
                    Stock Quantity
                  </label>
                  <input
                    id="stock_quantity"
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    placeholder="50"
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Product Settings */}
            <section className="rounded-2xl border border-[#e5e2dc] bg-white p-6">
              <h2 className="text-lg font-semibold text-[#17202a]">
                Product Settings
              </h2>

              <div className="mt-6 space-y-4">
                {settings.map(([name, label]) => (
                  <label key={name} className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      name={name}
                      checked={formData[name]}
                      onChange={handleChange}
                      className="h-4 w-4 accent-[#2e7d32]"
                    />
                    <span className="text-sm text-[#17202a]">{label}</span>
                  </label>
                ))}
              </div>
            </section>
          </fieldset>

          {/* Product Image */}
          <section className="rounded-2xl border border-[#e5e2dc] bg-white p-6">
            <h2 className="text-lg font-semibold text-[#17202a]">
              Product Image
            </h2>

            <p className="mt-2 text-sm text-[#687280]">
              JPG, PNG, or WebP. Maximum file size: 5 MB.
            </p>

            <div className="mt-5">
              {imagePreview ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-[#e5e2dc] bg-[#f8f7f4] sm:w-48">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Selected product preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="break-all text-sm font-medium text-[#17202a]">
                      {image?.name}
                    </p>
                    <p className="mt-1 text-xs text-[#687280]">
                      {image ? `${(image.size / (1024 * 1024)).toFixed(2)} MB` : ""}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e5e2dc] bg-[#f8f7f4] px-4 py-8 text-center">
                  <span className="text-3xl" aria-hidden="true">↑</span>
                  <p className="mt-3 text-sm font-medium text-[#17202a]">
                    Choose a product image
                  </p>
                  <p className="mt-1 text-xs text-[#687280]">JPG, PNG, or WebP</p>
                </div>
              )}

              <div className="mt-4">
                <label
                  htmlFor="product-image"
                  className="inline-flex cursor-pointer items-center rounded-xl border border-[#e5e2dc] bg-white px-4 py-3 text-sm font-semibold text-[#17202a] transition hover:bg-[#f8f7f4]"
                >
                  {image ? "Choose Another Image" : "Select Image"}
                </label>

                <input
                  id="product-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={loading}
                  className="sr-only"
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              disabled={loading}
              className="rounded-xl border border-[#e5e2dc] bg-white px-6 py-3 text-sm font-semibold text-[#17202a] transition hover:bg-[#f8f7f4] disabled:opacity-60"
            >
              Cancel
            </button>

<button
  type="submit"
  disabled={loading}
  onClick={() => console.log("Create Product button clicked")}
  className="rounded-xl bg-[#17202a] px-6 py-3 text-sm font-semibold text-white"
>
  {loading ? "Creating Product..." : "Create Product"}
</button>
          </div>
        </form>
      </div>
    </main>
  );
}
