import type { AddressBookEntry, CustomerAccount } from "@/types";

export interface FieldError {
  field: string;
  message: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const MOBILE = /^(\+91[\s-]?)?[6-9]\d{9}$/;
const PINCODE = /^\d{6}$/;

export function required(value: string | null | undefined, label: string): string | null {
  if (!value || !value.trim()) return `${label} is required`;
  return null;
}

export function validateEmail(value: string): string | null {
  if (!value.trim()) return "Email is required";
  if (!EMAIL.test(value.trim())) return "Enter a valid email address, like name@company.com";
  return null;
}

export function validatePhone(value: string, { optional = false } = {}): string | null {
  const clean = value.replace(/[\s-]/g, "");
  if (!clean) return optional ? null : "Phone number is required";
  if (!MOBILE.test(clean)) return "Enter a 10-digit Indian mobile number";
  return null;
}

export function validatePincode(value: string): string | null {
  if (!value.trim()) return "PIN code is required";
  if (!PINCODE.test(value.trim())) return "Enter a 6-digit PIN code";
  return null;
}

export function validateName(value: string, label = "Full name"): string | null {
  if (!value.trim()) return `${label} is required`;
  if (value.trim().length < 2) return `${label} looks too short`;
  return null;
}

/** Stores Indian mobiles as ten digits, dropping +91 and separators. */
export function normaliseMobile(value: string): string {
  return value.replace(/\D/g, "").slice(-10);
}

export type PasswordStrength = { score: 0 | 1 | 2 | 3; label: "Weak" | "Fair" | "Strong"; hint: string };

export function passwordStrength(value: string): PasswordStrength {
  const hasLength = value.length >= 8;
  const hasLetter = /[a-z]/i.test(value);
  const hasNumber = /\d/.test(value);
  const hasSymbol = /[^a-z0-9]/i.test(value);
  const classes = [hasLetter, hasNumber, hasSymbol].filter(Boolean).length;
  if (!hasLength) return { score: 0, label: "Weak", hint: "Use at least 8 characters." };
  if (classes >= 3 && value.length >= 10) return { score: 3, label: "Strong", hint: "Strong password." };
  if (classes >= 2) return { score: 2, label: "Fair", hint: "Add a symbol or make it longer for a stronger password." };
  return { score: 1, label: "Weak", hint: "Mix letters with a number or symbol." };
}

export function validateAccountPassword(value: string): string | null {
  if (!value) return "Password is required";
  if (value.length < 8) return "Use at least 8 characters";
  if (!/[a-z]/i.test(value) || !/[\d\W]/.test(value)) return "Include at least one letter and one number or symbol";
  return null;
}

/** Only same-origin relative paths are allowed as post-auth destinations. */
export function safeNextPath(value: string | null | undefined, fallback = "/account"): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}

export function validateQuantity(value: number, { max = 999 } = {}): string | null {
  if (!Number.isFinite(value) || value < 1) return "Quantity must be at least 1";
  if (!Number.isInteger(value)) return "Quantity must be a whole number";
  if (value > max) return `Quantity cannot exceed ${max}`;
  return null;
}

export function validateAddress(address: Partial<AddressBookEntry>): FieldError[] {
  const errors: FieldError[] = [];
  const push = (field: string, message: string | null) => {
    if (message) errors.push({ field, message });
  };
  push("recipientName", validateName(address.recipientName ?? "", "Recipient name"));
  push("phone", validatePhone(address.phone ?? ""));
  push("line1", required(address.line1, "Address line 1"));
  push("city", required(address.city, "City / district"));
  push("state", required(address.state, "State"));
  push("pincode", validatePincode(address.pincode ?? ""));
  return errors;
}

export function validatePassword(value: string, { confirm }: { confirm?: string } = {}): string | null {
  if (!value) return "Password is required";
  if (value.length < 8) return "Use at least 8 characters";
  if (confirm !== undefined && value !== confirm) return "Passwords do not match";
  return null;
}

export function firstError(errors: FieldError[], field: string): string | null {
  return errors.find((e) => e.field === field)?.message ?? null;
}

export function toAddressBookEntry(input: {
  id: string;
  label?: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}): AddressBookEntry {
  return {
    id: input.id,
    label: input.label ?? "Home",
    recipientName: input.recipientName,
    phone: input.phone,
    line1: input.line1,
    line2: input.line2 ?? null,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    isDefaultShipping: true,
    isDefaultBilling: true
  };
}

export function emptyAccount(email: string, fullName: string): CustomerAccount {
  return {
    id: "pending",
    email,
    fullName,
    phone: null,
    role: "customer",
    addresses: [],
    createdAt: new Date().toISOString()
  };
}

export const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal"
];
