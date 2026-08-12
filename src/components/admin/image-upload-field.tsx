"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Bucket = "forum-assets" | "member-images" | "event-posters" | "event-gallery";

export function ImageUploadField({
  label,
  bucket,
  value,
  onChange,
}: {
  label: string;
  bucket: Bucket;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("bucket", bucket);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Upload failed — check your connection.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5 flex items-center gap-4">
        {value ? (
          <div className="relative size-20 shrink-0 overflow-hidden rounded-md border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Remove image"
              className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-background/90 text-foreground"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <div className="flex size-20 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
            <Upload className="size-5" />
          </div>
        )}

        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
            {value ? "Replace" : "Upload"}
          </Button>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground/70">JPEG, PNG or WebP, up to 5MB.</p>
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
