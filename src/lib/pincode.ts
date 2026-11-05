export interface PincodePlace {
  district: string;
  state: string;
  postOffice: string | null;
}

export type PincodeResult =
  | { status: "found"; place: PincodePlace }
  | { status: "not_found" }
  | { status: "unavailable" };

const TIMEOUT_MS = 6000;

/**
 * India Post lookup. A failure is never fatal: checkout keeps the city and
 * state fields editable so an offline or rate-limited lookup only costs a
 * manual entry.
 */
export async function lookupPincode(pincode: string, signal?: AbortSignal): Promise<PincodeResult> {
  if (!/^[1-9][0-9]{5}$/.test(pincode)) return { status: "not_found" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener("abort", forwardAbort);

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" }
    });
    if (!response.ok) return { status: "unavailable" };

    const payload = (await response.json()) as
      | { Status?: string; PostOffice?: { District?: string; State?: string; Name?: string }[] | null }[]
      | null;
    const entry = Array.isArray(payload) ? payload[0] : null;
    const offices = entry?.PostOffice ?? [];
    if (entry?.Status !== "Success" || offices.length === 0) return { status: "not_found" };

    const office = offices[0];
    const district = (office.District ?? "").trim();
    const state = (office.State ?? "").trim();
    if (!district || !state) return { status: "unavailable" };

    return {
      status: "found",
      place: { district, state, postOffice: office.Name?.trim() || null }
    };
  } catch {
    return { status: "unavailable" };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", forwardAbort);
  }
}
