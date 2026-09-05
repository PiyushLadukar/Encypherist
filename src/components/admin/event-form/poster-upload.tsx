"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadEventPoster } from "@/lib/actions/events";

export function PosterUpload({
  eventId,
  currentUrl,
  onUploaded,
}: {
  eventId: string | null;
  currentUrl: string | null;
  onUploaded: (url: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null) {
    if (!file || !eventId) return;
    setPreview(URL.createObjectURL(file));
    startTransition(async () => {
      const formData = new FormData();
      formData.append("poster", file);
      const result = await uploadEventPoster(eventId, formData);
      if (!result.ok) {
        toast.error(result.error);
        setPreview(currentUrl);
        return;
      }
      onUploaded(result.data.posterUrl);
      toast.success("Poster uploaded.");
    });
  }

  return (
    <div>
      <div className="flex aspect-video w-full max-w-sm items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/30">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Event poster" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="size-8 text-muted-foreground" />
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        disabled={!eventId || isPending}
        onClick={() => inputRef.current?.click()}
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
        {preview ? "Replace poster" : "Upload poster"}
      </Button>
      {!eventId && <p className="mt-1.5 text-xs text-muted-foreground">Save the event first to upload a poster.</p>}
      <p className="mt-1.5 text-xs text-muted-foreground">JPG, PNG or WEBP, up to 5MB.</p>
    </div>
  );
}
