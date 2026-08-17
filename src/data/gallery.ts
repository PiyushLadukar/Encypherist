/**
 * Public Gallery catalog.
 *
 * Add one event object and its local images here to publish a new album. Place
 * its poster and photos in public/gallery/<event-id>/, then reference them as
 * /gallery/<event-id>/<filename>. This file is intentionally static: the
 * public Gallery does not read from the admin, APIs, or any database.
 */
export interface GalleryEvent {
  id: string;
  title: string;
  description?: string;
  poster: string;
  images: string[];
}

export const galleryEvents: GalleryEvent[] = [
  {
    id: "installation",
    title: "Installation",
    poster: "/gallery/installation/poster.jpg",
    images: Array.from({ length: 9 }, (_, index) => `/gallery/installation/photo-${index + 1}.jpg`),
  },
  {
    id: "funfinity",
    title: "Funfinity",
    poster: "/gallery/funfinity/poster.jpeg",
    images: Array.from({ length: 5 }, (_, index) => `/gallery/funfinity/photo-${index + 1}.jpg`),
  },
  {
    id: "ganesh-utsav",
    title: "Ganesh Utsav",
    poster: "/gallery/ganesh-utsav/poster.jpg",
    images: Array.from({ length: 10 }, (_, index) => `/gallery/ganesh-utsav/photo-${index + 1}.jpg`),
  },
  {
    id: "vision-x",
    title: "Vision X",
    poster: "/gallery/vision-x/poster.jpg",
    images: Array.from({ length: 5 }, (_, index) => `/gallery/vision-x/photo-${index + 1}.jpg`),
  },
  {
    id: "donation-drive",
    title: "Donation Drive",
    poster: "/gallery/donation-drive/poster.jpg",
    images: Array.from({ length: 7 }, (_, index) => `/gallery/donation-drive/photo-${index + 1}.jpg`),
  },
  {
    id: "cyber-security-talk",
    title: "Cyber Security Talk",
    poster: "/gallery/cyber-security-talk/poster.jpg",
    images: Array.from({ length: 6 }, (_, index) => `/gallery/cyber-security-talk/photo-${index + 1}.jpg`),
  },
  {
    id: "gen-ai",
    title: "Gen AI",
    poster: "/gallery/gen-ai/poster.jpg",
    images: Array.from({ length: 7 }, (_, index) => `/gallery/gen-ai/photo-${index + 1}.jpg`),
  },
  {
    id: "portfolio",
    title: "Portfolio",
    poster: "/gallery/portfolio/poster.jpg",
    images: Array.from({ length: 5 }, (_, index) => `/gallery/portfolio/photo-${index + 1}.jpg`),
  },
  {
    id: "techverse",
    title: "Techverse",
    poster: "/gallery/techverse/poster.jpg",
    images: Array.from({ length: 7 }, (_, index) => `/gallery/techverse/photo-${index + 1}.jpg`),
  },
  {
    id: "disha",
    title: "Disha",
    poster: "/gallery/disha/poster.jpg",
    images: Array.from({ length: 6 }, (_, index) => `/gallery/disha/photo-${index + 1}.jpg`),
  },
];
