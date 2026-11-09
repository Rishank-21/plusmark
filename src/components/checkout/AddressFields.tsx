"use client";

import Link from "next/link";
import { SelectField, TextField } from "@/components/ui/Field";
import { INDIAN_STATES, firstError, validateAddress } from "@/lib/validation";
import type { AddressBookEntry } from "@/types";

export interface AddressDraft {
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export const emptyAddressDraft: AddressDraft = {
  label: "Home",
  recipientName: "",
  phone: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: true
};

const ADDRESS_LABELS = ["Home", "Work", "School or college", "Office", "Site or warehouse"] as const;

export function draftFromEntry(entry: AddressBookEntry): AddressDraft {
  return {
    label: entry.label,
    recipientName: entry.recipientName,
    phone: entry.phone,
    line1: entry.line1,
    line2: entry.line2 ?? "",
    landmark: entry.landmark ?? "",
    city: entry.city,
    state: entry.state,
    pincode: entry.pincode,
    isDefault: entry.isDefaultShipping
  };
}

export function draftToEntry(draft: AddressDraft, id: string): AddressBookEntry {
  return {
    id,
    label: draft.label,
    recipientName: draft.recipientName.trim(),
    phone: draft.phone.trim(),
    line1: draft.line1.trim(),
    line2: draft.line2.trim() || null,
    landmark: draft.landmark.trim() || null,
    city: draft.city.trim(),
    state: draft.state,
    pincode: draft.pincode.trim(),
    isDefaultShipping: draft.isDefault,
    isDefaultBilling: draft.isDefault
  };
}

/** Field-keyed errors, so a step can show them inline and still be a11y-wired. */
export function addressDraftErrors(draft: AddressDraft): Record<string, string | null> {
  const list = validateAddress({
    recipientName: draft.recipientName,
    phone: draft.phone,
    line1: draft.line1,
    line2: draft.line2 || null,
    city: draft.city,
    state: draft.state,
    pincode: draft.pincode
  });
  return {
    recipientName: firstError(list, "recipientName"),
    phone: firstError(list, "phone"),
    line1: firstError(list, "line1"),
    city: firstError(list, "city"),
    state: firstError(list, "state"),
    pincode: firstError(list, "pincode")
  };
}

export function addressIsBlank(draft: AddressDraft): boolean {
  return !draft.recipientName && !draft.line1 && !draft.city && !draft.pincode;
}

export function AddressFields({
  idPrefix,
  value,
  errors,
  onChange,
  heading
}: {
  idPrefix: string;
  value: AddressDraft;
  errors: Record<string, string | null>;
  onChange: (patch: Partial<AddressDraft>) => void;
  heading?: string;
}) {
  return (
    <div className="flex flex-col gap-md">
      {heading && <h3 className="font-display text-h4">{heading}</h3>}

      <div className="grid gap-md sm:grid-cols-2">
        <TextField
          id={`${idPrefix}-label`}
          label="Address label"
          value={value.label}
          onChange={(event) => onChange({ label: event.target.value })}
          list={`${idPrefix}-label-options`}
          hint="Only used to recognise this address later."
        />
        <datalist id={`${idPrefix}-label-options`}>
          {ADDRESS_LABELS.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>

        <TextField
          id={`${idPrefix}-recipient`}
          label="Recipient name"
          required
          autoComplete="name"
          value={value.recipientName}
          onChange={(event) => onChange({ recipientName: event.target.value })}
          error={errors.recipientName}
        />
        <TextField
          id={`${idPrefix}-phone`}
          label="Mobile number"
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="9876543210"
          value={value.phone}
          onChange={(event) => onChange({ phone: event.target.value })}
          error={errors.phone}
          hint="Needed for the delivery partner's call on the day."
        />
      </div>

      <TextField
        id={`${idPrefix}-line1`}
        label="Address line 1"
        required
        autoComplete="address-line1"
        placeholder="Flat / house no., building, street"
        value={value.line1}
        onChange={(event) => onChange({ line1: event.target.value })}
        error={errors.line1}
      />
      <TextField
        id={`${idPrefix}-line2`}
        label="Address line 2"
        optional
        autoComplete="address-line2"
        placeholder="Area, village"
        value={value.line2}
        onChange={(event) => onChange({ line2: event.target.value })}
      />
      <TextField
        id={`${idPrefix}-landmark`}
        label="Landmark"
        optional
        autoComplete="off"
        placeholder="Nearby school, temple or junction"
        value={value.landmark}
        onChange={(event) => onChange({ landmark: event.target.value })}
      />

      <div className="grid gap-md sm:grid-cols-3">
        <TextField
          id={`${idPrefix}-city`}
          label="City / district"
          required
          autoComplete="address-level2"
          value={value.city}
          onChange={(event) => onChange({ city: event.target.value })}
          error={errors.city}
        />
        <SelectField
          id={`${idPrefix}-state`}
          label="State"
          required
          placeholder="Select a state"
          value={value.state}
          onChange={(event) => onChange({ state: event.target.value })}
          error={errors.state}
          options={INDIAN_STATES.map((state) => ({ value: state, label: state }))}
        />
        <TextField
          id={`${idPrefix}-pincode`}
          label="PIN code"
          required
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          value={value.pincode}
          onChange={(event) => onChange({ pincode: event.target.value.replace(/\D/g, "").slice(0, 6) })}
          error={errors.pincode}
        />
      </div>

      <p className="border-t border-line pt-md text-caption leading-relaxed text-muted">
        Checkout uses one address for delivery and billing. For anything about invoicing, ask{" "}
        <Link href="/contact" className="underline decoration-line-strong underline-offset-4 hover:text-ink">
          the Plusmark team
        </Link>{" "}
        before you pay.
      </p>
    </div>
  );
}
