"use client";

import { useState, useId } from "react";
import { X, Upload, Plus, Trash2, ArrowLeft, ArrowRight, Images, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newEvent: any) => void;
}

export function CreateEventModal({ isOpen, onClose, onSuccess }: CreateEventModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Step 2 State
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  // Step 3 State
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Step 4 State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Unique input IDs for accessibility
  const titleInputId = useId();
  const descriptionInputId = useId();
  const posterInputId = useId();
  const photosInputId = useId();

  if (!isOpen) return null;

  const eventId = slugify(title) || "event-id";

  const handlePosterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotosSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = [...photos, ...files];
      const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
      setPhotos(newFiles);
      setPhotoPreviews(newPreviews);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updatedFiles = photos.filter((_, i) => i !== index);
    const updatedPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(updatedFiles);
    setPhotoPreviews(updatedPreviews);
  };

  const handlePublish = async () => {
    if (!title.trim() || !posterFile || photos.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("poster", posterFile);
      photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      const res = await fetch("/api/gallery/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      onSuccess(data.event);
      onClose();
      // Reset form
      setStep(1);
      setTitle("");
      setDescription("");
      setPosterFile(null);
      setPosterPreview(null);
      setPhotos([]);
      setPhotoPreviews([]);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-primary">
              2026–27 GALLERY ARCHIVE
            </span>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Create New Event • Step {step} of 4
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Wizard Step Progress Indicator */}
        <div className="grid grid-cols-4 border-b border-border/40 bg-muted/30 text-center font-mono text-xs font-medium">
          <div
            className={`py-2 border-r border-border/40 transition-colors ${
              step >= 1 ? "bg-primary/10 text-primary" : "text-muted-foreground"
            }`}
          >
            1. Details
          </div>
          <div
            className={`py-2 border-r border-border/40 transition-colors ${
              step >= 2 ? "bg-primary/10 text-primary" : "text-muted-foreground"
            }`}
          >
            2. Card Image
          </div>
          <div
            className={`py-2 border-r border-border/40 transition-colors ${
              step >= 3 ? "bg-primary/10 text-primary" : "text-muted-foreground"
            }`}
          >
            3. Photos
          </div>
          <div
            className={`py-2 transition-colors ${
              step >= 4 ? "bg-primary/10 text-primary" : "text-muted-foreground"
            }`}
          >
            4. Review
          </div>
        </div>

        {/* Content Body */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {errorMessage && (
            <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3.5 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: EVENT DETAILS */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label
                  htmlFor={titleInputId}
                  className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium"
                >
                  Event Name <span className="text-primary">*</span>
                </label>
                <input
                  id={titleInputId}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Funfinity"
                  className="w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label
                  htmlFor={descriptionInputId}
                  className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-medium"
                >
                  Description <span className="text-muted-foreground/60">(Optional)</span>
                </label>
                <textarea
                  id={descriptionInputId}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of the event activities, participants, or dates..."
                  rows={3}
                  className="w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/50 bg-muted/30 p-4">
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Academic Year
                  </span>
                  <span className="inline-flex items-center gap-1.5 mt-1 font-mono text-xs font-semibold text-primary">
                    2026–27
                  </span>
                </div>
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Auto-generated Event ID
                  </span>
                  <span className="inline-block mt-1 font-mono text-xs text-foreground/80 truncate max-w-full">
                    {eventId}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EVENT CARD IMAGE */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
                  EVENT CARD IMAGE
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  Upload the main image that should appear on the Gallery event card (saved as{" "}
                  <code className="text-foreground">poster.jpg</code>).
                </p>
              </div>

              {posterPreview ? (
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border/80 bg-muted">
                  <img
                    src={posterPreview}
                    alt="Card poster preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label
                      htmlFor={posterInputId}
                      className="cursor-pointer rounded-lg bg-background/90 px-3.5 py-2 font-mono text-xs font-semibold text-foreground backdrop-blur-md hover:bg-background"
                    >
                      Replace Card Image
                    </label>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor={posterInputId}
                  className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
                >
                  <Upload className="size-8 text-primary" />
                  <div>
                    <span className="font-mono text-xs font-semibold text-primary">
                      + Upload Card Image
                    </span>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      PNG, JPG, JPEG or WEBP (rec. 16:9 or 4:3)
                    </p>
                  </div>
                </label>
              )}

              <input
                id={posterInputId}
                type="file"
                accept="image/*"
                onChange={handlePosterSelect}
                className="hidden"
              />
            </div>
          )}

          {/* STEP 3: EVENT PHOTO COLLECTION */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
                    EVENT PHOTOS
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Upload photographs for the event gallery collection (stored sequentially as{" "}
                    <code className="text-foreground">photo-1.jpg</code>,{" "}
                    <code className="text-foreground">photo-2.jpg</code>...).
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                  {photos.length} {photos.length === 1 ? "photograph" : "photographs"}
                </span>
              </div>

              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 max-h-60 overflow-y-auto pr-1">
                  {photoPreviews.map((src, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted"
                    >
                      <img
                        src={src}
                        alt={`Photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 font-mono text-[9px] text-white rounded">
                        Photo {String(index + 1).padStart(2, "0")}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1 right-1 rounded bg-destructive/90 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label
                htmlFor={photosInputId}
                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 p-5 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all text-center"
              >
                <Plus className="size-4 text-primary" />
                <span className="font-mono text-xs font-semibold text-primary">
                  {photos.length > 0 ? "+ Add More Photos" : "+ Add Event Photographs"}
                </span>
              </label>

              <input
                id={photosInputId}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotosSelect}
                className="hidden"
              />
            </div>
          )}

          {/* STEP 4: REVIEW & PUBLISH */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="font-mono text-xs text-muted-foreground">Academic Year</span>
                  <span className="font-mono text-xs font-semibold text-primary">2026–27</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="font-mono text-xs text-muted-foreground">Event Name</span>
                  <span className="font-heading text-sm font-bold text-foreground">{title}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="font-mono text-xs text-muted-foreground">Event ID</span>
                  <span className="font-mono text-xs text-foreground/80">{eventId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">Total Photographs</span>
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {photos.length} {photos.length === 1 ? "photograph" : "photographs"}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block font-medium">
                  Card Poster Image
                </span>
                {posterPreview && (
                  <div className="h-32 aspect-[16/10] overflow-hidden rounded-xl border border-border/60 bg-muted">
                    <img src={posterPreview} alt="Card Poster" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block font-medium">
                  Photographs Preview ({photos.length})
                </span>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {photoPreviews.slice(0, 8).map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Thumb ${i + 1}`}
                      className="size-14 rounded-lg object-cover border border-border/60 shrink-0"
                    />
                  ))}
                  {photoPreviews.length > 8 && (
                    <div className="size-14 rounded-lg bg-muted border border-border/60 flex items-center justify-center font-mono text-xs text-muted-foreground shrink-0">
                      +{photoPreviews.length - 8}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between border-t border-border/60 px-6 py-4 bg-card">
          {step > 1 ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setStep((s) => (s - 1) as any)}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              {step === 4 ? "← Edit" : "← Back"}
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              disabled={
                (step === 1 && !title.trim()) ||
                (step === 2 && !posterFile) ||
                (step === 3 && photos.length === 0)
              }
              onClick={() => setStep((s) => (s + 1) as any)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 font-mono text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePublish}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-mono text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Publishing Event...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Add Event
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
