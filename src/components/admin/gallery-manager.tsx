"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Images, Plus, Trash2 } from "lucide-react";
import { LocalImage } from "@/components/site/local-image";
import { CreateEventModal } from "@/components/gallery/create-event-modal";
import { DEFAULT_ACADEMIC_YEARS } from "@/data/gallery";

export interface GalleryAlbumSummary {
  id: string;
  title: string;
  description?: string;
  poster: string;
  photoCount: number;
  academicYear?: string;
  /** Hard-coded in src/data/gallery.ts, so it cannot be deleted from here. */
  isBuiltIn: boolean;
}

/**
 * The admin Gallery screen: every album, plus creating and deleting them.
 *
 * The create dialog is the same component the public Gallery page used to
 * render. It lives behind the admin login now — the upload endpoint it posts
 * to had no authorization, so anyone who found it could write files to the
 * server.
 */
export function GalleryManager({ albums }: { albums: GalleryAlbumSummary[] }) {
  const router = useRouter();
  const [createYear, setCreateYear] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(album: GalleryAlbumSummary) {
    const confirmed = window.confirm(
      `Delete "${album.title}" and all ${album.photoCount} of its photographs?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(album.id);
    try {
      const response = await fetch(`/api/gallery/${album.id}`, { method: "DELETE" });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(payload.error ?? "Could not delete this album.");
        return;
      }

      toast.success(`Deleted "${album.title}".`);
      router.refresh();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {DEFAULT_ACADEMIC_YEARS.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => setCreateYear(year)}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Plus className="size-4" />
            New album · {year}
          </button>
        ))}
      </div>

      {albums.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-6 py-14 text-center">
          <Images className="mx-auto size-6 text-muted-foreground/60" />
          <p className="mt-3 text-sm text-muted-foreground">
            No albums yet. Create one to start the Gallery.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {albums.map((album) => (
            <li
              key={album.id}
              className="flex flex-col overflow-hidden rounded-lg border border-border bg-card"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/10">
                <LocalImage
                  src={album.poster}
                  alt={`${album.title} poster`}
                  fill
                  sizes="(min-width: 1280px) 360px, (min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="truncate font-heading text-base font-semibold text-foreground">
                      {album.title}
                    </h2>
                    {album.isBuiltIn && (
                      <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Built-in
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    {album.photoCount} {album.photoCount === 1 ? "photo" : "photos"}
                    {album.academicYear ? ` · ${album.academicYear}` : ""}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2">
                  <a
                    href={`/gallery/${album.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                  >
                    View
                  </a>

                  {album.isBuiltIn ? (
                    <span
                      title="Defined in src/data/gallery.ts — remove it there."
                      className="inline-flex cursor-default items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground/50"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDelete(album)}
                      disabled={deletingId === album.id}
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                    >
                      <Trash2 className="size-3.5" />
                      {deletingId === album.id ? "Deleting…" : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CreateEventModal
        isOpen={Boolean(createYear)}
        academicYear={createYear ?? undefined}
        onClose={() => setCreateYear(null)}
        onSuccess={() => {
          setCreateYear(null);
          router.refresh();
        }}
      />
    </>
  );
}
