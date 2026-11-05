"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextArea, TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/States";
import { required, validateEmail, validateName, validatePhone, type FieldError } from "@/lib/validation";

const TOPICS = [
  { value: "general", label: "General question about the range" },
  { value: "custom", label: "Custom size, layout or schedule board" },
  { value: "order", label: "An order, dispatch or delivery" },
  { value: "returns", label: "Returns, damage on arrival or refund" }
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  topic: string;
  message: string;
}

const EMPTY: FormState = { name: "", email: "", phone: "", organisation: "", topic: TOPICS[0].value, message: "" };

/**
 * Message form for the support page. There is no backend in this prototype: the
 * submitted text is held in component state, echoed back once and never claimed
 * to have been sent anywhere.
 */
export function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [submitted, setSubmitted] = useState<{ summary: string } | null>(null);

  const errorFor = (field: keyof FormState) => errors.find((e) => e.field === field)?.message ?? null;

  const update = (field: keyof FormState) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => current.filter((e) => e.field !== field));
  };

  function validate(): FieldError[] {
    const next: FieldError[] = [];
    const push = (field: string, message: string | null) => {
      if (message) next.push({ field, message });
    };
    push("name", validateName(form.name, "Your name"));
    push("email", validateEmail(form.email));
    push("phone", validatePhone(form.phone, { optional: true }));
    push("message", required(form.message, "Your message"));
    return next;
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (found.length > 0) {
      setSubmitted(null);
      return;
    }
    const topic = TOPICS.find((t) => t.value === form.topic)?.label ?? "General";
    setSubmitted({
      summary: `${topic} — from ${form.name}${form.organisation ? ` (${form.organisation})` : ""}`
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <Notice tone="neutral" title="Prototype behaviour — nothing leaves this page">
        <p>
          This form has no server behind it: your message stays in this browser tab and is never sent, emailed or
          stored. To reach the desk today, call or WhatsApp using the numbers above.
        </p>
      </Notice>

      {submitted ? (
        <div role="status" className="flex flex-col gap-4 rounded-sm border border-success/30 bg-success-wash p-5">
          <p className="font-sans text-h4 leading-snug text-ink">Recorded in this tab — not sent</p>
          <p className="text-body-sm leading-relaxed text-graphite">
            {submitted.summary}. Because this is a prototype, there is no ticket number and no reply will arrive. Call or
            WhatsApp the desk on the numbers above and describe the same details.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="h-11 w-full sm:w-auto lg:h-9"
              onClick={() => {
                setSubmitted(null);
                setForm(EMPTY);
              }}
            >
              Write another message
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Your name"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => update("name")(e.target.value)}
              error={errorFor("name")}
            />
            <TextField
              label="Email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={(e) => update("email")(e.target.value)}
              error={errorFor("email")}
            />
            <TextField
              label="Phone"
              type="tel"
              optional
              autoComplete="tel"
              inputMode="tel"
              placeholder="10-digit mobile"
              hint="Helps if we need to call you back."
              value={form.phone}
              onChange={(e) => update("phone")(e.target.value)}
              error={errorFor("phone")}
            />
            <TextField
              label="Organisation (optional)"
              optional
              autoComplete="organization"
              value={form.organisation}
              onChange={(e) => update("organisation")(e.target.value)}
            />
          </div>

          <SelectField
            label="What is this about?"
            options={TOPICS}
            value={form.topic}
            onChange={(e) => update("topic")(e.target.value)}
          />

          <TextArea
            label="Message"
            required
            rows={6}
            placeholder="Product, size and quantity if you know them. For a custom board, add a sketch or the layout you need."
            hint="For schedule boards, Plusmark asks for quantity, sizes and a sketch — CorelDRAW, Photoshop or Word are all accepted."
            value={form.message}
            onChange={(e) => update("message")(e.target.value)}
            error={errorFor("message")}
          />

          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" className="h-12 w-full sm:w-auto lg:h-11">Record my message</Button>
            <p className="text-caption text-graphite">No account needed. Fields marked * are required.</p>
          </div>

          {errors.length > 0 && (
            <div role="alert" className="rounded-sm border border-danger/30 bg-danger-wash px-4 py-3">
              <p className="text-body-sm font-medium text-danger">
                {errors.length} {errors.length === 1 ? "field needs" : "fields need"} attention
              </p>
              <ul className="mt-1 list-disc pl-5 text-caption text-graphite">
                {errors.map((error) => (
                  <li key={error.field}>{error.message}</li>
                ))}
              </ul>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
