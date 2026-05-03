"use client";

import { useState, useRef, type ChangeEvent, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";

// ── Types ────────────────────────────────────────────────────────────────────

interface EventFormData {
  title: string;
  description: string;
  overview: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
}

type FieldErrors = Partial<Record<keyof EventFormData | "image", string>>;

// ── Constants ────────────────────────────────────────────────────────────────

const INITIAL_FORM_DATA: EventFormData = {
  title: "",
  description: "",
  overview: "",
  venue: "",
  location: "",
  date: "",
  time: "",
  mode: "",
  audience: "",
  agenda: [""],
  organizer: "",
  tags: [""],
};

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const STEPS = ["Basic Info", "Logistics", "Details"] as const;

const STEP_FIELDS: Array<Array<keyof EventFormData | "image">> = [
  ["title", "organizer", "description", "overview", "image"],
  ["date", "time", "mode", "audience", "venue", "location"],
  ["agenda", "tags"],
];

// ── Validation ───────────────────────────────────────────────────────────────

function validateAllFields(formData: EventFormData, imageFile: File | null): FieldErrors {
  const errors: FieldErrors = {};

  const requireString = (key: keyof EventFormData, label: string) => {
    const val = formData[key];
    if (typeof val === "string" && !val.trim()) errors[key] = `${label} is required.`;
  };

  requireString("title", "Title");
  requireString("organizer", "Organizer");
  requireString("description", "Description");
  requireString("overview", "Overview");
  requireString("venue", "Venue");
  requireString("location", "Location");
  requireString("date", "Date");
  requireString("time", "Time");
  requireString("mode", "Mode");
  requireString("audience", "Audience");

  if (!imageFile) errors.image = "Cover image is required.";
  if (formData.agenda.length === 0 || formData.agenda.some((a) => !a.trim()))
    errors.agenda = "All agenda items must be filled.";
  if (formData.tags.length === 0 || formData.tags.some((t) => !t.trim()))
    errors.tags = "All tags must be filled.";

  return errors;
}

function errorsForStep(allErrors: FieldErrors, stepIndex: number): FieldErrors {
  const keys = STEP_FIELDS[stepIndex];
  return Object.fromEntries(
    Object.entries(allErrors).filter(([k]) =>
      keys.includes(k as keyof EventFormData | "image"),
    ),
  ) as FieldErrors;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function EventForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<EventFormData>(INITIAL_FORM_DATA);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Reset ──────────────────────────────────────────────────────────────────

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
    setApiError(null);
    setStep(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Field helpers ──────────────────────────────────────────────────────────

  const handleChange = (key: keyof EventFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
  };

  const handleListChange = (key: "agenda" | "tags", index: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev[key]];
      updated[index] = value;
      return { ...prev, [key]: updated };
    });
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
  };

  const addItem = (key: "agenda" | "tags") =>
    setFormData((prev) => ({ ...prev, [key]: [...prev[key], ""] }));

  const removeItem = (key: "agenda" | "tags", index: number) =>
    setFormData((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));

  // ── Image ──────────────────────────────────────────────────────────────────

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: "Invalid type. Allowed: JPEG, PNG, GIF, WEBP" }));
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => { const next = { ...prev }; delete next.image; return next; });
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Navigation ─────────────────────────────────────────────────────────────

  const goNext = () => {
    const allErrors = validateAllFields(formData, imageFile);
    const stepErrors = errorsForStep(allErrors, step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      return;
    }
    setStep((s) => s + 1);
  };

  const goBack = () => setStep((s) => s - 1);

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setApiError(null);

    const allErrors = validateAllFields(formData, imageFile);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      for (let i = 0; i < STEP_FIELDS.length; i++) {
        if (STEP_FIELDS[i].some((k) => k in allErrors)) { setStep(i); break; }
      }
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();

      (["title", "description", "overview", "venue", "location", "date", "time", "mode", "audience", "organizer"] as const)
        .forEach((key) => fd.append(key, (formData[key] as string).trim()));

      fd.append("agenda", JSON.stringify(formData.agenda.map((a) => a.trim())));
      fd.append("tags", JSON.stringify(formData.tags.map((t) => t.trim())));
      fd.append("image", imageFile!);

      const res = await fetch(`${BASE_URL}/api/events`, { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setApiError(data.message ?? "Something went wrong. Please try again.");
        return;
      }

      // ✅ Reset all fields on success before redirecting
      resetForm();

      const slug: string | undefined = data.event?.slug;
      router.push(slug ? `/events/${slug}` : "/events");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1>Create Event</h1>
        <p className="text-light-100 text-lg max-sm:text-sm">
          Fill in the details to publish your event.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex flex-row items-center gap-0">
        {STEPS.map((label, i) => (
          <div key={i} className="flex flex-row items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={`flex flex-row items-center gap-2 ${i < step ? "cursor-pointer" : "cursor-default"}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                i === step ? "bg-primary text-black" : i < step ? "bg-primary/30 text-primary" : "bg-dark-200 text-light-200"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium max-sm:hidden ${
                i === step ? "text-primary" : i < step ? "text-primary/60" : "text-light-200"
              }`}>
                {label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 transition-colors ${i < step ? "bg-primary/40" : "bg-dark-200"}`} />
            )}
          </div>
        ))}
      </div>

      {apiError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-[6px] px-4 py-3 text-red-400 text-sm">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-dark-100 border border-dark-200 card-shadow rounded-[10px] px-6 py-8 flex flex-col gap-6">

          {/* Step 0 — Basic Info */}
          {step === 0 && (
            <>
              <FormField label="Event Title" error={errors.title} required>
                <input
                  className="bg-dark-200 rounded-[6px] px-5 py-2.5 text-foreground placeholder:text-light-200/50 outline-none focus:ring-1 focus:ring-primary/50 w-full"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="e.g. Global AI Summit 2026"
                />
              </FormField>

              <FormField label="Organizer" error={errors.organizer} required>
                <input
                  className="bg-dark-200 rounded-[6px] px-5 py-2.5 text-foreground placeholder:text-light-200/50 outline-none focus:ring-1 focus:ring-primary/50 w-full"
                  value={formData.organizer}
                  onChange={(e) => handleChange("organizer", e.target.value)}
                  placeholder="e.g. Anthropic Labs"
                />
              </FormField>

              <FormField label="Short Description" error={errors.description} required>
                <textarea
                  className="bg-dark-200 rounded-[6px] px-5 py-2.5 text-foreground placeholder:text-light-200/50 outline-none focus:ring-1 focus:ring-primary/50 w-full resize-none"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="A brief description shown in listings..."
                />
              </FormField>

              <FormField label="Full Overview" error={errors.overview} required>
                <textarea
                  className="bg-dark-200 rounded-[6px] px-5 py-2.5 text-foreground placeholder:text-light-200/50 outline-none focus:ring-1 focus:ring-primary/50 w-full resize-none"
                  rows={5}
                  value={formData.overview}
                  onChange={(e) => handleChange("overview", e.target.value)}
                  placeholder="Detailed overview of the event..."
                />
              </FormField>

              <FormField label="Cover Image" error={errors.image} required hint="JPEG, PNG, GIF or WEBP">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {imagePreview ? (
                  <div className="relative rounded-[6px] overflow-hidden border border-dark-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded cursor-pointer transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-36 bg-dark-200 border border-dashed border-dark-200 hover:border-primary/40 rounded-[6px] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
                  >
                    <span className="text-2xl text-light-200 group-hover:text-primary transition-colors">↑</span>
                    <span className="text-light-200 text-sm group-hover:text-primary transition-colors">Click to upload image</span>
                    <span className="text-light-200/50 text-xs">JPEG, PNG, GIF, WEBP</span>
                  </button>
                )}
              </FormField>
            </>
          )}

          {/* Step 1 — Logistics */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                <FormField label="Date" error={errors.date} required>
                  <input
                    className="bg-dark-200 rounded-[6px] px-5 py-2.5 text-foreground outline-none focus:ring-1 focus:ring-primary/50 w-full"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                  />
                </FormField>
                <FormField label="Time" error={errors.time} required>
                  <input
                    className="bg-dark-200 rounded-[6px] px-5 py-2.5 text-foreground outline-none focus:ring-1 focus:ring-primary/50 w-full"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleChange("time", e.target.value)}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                {/* Mode — plain text input, not a select */}
                <FormField label="Mode" error={errors.mode} required hint="e.g. In-Person, Online, Hybrid">
                  <input
                    className="bg-dark-200 rounded-[6px] px-5 py-2.5 text-foreground placeholder:text-light-200/50 outline-none focus:ring-1 focus:ring-primary/50 w-full"
                    value={formData.mode}
                    onChange={(e) => handleChange("mode", e.target.value)}
                    placeholder="e.g. In-Person"
                  />
                </FormField>

                {/* Audience — plain text input, not a select */}
                <FormField label="Audience" error={errors.audience} required hint="e.g. Public, Students">
                  <input
                    className="bg-dark-200 rounded-[6px] px-5 py-2.5 text-foreground placeholder:text-light-200/50 outline-none focus:ring-1 focus:ring-primary/50 w-full"
                    value={formData.audience}
                    onChange={(e) => handleChange("audience", e.target.value)}
                    placeholder="e.g. Public"
                  />
                </FormField>
              </div>

              <FormField label="Venue" error={errors.venue} required>
                <input
                  className="bg-dark-200 rounded-[6px] px-5 py-2.5 text-foreground placeholder:text-light-200/50 outline-none focus:ring-1 focus:ring-primary/50 w-full"
                  value={formData.venue}
                  onChange={(e) => handleChange("venue", e.target.value)}
                  placeholder="e.g. Convention Center Hall A"
                />
              </FormField>

              <FormField label="Location" error={errors.location} required>
                <input
                  className="bg-dark-200 rounded-[6px] px-5 py-2.5 text-foreground placeholder:text-light-200/50 outline-none focus:ring-1 focus:ring-primary/50 w-full"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                />
              </FormField>
            </>
          )}

          {/* Step 2 — Details */}
          {step === 2 && (
            <>
              <FormField label="Agenda" error={errors.agenda} required hint="One item per session or talk">
                <div className="flex flex-col gap-2">
                  {formData.agenda.map((item, i) => (
                    <div key={i} className="flex flex-row items-center gap-2">
                      <span className="text-light-200 text-xs w-5 text-right shrink-0">{i + 1}.</span>
                      <input
                        className="bg-dark-200 rounded-[6px] px-4 py-2 text-foreground placeholder:text-light-200/50 outline-none focus:ring-1 focus:ring-primary/50 flex-1 text-sm"
                        value={item}
                        onChange={(e) => handleListChange("agenda", i, e.target.value)}
                        placeholder={`Agenda item ${i + 1}`}
                      />
                      {formData.agenda.length > 1 && (
                        <button type="button" onClick={() => removeItem("agenda", i)} className="text-light-200 hover:text-red-400 text-xs px-2 py-1 rounded transition-colors cursor-pointer">
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addItem("agenda")} className="text-primary/70 hover:text-primary text-xs text-left py-1 transition-colors cursor-pointer">
                    + Add agenda item
                  </button>
                </div>
              </FormField>

              <FormField label="Tags" error={errors.tags} required hint="Keywords to categorize your event">
                <div className="flex flex-col gap-2">
                  {formData.tags.map((tag, i) => (
                    <div key={i} className="flex flex-row items-center gap-2">
                      <span className="text-primary text-sm shrink-0">#</span>
                      <input
                        className="bg-dark-200 rounded-[6px] px-4 py-2 text-foreground placeholder:text-light-200/50 outline-none focus:ring-1 focus:ring-primary/50 flex-1 text-sm"
                        value={tag}
                        onChange={(e) => handleListChange("tags", i, e.target.value)}
                        placeholder={`tag-${i + 1}`}
                      />
                      {formData.tags.length > 1 && (
                        <button type="button" onClick={() => removeItem("tags", i)} className="text-light-200 hover:text-red-400 text-xs px-2 py-1 rounded transition-colors cursor-pointer">
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addItem("tags")} className="text-primary/70 hover:text-primary text-xs text-left py-1 transition-colors cursor-pointer">
                    + Add tag
                  </button>
                </div>
              </FormField>
            </>
          )}

          {/* Navigation */}
          <div className={`flex flex-row gap-3 pt-4 border-t border-dark-200 ${step > 0 ? "justify-between" : "justify-end"}`}>
            {step > 0 && (
              <button type="button" onClick={goBack} className="border border-dark-200 text-light-200 hover:text-foreground hover:border-gray-600 rounded-[6px] px-6 py-2.5 text-sm font-medium transition-colors cursor-pointer">
                ← Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={goNext} className="bg-primary hover:bg-primary/90 text-black rounded-[6px] px-6 py-2.5 text-sm font-semibold cursor-pointer transition-colors">
                Next →
              </button>
            ) : (
              <button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-black rounded-[6px] px-8 py-2.5 text-sm font-semibold cursor-pointer transition-colors flex items-center gap-2">
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin inline-block" />
                    Publishing...
                  </>
                ) : (
                  "Publish Event"
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

// ── FormField ─────────────────────────────────────────────────────────────────

function FormField({ label, error, required, hint, children }: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-light-200 uppercase tracking-widest flex items-center gap-2">
        {label}
        {required && <span className="text-primary normal-case tracking-normal">*</span>}
        {hint && <span className="text-light-200/50 normal-case tracking-normal font-light">— {hint}</span>}
      </label>
      {children}
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  );
}