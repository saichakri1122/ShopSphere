"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000";

type Address = {
  id?: string;
  address_id?: string;
  full_name?: string;
  fullName?: string;
  phone: string;
  address_line1?: string;
  addressLine1?: string;
  address_line2?: string | null;
  addressLine2?: string;
  city: string;
  state: string;
  postal_code?: string;
  postalCode?: string;
  country: string;
  address_type?: string;
  addressType?: string;
  is_default?: boolean;
  isDefault?: boolean;
};

type CartItem = {
  cart_item_id?: string;
  id?: string;
  product_id: string;
  name: string;
  price: number | string;
  quantity: number;
  image_url?: string | null;
  stock_quantity?: number;
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

const emptyAddress: AddressForm = {
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

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function addressId(address: Address) {
  return address.address_id ?? address.id ?? "";
}

function getAddressName(address: Address) {
  return address.fullName ?? address.full_name ?? "";
}

function getAddressLine(address: Address) {
  return address.addressLine1 ?? address.address_line1 ?? "";
}

function getAddressType(address: Address) {
  return address.addressType ?? address.address_type ?? "home";
}

function getPostalCode(address: Address) {
  return address.postalCode ?? address.postal_code ?? "";
}

export default function CheckoutPage() {
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [items, setItems] = useState<CartItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState("");
  const [addressForm, setAddressForm] =
    useState<AddressForm>(emptyAddress);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCheckout = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [addressResponse, cartResponse] = await Promise.all([
        fetch(`${API_URL}/api/addresses`, {
          credentials: "include",
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/cart`, {
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      const addressData = await addressResponse.json();
      const cartData = await cartResponse.json();

      if (!addressResponse.ok) {
        throw new Error(
          addressData.message || "Unable to load saved addresses."
        );
      }

      if (!cartResponse.ok) {
        throw new Error(cartData.message || "Unable to load your cart.");
      }

      const savedAddresses: Address[] = addressData.addresses ?? [];
      const cartItems: CartItem[] = cartData.cart?.items ?? [];

      setAddresses(savedAddresses);
      setItems(cartItems);

      const defaultAddress = savedAddresses.find(
        (address) => address.is_default || address.isDefault
      );

      setSelectedAddressId((current) => {
        if (
          current &&
          savedAddresses.some((address) => addressId(address) === current)
        ) {
          return current;
        }

        return defaultAddress
          ? addressId(defaultAddress)
          : savedAddresses.length
            ? addressId(savedAddresses[0])
            : "";
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load checkout details."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCheckout();
  }, [loadCheckout]);

  const subtotal = items.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  // This is a preview. The backend must validate the coupon and
  // calculate the final discount when creating the order.
  const discount =
    appliedCoupon === "FIRST10" && subtotal > 999
      ? Math.round(subtotal * 0.1 * 100) / 100
      : 0;

  const shipping = 0;
  const total = subtotal - discount + shipping;

  const updateFormField = (
    field: keyof AddressForm,
    value: string
  ) => {
    setAddressForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const openAddAddress = () => {
    setEditingAddressId("");
    setAddressForm(emptyAddress);
    setShowAddressForm(true);
    setError("");
    setNotice("");
  };

  const openEditAddress = (address: Address) => {
    setEditingAddressId(addressId(address));

    setAddressForm({
      fullName: getAddressName(address),
      phone: address.phone ?? "",
      addressLine1: getAddressLine(address),
      addressLine2:
        address.addressLine2 ?? address.address_line2 ?? "",
      city: address.city ?? "",
      state: address.state ?? "",
      postalCode: getPostalCode(address),
      country: address.country ?? "India",
      addressType: (getAddressType(address).toLowerCase() || "home") as
        | "home"
        | "work"
        | "other",
    });

    setShowAddressForm(true);
    setError("");
    setNotice("");
  };

  const saveAddress = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!/^[0-9]{10,15}$/.test(addressForm.phone.trim())) {
      setError("Phone number must contain 10 to 15 digits.");
      return;
    }

    if (!/^[a-zA-Z0-9 -]{3,20}$/.test(addressForm.postalCode.trim())) {
      setError("Please provide a valid postal code.");
      return;
    }

    setSavingAddress(true);

    try {
      const url = editingAddressId
        ? `${API_URL}/api/addresses/${encodeURIComponent(editingAddressId)}`
        : `${API_URL}/api/addresses`;

      const response = await fetch(url, {
        method: editingAddressId ? "PATCH" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...addressForm,
          fullName: addressForm.fullName.trim(),
          phone: addressForm.phone.trim(),
          addressLine1: addressForm.addressLine1.trim(),
          addressLine2: addressForm.addressLine2.trim(),
          city: addressForm.city.trim(),
          state: addressForm.state.trim(),
          postalCode: addressForm.postalCode.trim(),
          country: addressForm.country.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save address.");
      }

      const savedAddress: Address | undefined = data.address;

      setShowAddressForm(false);
      setNotice(data.message || "Address saved successfully.");

      if (savedAddress && addressId(savedAddress)) {
        setSelectedAddressId(addressId(savedAddress));
      }

      await loadCheckout();

      if (savedAddress && addressId(savedAddress)) {
        setSelectedAddressId(addressId(savedAddress));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save address."
      );
    } finally {
      setSavingAddress(false);
    }
  };

  // Apply the FIRST10 coupon preview.
  // Actual first-order eligibility is checked by the backend.
  const applyCoupon = () => {
    setError("");
    setNotice("");

    const normalizedCode = couponCode.trim().toUpperCase();

    if (!normalizedCode) {
      setAppliedCoupon("");
      setError("Enter a coupon code first.");
      return;
    }

    if (normalizedCode !== "FIRST10") {
      setAppliedCoupon("");
      setError("Invalid coupon code. Try FIRST10.");
      return;
    }

    if (subtotal <= 999) {
      setAppliedCoupon("");
      setError(
        "FIRST10 is valid only when your cart subtotal is above ₹999."
      );
      return;
    }

    setAppliedCoupon("FIRST10");
    setCouponCode("FIRST10");

    setNotice(
      "FIRST10 preview applied: 10% off. Your first-order eligibility will be verified by the server when you place the order."
    );
  };

const placeOrder = async () => {
  setError("");
  setNotice("");

  if (!items.length) {
    setError("Your cart is empty.");
    return;
  }

  if (!selectedAddressId) {
    setError("Please select or add a delivery address.");
    return;
  }

  setPlacingOrder(true);

  try {
    // Step 1: Create the order on the backend.
    const orderResponse = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        addressId: selectedAddressId,
        couponCode: appliedCoupon || undefined,
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      throw new Error(
        orderData.message || "Unable to create your order."
      );
    }

    const orderId =
      orderData.order?.id ??
      orderData.order?.order_id ??
      orderData.order?.orderId;

    if (!orderId) {
      throw new Error("Order created, but its ID was not returned.");
    }

    // Step 2: COD can proceed directly to order details.
    if (paymentMethod === "cod") {
      window.dispatchEvent(new Event("shopsphere:cart-updated"));
      router.push(`/orders/${orderId}`);
      return;
    }

    // Step 3: Create a payment attempt for online payment.
    if (paymentMethod === "online") {
      const paymentResponse = await fetch(`${API_URL}/api/payments`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(
          paymentData.message || "Unable to initialize payment."
        );
      }

      const paymentId = paymentData.payment?.id;

      if (!paymentId) {
        throw new Error("Payment was created, but its ID was not returned.");
      }

      window.dispatchEvent(new Event("shopsphere:cart-updated"));
      router.push(`/payment/${paymentId}`);
    }
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to continue with checkout."
    );
  } finally {
    setPlacingOrder(false);
  }
};

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-[#2e7d32]" />
          <p className="text-sm text-gray-600">
            Loading your checkout...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-4 py-8 text-[#17202a] sm:px-6 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#2e7d32]">
            ShopSphere
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">Checkout</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Confirm your delivery details and review your order.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
            {error.toLowerCase().includes("log in") && (
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="ml-2 font-bold underline"
              >
                Log in
              </button>
            )}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {notice}
          </div>
        )}

        {!items.length ? (
          <section className="rounded-2xl border border-[#e5e2dc] bg-white px-6 py-16 text-center">
            <div className="mb-4 text-5xl">🛒</div>
            <h2 className="text-2xl font-bold">Your cart is empty</h2>
            <p className="mt-2 text-sm text-gray-600">
              Add some products before proceeding to checkout.
            </p>
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="mt-6 rounded-xl bg-[#2e7d32] px-6 py-3 font-semibold text-white hover:bg-[#256528]"
            >
              Explore Products
            </button>
          </section>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              {/* Delivery address */}
              <section className="rounded-2xl border border-[#e5e2dc] bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#2e7d32]">
                      STEP 1
                    </p>
                    <h2 className="mt-1 text-xl font-bold">
                      Delivery Address
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={openAddAddress}
                    className="rounded-lg border border-[#2e7d32] px-4 py-2 text-sm font-semibold text-[#2e7d32] hover:bg-green-50"
                  >
                    + Add Address
                  </button>
                </div>

                {!addresses.length && !showAddressForm && (
                  <div className="mt-5 rounded-xl bg-[#f8f7f4] p-5 text-sm text-gray-600">
                    You have no saved addresses. Add one to continue.
                    <button
                      type="button"
                      onClick={openAddAddress}
                      className="ml-2 font-semibold text-[#2e7d32] underline"
                    >
                      Add an address
                    </button>
                  </div>
                )}

                <div className="mt-5 space-y-3">
                  {addresses.map((address) => {
                    const id = addressId(address);
                    const selected = selectedAddressId === id;

                    return (
                      <div
                        key={id}
                        className={`rounded-xl border p-4 transition ${
                          selected
                            ? "border-[#2e7d32] bg-green-50/50"
                            : "border-[#e5e2dc] hover:border-gray-400"
                        }`}
                      >
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="radio"
                            name="deliveryAddress"
                            checked={selected}
                            onChange={() => setSelectedAddressId(id)}
                            className="mt-1 accent-[#2e7d32]"
                          />

                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2 font-semibold">
                              {getAddressName(address)}
                              <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium capitalize text-gray-600">
                                {getAddressType(address)}
                              </span>
                              {(address.is_default || address.isDefault) && (
                                <span className="text-xs font-semibold text-[#2e7d32]">
                                  Default
                                </span>
                              )}
                            </span>

                            <span className="mt-2 block text-sm leading-6 text-gray-600">
                              {getAddressLine(address)}
                              {(address.addressLine2 ||
                                address.address_line2) &&
                                `, ${address.addressLine2 ?? address.address_line2}`}
                              {`, ${address.city}, ${address.state} - ${getPostalCode(address)}, ${address.country}`}
                            </span>

                            <span className="mt-1 block text-sm text-gray-600">
                              Phone: {address.phone}
                            </span>
                          </span>
                        </label>

                        <div className="mt-3 flex flex-wrap gap-4 pl-7">
                          <button
                            type="button"
                            onClick={() => openEditAddress(address)}
                            className="text-sm font-semibold text-[#2e7d32] hover:underline"
                          >
                            Edit address
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {showAddressForm && (
                  <form
                    onSubmit={saveAddress}
                    className="mt-6 rounded-xl border border-[#e5e2dc] bg-[#fcfbf9] p-4 sm:p-6"
                  >
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <h3 className="font-bold">
                        {editingAddressId ? "Edit Address" : "Add New Address"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="text-sm text-gray-500 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField label="Full Name" required>
                        <input
                          required
                          value={addressForm.fullName}
                          onChange={(event) =>
                            updateFormField("fullName", event.target.value)
                          }
                          className={inputClass}
                          placeholder="Enter full name"
                        />
                      </FormField>

                      <FormField label="Phone Number" required>
                        <input
                          required
                          inputMode="numeric"
                          pattern="[0-9]{10,15}"
                          maxLength={15}
                          value={addressForm.phone}
                          onChange={(event) =>
                            updateFormField(
                              "phone",
                              event.target.value.replace(/\D/g, "")
                            )
                          }
                          className={inputClass}
                          placeholder="10–15 digits"
                        />
                      </FormField>

                      <div className="sm:col-span-2">
                        <FormField label="Address Line 1" required>
                          <input
                            required
                            value={addressForm.addressLine1}
                            onChange={(event) =>
                              updateFormField("addressLine1", event.target.value)
                            }
                            className={inputClass}
                            placeholder="House number, street, area"
                          />
                        </FormField>
                      </div>

                      <div className="sm:col-span-2">
                        <FormField label="Address Line 2">
                          <input
                            value={addressForm.addressLine2}
                            onChange={(event) =>
                              updateFormField("addressLine2", event.target.value)
                            }
                            className={inputClass}
                            placeholder="Landmark or apartment (optional)"
                          />
                        </FormField>
                      </div>

                      <FormField label="City" required>
                        <input
                          required
                          value={addressForm.city}
                          onChange={(event) =>
                            updateFormField("city", event.target.value)
                          }
                          className={inputClass}
                          placeholder="City"
                        />
                      </FormField>

                      <FormField label="State" required>
                        <input
                          required
                          value={addressForm.state}
                          onChange={(event) =>
                            updateFormField("state", event.target.value)
                          }
                          className={inputClass}
                          placeholder="State"
                        />
                      </FormField>

                      <FormField label="Postal Code" required>
                        <input
                          required
                          value={addressForm.postalCode}
                          onChange={(event) =>
                            updateFormField("postalCode", event.target.value)
                          }
                          className={inputClass}
                          placeholder="Postal code"
                        />
                      </FormField>

                      <FormField label="Country" required>
                        <input
                          required
                          value={addressForm.country}
                          onChange={(event) =>
                            updateFormField("country", event.target.value)
                          }
                          className={inputClass}
                          placeholder="Country"
                        />
                      </FormField>

                      <FormField label="Address Type" required>
                        <select
                          required
                          value={addressForm.addressType}
                          onChange={(event) =>
                            updateFormField("addressType", event.target.value)
                          }
                          className={inputClass}
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </FormField>
                    </div>

                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="mt-5 w-full rounded-xl bg-[#2e7d32] px-5 py-3 font-semibold text-white hover:bg-[#256528] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {savingAddress
                        ? "Saving..."
                        : editingAddressId
                          ? "Save Changes"
                          : "Save Address"}
                    </button>
                  </form>
                )}
              </section>

              {/* Order review */}
              <section className="rounded-2xl border border-[#e5e2dc] bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-5">
                  <p className="text-sm font-semibold text-[#2e7d32]">
                    STEP 2
                  </p>
                  <h2 className="mt-1 text-xl font-bold">Review Your Order</h2>
                </div>

                <div className="divide-y divide-[#e5e2dc]">
                  {items.map((item) => (
                    <div
                      key={item.cart_item_id ?? item.id ?? item.product_id}
                      className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f8f7f4]">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-3xl">
                            📦
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatPrice(Number(item.price))} each
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-bold sm:text-base">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/cart")}
                  className="mt-5 text-sm font-semibold text-[#2e7d32] hover:underline"
                >
                  ← Edit cart
                </button>
              </section>

              {/* Coupon */}
              <section className="rounded-2xl border border-[#e5e2dc] bg-white p-5 shadow-sm sm:p-7">
                <p className="text-sm font-semibold text-[#2e7d32]">STEP 3</p>
                <h2 className="mt-1 text-xl font-bold">Apply Coupon</h2>

                <p className="mt-2 text-sm text-gray-600">
                  Get 10% off your first eligible order above ₹999 with FIRST10.
                </p>

                <form
                  className="mt-4 flex flex-col gap-3 sm:flex-row"
                  onSubmit={(event) => {
                    event.preventDefault();
                    applyCoupon();
                  }}
                >
                  <input
                    value={couponCode}
                    onChange={(event) => {
                      setCouponCode(event.target.value);

                      if (appliedCoupon) {
                        setAppliedCoupon("");
                      }

                      setError("");
                      setNotice("");
                    }}
                    placeholder="Enter FIRST10"
                    className={`${inputClass} flex-1`}
                    disabled={Boolean(appliedCoupon)}
                  />

                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon("");
                        setCouponCode("");
                        setError("");
                        setNotice("Coupon removed.");
                      }}
                      className="rounded-xl border border-red-300 px-5 py-3 font-semibold text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="rounded-xl border border-[#2e7d32] px-5 py-3 font-semibold text-[#2e7d32] hover:bg-green-50"
                    >
                      Apply
                    </button>
                  )}
                </form>

                {appliedCoupon && (
                  <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                    <p className="font-semibold">
                      ✓ {appliedCoupon} applied — 10% discount preview
                    </p>
                    <p className="mt-1">
                      You save {formatPrice(discount)} on this order if you are
                      eligible for the first-order offer.
                    </p>
                  </div>
                )}

                <p className="mt-3 text-xs leading-5 text-gray-500">
                  FIRST10 gives 10% off orders above ₹999. The server verifies
                  first-order eligibility and calculates the final discount
                  when you place the order.
                </p>
              </section>

              {/* Payment */}
              <section className="rounded-2xl border border-[#e5e2dc] bg-white p-5 shadow-sm sm:p-7">
                <p className="text-sm font-semibold text-[#2e7d32]">STEP 4</p>
                <h2 className="mt-1 text-xl font-bold">Payment Method</h2>

                <div className="mt-5 space-y-3">
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                      paymentMethod === "cod"
                        ? "border-[#2e7d32] bg-green-50/50"
                        : "border-[#e5e2dc]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="mt-1 accent-[#2e7d32]"
                    />
                    <span>
                      <span className="block font-semibold">
                        Cash on Delivery
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        Place your order now. Payment will be paid by after successful delivery
                      </span>
                    </span>
                  </label>

                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                      paymentMethod === "online"
                        ? "border-[#2e7d32] bg-green-50/50"
                        : "border-[#e5e2dc]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      className="mt-1 accent-[#2e7d32]"
                    />
                    <span>
                      <span className="block font-semibold">
                        Online Payment
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        Believe and pay for confirm your order
                      </span>
                    </span>
                  </label>
                </div>
              </section>
            </div>

            {/* Order summary */}
            <aside className="rounded-2xl border border-[#e5e2dc] bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
              <h2 className="text-xl font-bold">Order Summary</h2>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">
                    Items (
                    {items.reduce((sum, item) => sum + item.quantity, 0)})
                  </span>
                  <span className="font-semibold">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">
                    Discount
                    {appliedCoupon ? " (FIRST10)" : ""}
                  </span>
                  <span
                    className={`font-semibold ${
                      discount > 0 ? "text-[#2e7d32]" : ""
                    }`}
                  >
                    {discount > 0 ? `−${formatPrice(discount)}` : formatPrice(0)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? "To be confirmed" : formatPrice(shipping)}
                  </span>
                </div>

                <div className="border-t border-dashed border-[#e5e2dc]" />

                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-bold">Estimated Total</span>
                  <span className="text-xl font-bold">
                    {formatPrice(total)}
                  </span>
                </div>

                <p className="text-xs leading-5 text-gray-500">
                  The discount shown is a preview. The backend validates your
                  coupon and calculates the final order amount.
                </p>
              </div>

              <button
                type="button"
                onClick={placeOrder}
                disabled={
                  placingOrder ||
                  !items.length ||
                  !selectedAddressId ||
                  showAddressForm
                }
                className="mt-7 w-full rounded-xl bg-[#2e7d32] px-5 py-4 font-bold text-white transition hover:bg-[#256528] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {placingOrder ? "Placing Order..." : "Place Order"}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                By placing your order, you confirm your delivery details and
                order items.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#e5e2dc] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#2e7d32] focus:ring-2 focus:ring-green-100";

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}