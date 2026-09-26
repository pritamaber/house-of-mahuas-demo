"use client";

import { Banknote, CreditCard, Info, LoaderCircle, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { placeOrderAction } from "@/lib/actions/shop";
import { INDIAN_STATES } from "@/lib/config";
import { cn, formatINR } from "@/lib/format";
import type { PaymentMethod } from "@/lib/types";
import { validateCheckout, type CheckoutFields, type FieldErrors } from "@/lib/validation";
import { useCart } from "./cart-provider";
import { OrderTotals } from "./order-totals";
import { ProductImage } from "./product-image";

const EMPTY: CheckoutFields = { customerName: "", phone: "", email: "", address: "", city: "", state: "", pincode: "" };

function Field({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckoutForm() {
  const router = useRouter();
  const { lines, subtotal, ready, clear, sync } = useCart();
  const [values, setValues] = useState<CheckoutFields>(EMPTY);
  const [payment, setPayment] = useState<PaymentMethod>("COD");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const synced = useRef(false);

  useEffect(() => {
    if (ready && !synced.current) {
      synced.current = true;
      void sync();
    }
  }, [ready, sync]);

  const set = (key: keyof CheckoutFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const invalid = (key: keyof CheckoutFields) => (errors[key] ? { "aria-invalid": true, "aria-describedby": `${key}-error` } : {});

  const focusFirstError = (errs: FieldErrors) => {
    const first = (Object.keys(errs) as (keyof FieldErrors)[])[0];
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);

    const errs = validateCheckout(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      focusFirstError(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await placeOrderAction({
        ...values,
        paymentMethod: payment,
        items: lines.map((l) => ({ productId: l.productId, slug: l.slug, quantity: l.quantity })),
      });
      if (res.ok) {
        setDone(true);
        router.push(`/order/${res.orderId}`);
        clear();
        return;
      }
      setFormError(res.error);
      if (res.fieldErrors) {
        setErrors(res.fieldErrors);
        focusFirstError(res.fieldErrors);
      } else {
        void sync(); // stock or price probably changed — refresh the cart lines
      }
    } catch {
      setFormError("Something went wrong while placing your order. Please check your connection and try again.");
    }
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md py-24 text-center" role="status">
        <LoaderCircle className="mx-auto animate-spin text-maroon" size={34} />
        <p className="mt-6 font-display text-[30px]">Placing your order…</p>
      </div>
    );
  }

  if (!ready) return <div className="min-h-[40vh]" aria-busy="true" />;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h2 className="text-[36px] leading-none">Your cart is empty</h2>
        <p className="mt-4 text-[15px] text-muted">Add a saree to your cart before checking out.</p>
        <Link href="/sarees" className="btn btn-primary mt-8">
          Explore sarees
        </Link>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="space-y-12 lg:col-span-7">
        <section aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="text-[30px] leading-none">
            Delivery details
          </h2>
          <p className="mt-2 text-[14px] text-muted">No account needed — just tell us where to send your saree.</p>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <Field id="customerName" label="Full name" error={errors.customerName} className="sm:col-span-2">
              <input id="customerName" name="customerName" className="field" autoComplete="name" value={values.customerName} onChange={set("customerName")} {...invalid("customerName")} />
            </Field>
            <Field id="phone" label="Mobile number" error={errors.phone}>
              <div className="flex">
                <span className="grid h-12 place-items-center border border-r-0 border-line bg-cream px-3.5 text-[14.5px] text-muted">+91</span>
                <input id="phone" name="phone" className="field" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={13} placeholder="98765 43210" value={values.phone} onChange={set("phone")} {...invalid("phone")} />
              </div>
            </Field>
            <Field id="email" label="Email" error={errors.email}>
              <input id="email" name="email" className="field" type="email" autoComplete="email" placeholder="you@example.com" value={values.email} onChange={set("email")} {...invalid("email")} />
            </Field>
            <Field id="address" label="Address" error={errors.address} className="sm:col-span-2">
              <textarea id="address" name="address" rows={3} className="field" autoComplete="street-address" placeholder="House / flat no., building, street, area" value={values.address} onChange={set("address")} {...invalid("address")} />
            </Field>
            <Field id="city" label="City" error={errors.city}>
              <input id="city" name="city" className="field" autoComplete="address-level2" value={values.city} onChange={set("city")} {...invalid("city")} />
            </Field>
            <Field id="state" label="State" error={errors.state}>
              <select id="state" name="state" className="field" autoComplete="address-level1" value={values.state} onChange={set("state")} {...invalid("state")}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="pincode" label="PIN code" error={errors.pincode}>
              <input id="pincode" name="pincode" className="field" inputMode="numeric" autoComplete="postal-code" maxLength={6} placeholder="700019" value={values.pincode} onChange={set("pincode")} {...invalid("pincode")} />
            </Field>
          </div>
        </section>

        <section aria-labelledby="payment-heading">
          <h2 id="payment-heading" className="text-[30px] leading-none">
            Payment
          </h2>
          <div className="mt-7 grid gap-3" role="radiogroup" aria-label="Payment method">
            {(
              [
                { value: "COD", icon: Banknote, title: "Cash on Delivery", text: "Pay in cash when your saree arrives at your door." },
                { value: "Online", icon: CreditCard, title: "Online Payment", text: "UPI, cards and net banking." },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer items-start gap-4 border bg-white p-5 transition-colors",
                  payment === opt.value ? "border-maroon ring-1 ring-maroon" : "border-line hover:border-[#d3c3a8]",
                )}
              >
                <input type="radio" name="payment" className="check mt-1" checked={payment === opt.value} onChange={() => setPayment(opt.value)} />
                <opt.icon size={22} strokeWidth={1.5} className="mt-0.5 shrink-0 text-maroon" />
                <span>
                  <span className="block text-[15.5px] font-medium">{opt.title}</span>
                  <span className="mt-0.5 block text-[13.5px] text-muted">{opt.text}</span>
                </span>
              </label>
            ))}
          </div>
          {payment === "Online" && (
            <div className="mt-3 flex items-start gap-3 border border-gold/40 bg-gold-soft/60 p-4 text-[14px] text-ink/85" role="note">
              <Info size={18} className="mt-0.5 shrink-0 text-gold" />
              <p>Razorpay payment integration will be connected here. For this demo your order is placed with payment marked as pending.</p>
            </div>
          )}
        </section>
      </div>

      <aside className="lg:col-span-5" aria-label="Order summary">
        <div className="border border-line bg-white p-6 lg:sticky lg:top-28 lg:p-8">
          <h2 className="mb-6 text-[28px] leading-none">Order Summary</h2>
          <ul className="mb-6 divide-y divide-line border-y border-line">
            {lines.map((l) => (
              <li key={l.productId} className="flex gap-4 py-4">
                <div className="relative w-16 shrink-0">
                  <ProductImage src={l.image} alt={l.name} slug={l.slug} color={l.color} fabric={l.fabric} name={l.name} sizes="64px" className="aspect-[4/5]" />
                  <span className="absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10.5px] text-ivory">{l.quantity}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-display text-[18px] leading-snug">{l.name}</p>
                  <p className="mt-0.5 text-[12.5px] text-muted">{l.fabric}</p>
                </div>
                <p className="shrink-0 text-[14.5px]">{formatINR(l.price * l.quantity)}</p>
              </li>
            ))}
          </ul>
          <OrderTotals subtotal={subtotal} />

          {formError && (
            <div className="mt-5 border border-danger/30 bg-danger/5 p-3.5 text-[14px] text-danger" role="alert">
              {formError}
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn btn-primary btn-block mt-6 h-[3.4rem]">
            {submitting ? (
              <>
                <LoaderCircle size={17} className="animate-spin" /> Placing order…
              </>
            ) : (
              <>
                <Lock size={15} className="-mt-px" /> Place Order
              </>
            )}
          </button>
          <p className="mt-4 text-center text-[12px] leading-relaxed text-muted">
            By placing your order you agree to our{" "}
            <Link href="/shipping" className="underline underline-offset-2 hover:text-maroon">
              shipping
            </Link>{" "}
            and{" "}
            <Link href="/returns" className="underline underline-offset-2 hover:text-maroon">
              returns
            </Link>{" "}
            policies.
          </p>
          <Link href="/cart" className="mt-3 block text-center text-[12px] tracking-[0.16em] text-muted uppercase underline underline-offset-4 hover:text-maroon">
            Back to cart
          </Link>
        </div>
      </aside>
    </form>
  );
}
