"use client";

import { useState, type FormEvent } from "react";
import { Arrow } from "./ui";

const SERVICES = [
  "Mobile app",
  "Web platform",
  "AI",
  "Cloud",
  "Custom software",
  "Digital marketing",
  "Animation",
  "Dedicated developers",
];

const EMAIL = "info@hashoneglobal.com";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

const field =
  "peer w-full border-0 border-b-2 border-on-field/35 bg-transparent px-0 pb-3 pt-6 text-lg text-on-field placeholder-transparent transition-colors focus:border-on-field focus:outline-none focus-visible:outline-none aria-[invalid=true]:border-[#8a1616]";
const label =
  "pointer-events-none absolute left-0 top-6 origin-left text-lg text-on-field-soft transition-all duration-300 ease-[var(--ease-out)] peer-focus:top-0 peer-focus:text-xs peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.1em] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.1em]";

export default function ContactForm() {
  const [picked, setPicked] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "opening" | "opened">("idle");

  const toggle = (s: string) =>
    setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const next: Errors = {};
    if (!name) next.name = "Tell us who we're talking to.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "That email doesn't look complete. Check for a missing @ or domain.";
    if (message.length < 10) next.message = "Give us a sentence or two about the idea so we can reply properly.";
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }

    setStatus("opening");
    const subject = `Project inquiry — ${company || name}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      company ? `Company: ${company}` : null,
      picked.length ? `Interested in: ${picked.join(", ")}` : null,
      "",
      message,
    ]
      .filter((l) => l !== null)
      .join("\n");
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setTimeout(() => setStatus("opened"), 900);
  }

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-7" aria-describedby="form-note">
      <div className="grid gap-7 sm:grid-cols-2">
        <Field id="name" label="Your name" error={errors.name} autoComplete="name" />
        <Field id="email" label="Work email" type="email" error={errors.email} autoComplete="email" />
      </div>
      <Field id="company" label="Company (optional)" autoComplete="organization" />

      <fieldset>
        <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-on-field-soft">
          What are we building?
        </legend>
        <div className="flex flex-wrap gap-2">
          {SERVICES.map((s) => {
            const on = picked.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(s)}
                className={`rounded-full border-2 px-3.5 py-2 text-sm font-semibold transition-colors duration-200 ${
                  on
                    ? "border-on-field bg-on-field text-field"
                    : "border-on-field/35 text-on-field hover:border-on-field"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Field id="message" label="The idea, in a few lines" error={errors.message} multiline />

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === "opening"}
          className="group inline-flex items-center gap-3 bg-on-field px-7 py-4 text-sm rounded-full font-bold text-field transition-[background-color,opacity] hover:bg-on-field/85 disabled:cursor-progress disabled:opacity-70"
        >
          {status === "opening" ? "Opening your email…" : "Send the idea"}
          <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
        <p id="form-note" className="max-w-xs text-sm text-on-field-soft">
          Sends through your own email app to {EMAIL}.
        </p>
      </div>

      <p role="status" aria-live="polite" className="text-sm font-semibold text-on-field">
        {status === "opened" &&
          `Your email app should be open with everything filled in. Nothing opened? Write to ${EMAIL} directly.`}
      </p>
    </form>
  );
}

function Field({
  id,
  label: text,
  type = "text",
  error,
  autoComplete,
  multiline,
}: {
  id: string;
  label: string;
  type?: string;
  error?: string;
  autoComplete?: string;
  multiline?: boolean;
}) {
  const common = {
    id: `f-${id}`,
    name: id,
    placeholder: text,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `e-${id}` : undefined,
    className: field,
  };
  return (
    <div className="relative">
      {multiline ? (
        <textarea {...common} rows={4} className={`${field} resize-none`} />
      ) : (
        <input {...common} type={type} autoComplete={autoComplete} />
      )}
      <label htmlFor={`f-${id}`} className={label}>
        {text}
      </label>
      {error && (
        <p id={`e-${id}`} className="mt-2 text-sm font-semibold text-[#8a1616]">
          {error}
        </p>
      )}
    </div>
  );
}
