import { Skeleton } from "@/components/ui/skeleton";

export default function GalleryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-10 w-full max-w-xl" />
      <div className="mt-12 columns-2 gap-4 sm:columns-3 lg:columns-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton
            key={i}
            className="mb-4 aspect-square w-full rounded-lg"
            style={{ aspectRatio: i % 3 === 0 ? "1/1.3" : "1/1" }}
          />
        ))}
      </div>
    </div>
  );
}
