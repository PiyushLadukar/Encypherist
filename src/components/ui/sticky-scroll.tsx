'use client';

import { ReactLenis } from 'lenis/react';
import React, { forwardRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface StickyScrollItem {
  id: string;
  title: string;
  image: string;
  href?: string;
  subtitle?: string;
}

export interface StickyScrollProps {
  title?: React.ReactNode;
  subtitle?: string;
  items?: StickyScrollItem[];
  footerTitle?: string;
}

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop',
];

const Component = forwardRef<HTMLElement, StickyScrollProps>(({
  title,
  subtitle,
  items,
  footerTitle = 'ENCYPHERIST'
}, ref) => {
  const photos: StickyScrollItem[] = items && items.length > 0 
    ? items 
    : DEFAULT_IMAGES.map((img, i) => ({
        id: `photo-${i}`,
        title: `Gallery Moment ${i + 1}`,
        image: img,
      }));

  // Distribute items into 3 columns for left, sticky middle, and right grid
  const col1 = photos.slice(0, 5);
  const col2 = photos.slice(5, 8);
  const col3 = photos.slice(8, 13);

  return (
    <ReactLenis root>
      <main className="bg-background text-foreground" ref={ref}>
        {title && (
          <div className="py-8 px-4 text-center">
            {subtitle && (
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary font-bold mb-2">
                {subtitle}
              </p>
            )}
            <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-foreground">
              {title}
            </h2>
          </div>
        )}

        <section className="text-foreground w-full bg-background relative z-10 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-12 gap-3 sm:gap-4">
            {/* Left Column - Scrollable */}
            <div className="grid gap-3 sm:gap-4 col-span-4">
              {col1.map((item) => (
                <figure key={item.id} className="group relative w-full overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md">
                  {item.href ? (
                    <Link href={item.href} className="block w-full h-72 sm:h-96 relative">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        unoptimized
                        className="transition-all duration-500 w-full h-full align-bottom object-cover rounded-xl group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex items-end">
                        <p className="font-heading text-sm font-semibold text-white">{item.title}</p>
                      </div>
                    </Link>
                  ) : (
                    <div className="w-full h-72 sm:h-96 relative">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        unoptimized
                        className="transition-all duration-500 w-full h-full align-bottom object-cover rounded-xl group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex items-end">
                        <p className="font-heading text-sm font-semibold text-white">{item.title}</p>
                      </div>
                    </div>
                  )}
                </figure>
              ))}
            </div>

            {/* Middle Column - Sticky viewport frame */}
            <div className="sticky top-20 h-[85vh] w-full col-span-4 gap-3 sm:gap-4 grid grid-rows-3">
              {col2.map((item) => (
                <figure key={item.id} className="group relative w-full h-full overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md">
                  {item.href ? (
                    <Link href={item.href} className="block w-full h-full relative">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        unoptimized
                        className="transition-all duration-500 h-full w-full align-bottom object-cover rounded-xl group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex items-end">
                        <p className="font-heading text-sm font-semibold text-white">{item.title}</p>
                      </div>
                    </Link>
                  ) : (
                    <div className="w-full h-full relative">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        unoptimized
                        className="transition-all duration-500 h-full w-full align-bottom object-cover rounded-xl group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex items-end">
                        <p className="font-heading text-sm font-semibold text-white">{item.title}</p>
                      </div>
                    </div>
                  )}
                </figure>
              ))}
            </div>

            {/* Right Column - Scrollable */}
            <div className="grid gap-3 sm:gap-4 col-span-4">
              {col3.map((item) => (
                <figure key={item.id} className="group relative w-full overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md">
                  {item.href ? (
                    <Link href={item.href} className="block w-full h-72 sm:h-96 relative">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        unoptimized
                        className="transition-all duration-500 w-full h-full align-bottom object-cover rounded-xl group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex items-end">
                        <p className="font-heading text-sm font-semibold text-white">{item.title}</p>
                      </div>
                    </Link>
                  ) : (
                    <div className="w-full h-72 sm:h-96 relative">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        unoptimized
                        className="transition-all duration-500 w-full h-full align-bottom object-cover rounded-xl group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex items-end">
                        <p className="font-heading text-sm font-semibold text-white">{item.title}</p>
                      </div>
                    </div>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </section>

        {footerTitle && (
          <footer className="group bg-background border-t border-border/40 overflow-hidden py-12 px-4 relative z-10">
            <h2 className="text-[7.5vw] sm:text-[8.5vw] tracking-tight leading-none uppercase font-heading font-black text-center bg-gradient-to-r from-foreground/30 via-foreground/70 to-foreground/30 bg-clip-text text-transparent select-none whitespace-nowrap">
              {footerTitle}
            </h2>
          </footer>
        )}
      </main>
    </ReactLenis>
  );
});

Component.displayName = 'Component';

export default Component;

