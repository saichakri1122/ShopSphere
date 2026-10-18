
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Address = {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  address_type?: "home" | "work" | "other";
  is_default?: boolean;
};

type AddressForm = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: "home" | "work" | "other";
};

const EMPTY_FORM: AddressForm = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  addressType: "home",
};

const inputClass =
  "w-full rounded-xl border border-[#e5e2dc] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2e7d32] focus:ring-2 focus:ring-green-100";

function normalizeAddress(address: any): Address {
  return {
    id: address.id ?? address.address_id,
    full_name: address.full_name ?? address.fullName ?? "",
    phone: address.phone ?? "",
    address_line1: address.address_line1 ?? address.addressLine1 ?? "",
    address_line2: address.address_line2 ?? address.addressLine2 ?? "",
    city: address.city ?? "",
    state: address.state ?? "",
    postal_code: address.postal_code ?? address.postalCode ?? "",
    country: address.country ?? "India",
    address_type: address.address_type ?? address.addressType ?? "home",
    is_default: Boolean(address.is_default ?? address.isDefault),
  };
}

export default function MyAddressesPage() {
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/addresses`, {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load your addresses.");
      }

      const result = data.addresses;
      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.items)
        ? result.items
        : [];

      setAddresses(list.map(normalizeAddress));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your addresses."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  const updateField = (
    field: keyof AddressForm,
    value: string
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setNotice("");
    setFormOpen(true);
  };

  const openEditForm = (address: Address) => {
    setEditingId(address.id);

    setForm({
      fullName: address.full_name,
      phone: address.phone,
      addressLine1: address.address_line1,
      addressLine2: address.address_line2 ?? "",
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
      addressType: address.address_type ?? "home",
    });

    setError("");
    setNotice("");
    setFormOpen(true);
  };

  const saveAddress = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      ...form,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      country: form.country.trim(),
    };

    try {
      const isEditing = Boolean(editingId);

      const response = await fetch(
        isEditing
          ? `${API_URL}/api/addresses/${encodeURIComponent(editingId!)}`
          : `${API_URL}/api/addresses`,
        {
          method: isEditing ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save this address.");
      }

      setFormOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setNotice(
        isEditing
          ? "Address updated successfully."
          : "Address added successfully."
      );

      await loadAddresses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save this address."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (address: Address) => {
    if (busyId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    setBusyId(address.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/api/addresses/${encodeURIComponent(address.id)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete this address.");
      }

      setAddresses((current) =>
        current.filter((item) => item.id !== address.id)
      );

      setNotice("Address deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete this address."
      );
    } finally {
      setBusyId(null);
    }
  };

  const setDefaultAddress = async (address: Address) => {
    if (busyId || address.is_default) return;

    setBusyId(address.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/api/addresses/${encodeURIComponent(address.id)}/default`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to set the default address."
        );
      }

      await loadAddresses();
      setNotice("Default address updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the default address."
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-4 py-8 text-[#17202a] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-6 text-sm font-medium text-gray-500 transition hover:text-[#2e7d32]"
        >
          ← Back to Dashboard
        </button>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#2e7d32]">
              YOUR ACCOUNT
            </p>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
              My Addresses
            </h1>
            <p className="mt-2 text-gray-500">
              Manage your saved delivery addresses.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="rounded-xl bg-[#2e7d32] px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            + Add New Address
          </button>
        </div>

        {notice && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800"
          >
            {notice}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {formOpen && (
          <section className="mt-8 rounded-2xl border border-[#e5e2dc] bg-white p-5 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Address" : "Add New Address"}
              </h2>

              <button
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                }}
                className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <form onSubmit={saveAddress}>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  Full Name *
                  <input
                    required
                    maxLength={100}
                    className={`${inputClass} mt-2`}
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Enter full name"
                  />
                </label>

                <label className="text-sm font-medium">
                  Phone Number *
                  <input
                    required
                    type="tel"
                    maxLength={15}
                    pattern="[0-9+\- ]{10,15}"
                    className={`${inputClass} mt-2`}
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="Enter phone number"
                  />
                </label>

                <label className="text-sm font-medium sm:col-span-2">
                  Address Line 1 *
                  <input
                    required
                    maxLength={200}
                    className={`${inputClass} mt-2`}
                    value={form.addressLine1}
                    onChange={(e) =>
                      updateField("addressLine1", e.target.value)
                    }
                    placeholder="House number, street, area"
                  />
                </label>

                <label className="text-sm font-medium sm:col-span-2">
                  Address Line 2
                  <input
                    maxLength={200}
                    className={`${inputClass} mt-2`}
                    value={form.addressLine2}
                    onChange={(e) =>
                      updateField("addressLine2", e.target.value)
                    }
                    placeholder="Landmark, apartment, etc. (optional)"
                  />
                </label>

                <label className="text-sm font-medium">
                  City *
                  <input
                    required
                    maxLength={100}
                    className={`${inputClass} mt-2`}
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="City"
                  />
                </label>

                <label className="text-sm font-medium">
                  State *
                  <input
                    required
                    maxLength={100}
                    className={`${inputClass} mt-2`}
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    placeholder="State"
                  />
                </label>

                <label className="text-sm font-medium">
                  Postal Code *
                  <input
                    required
                    minLength={3}
                    maxLength={20}
                    className={`${inputClass} mt-2`}
                    value={form.postalCode}
                    onChange={(e) =>
                      updateField("postalCode", e.target.value)
                    }
                    placeholder="Postal / PIN code"
                  />
                </label>

                <label className="text-sm font-medium">
                  Country *
                  <input
                    required
                    maxLength={100}
                    className={`${inputClass} mt-2`}
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    placeholder="Country"
                  />
                </label>

                <label className="text-sm font-medium sm:col-span-2">
                  Address Type
                  <select
                    className={`${inputClass} mt-2`}
                    value={form.addressType}
                    onChange={(e) =>
                      updateField(
                        "addressType",
                        e.target.value as AddressForm["addressType"]
                      )
                    }
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#2e7d32] px-6 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Save Changes"
                    : "Save Address"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormOpen(false);
                    setEditingId(null);
                    setForm(EMPTY_FORM);
                  }}
                  disabled={saving}
                  className="rounded-xl border border-[#e5e2dc] px-6 py-3 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {loading ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-2xl border border-[#e5e2dc] bg-white"
              />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#e5e2dc] bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f8f7f4] text-3xl">
              📍
            </div>

            <h2 className="mt-5 text-xl font-bold">
              No saved addresses
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              Add a delivery address to make your next checkout easier.
            </p>

            <button
              onClick={openAddForm}
              className="mt-6 rounded-xl bg-[#2e7d32] px-6 py-3 font-semibold text-white hover:bg-green-800"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          <>
            <p className="mt-8 text-sm text-gray-500">
              {addresses.length}{" "}
              {addresses.length === 1 ? "address" : "addresses"} saved
            </p>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {addresses.map((address) => (
                <article
                  key={address.id}
                  className="rounded-2xl border border-[#e5e2dc] bg-white p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f8f7f4] text-xl">
                        {address.address_type === "work"
                          ? "💼"
                          : address.address_type === "other"
                          ? "📍"
                          : "🏠"}
                      </div>

                      <div>
                        <h2 className="font-bold">
                          {address.full_name}
                        </h2>
                        <p className="mt-1 text-xs capitalize text-gray-500">
                          {address.address_type || "home"} address
                        </p>
                      </div>
                    </div>

                    {address.is_default && (
                      <span className="shrink-0 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="mt-5 space-y-1.5 text-sm leading-6 text-gray-600">
                    <p>{address.address_line1}</p>

                    {address.address_line2 && (
                      <p>{address.address_line2}</p>
                    )}

                    <p>
                      {address.city}, {address.state}{" "}
                      {address.postal_code}
                    </p>
                    <p>{address.country}</p>
                    <p className="pt-2 font-medium text-[#17202a]">
                      Phone: {address.phone}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-[#eeeae4] pt-4">
                    {!address.is_default && (
                      <button
                        onClick={() => void setDefaultAddress(address)}
                        disabled={busyId !== null}
                        className="rounded-lg border border-[#e5e2dc] px-3 py-2 text-xs font-semibold hover:border-[#2e7d32] hover:text-[#2e7d32] disabled:opacity-50"
                      >
                        Set as Default
                      </button>
                    )}

                    <button
                      onClick={() => openEditForm(address)}
                      disabled={busyId !== null}
                      className="rounded-lg border border-[#e5e2dc] px-3 py-2 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => void deleteAddress(address)}
                      disabled={busyId !== null}
                      className="rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {busyId === address.id ? "Please wait..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
