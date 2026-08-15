import { useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "./Reveal";
import type { Photo } from "@/lib/content";
import { cn } from "@/lib/utils";

const ASPECT: Record<string, string> = {
  portrait: "aspect-4/5",
  landscape: "aspect-3/2",
  square: "aspect-square",
  wide: "aspect-16/9",
  tall: "aspect-2/3",
};

const SPAN: Record<string, string> = {
  portrait: "md:col-span-4",
  landscape: "md:col-span-5",
  square: "md:col-span-3",
  wide: "md:col-span-7",
  tall: "md:col-span-3",
};

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);

  // Ensure we always render at least 15 photos by filling with placeholders when needed
  const MIN_PHOTOS = 15;
  const displayedPhotos =
    photos.length >= MIN_PHOTOS
      ? photos
      : [
          ...photos,
          ...Array.from({ length: MIN_PHOTOS - photos.length }).map((_, i) => ({
            id: `placeholder-${i}`,
            image_url: `https://picsum.photos/seed/prsad-${i}/1200/800`,
            title: null,
            caption: null,
            location: null,
            category: "Photography",
            aspect: "landscape",
            featured: false,
            published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            display_order: photos.length + i + 1,
            taken_on: null,
          })),
        ];

  if (photos.length === 0 && displayedPhotos.length === 0) return null;

  return (
    <section id="gallery" className="border-b border-border py-20 md:py-32">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
              BUILD THINGS.
              <span className="block">SEE THE WORLD.</span>
              <span className="block">TELL STORIES.</span>
            </h2>
            <p className="max-w-sm md:max-w-md text-base md:text-lg leading-7 text-foreground mt-4">
              A curated gallery of photographs and moments collected along the way.
            </p>
          </div>
        </div>

        <div className="mt-12 space-y-6">
          {/* Row 1: 4 photos */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {displayedPhotos.slice(0, 4).map((photo, i) => {
              const idx = i;
              return (
                <Reveal key={photo.id} delay={(idx % 3) * 70} className="col-span-1">
                  <button
                    type="button"
                    onClick={() => setIndex(idx)}
                    className="group block w-full text-left"
                    aria-label={`Open photo${photo.title ? `: ${photo.title}` : ""}`}
                  >
                    <div
                      className={cn(
                        "relative overflow-hidden bg-subtle",
                        ASPECT[photo.aspect] ?? "aspect-4/5",
                      )}
                    >
                      <img
                        src={photo.image_url}
                        alt={photo.title ?? photo.caption ?? "Photograph by Prsad"}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.035]"
                      />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between gap-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 max-md:opacity-100">
                      <span className="text-xs font-semibold tracking-wide uppercase">
                        {photo.title ?? photo.category}
                      </span>
                      <span className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                        {photo.location ?? photo.category}
                      </span>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>

          {/* Row 2: 6 photos */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-5">
            {displayedPhotos.slice(4, 10).map((photo, i) => {
              const idx = 4 + i;
              return (
                <Reveal key={photo.id} delay={(idx % 3) * 70} className="col-span-1">
                  <button
                    type="button"
                    onClick={() => setIndex(idx)}
                    className="group block w-full text-left"
                    aria-label={`Open photo${photo.title ? `: ${photo.title}` : ""}`}
                  >
                    <div
                      className={cn(
                        "relative overflow-hidden bg-subtle",
                        ASPECT[photo.aspect] ?? "aspect-4/5",
                      )}
                    >
                      <img
                        src={photo.image_url}
                        alt={photo.title ?? photo.caption ?? "Photograph by Prsad"}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.035]"
                      />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between gap-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 max-md:opacity-100">
                      <span className="text-xs font-semibold tracking-wide uppercase">
                        {photo.title ?? photo.category}
                      </span>
                      <span className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                        {photo.location ?? photo.category}
                      </span>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>

          {/* Row 3: 5 photos */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-5">
            {displayedPhotos.slice(10, 15).map((photo, i) => {
              const idx = 10 + i;
              return (
                <Reveal key={photo.id} delay={(idx % 3) * 70} className="col-span-1">
                  <button
                    type="button"
                    onClick={() => setIndex(idx)}
                    className="group block w-full text-left"
                    aria-label={`Open photo${photo.title ? `: ${photo.title}` : ""}`}
                  >
                    <div
                      className={cn(
                        "relative overflow-hidden bg-subtle",
                        ASPECT[photo.aspect] ?? "aspect-4/5",
                      )}
                    >
                      <img
                        src={photo.image_url}
                        alt={photo.title ?? photo.caption ?? "Photograph by Prsad"}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.035]"
                      />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between gap-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 max-md:opacity-100">
                      <span className="text-xs font-semibold tracking-wide uppercase">
                        {photo.title ?? photo.category}
                      </span>
                      <span className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                        {photo.location ?? photo.category}
                      </span>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>

      {index !== null && (
        <PhotoLightbox
          photos={displayedPhotos}
          index={index}
          onClose={() => setIndex(null)}
          onIndexChange={setIndex}
        />
      )}
    </section>
  );
}

export function PhotoLightbox({
  photos,
  index,
  onClose,
  onIndexChange,
}: {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const touchX = useRef<number | null>(null);
  const photo = photos[index];

  const next = useCallback(
    () => onIndexChange((index + 1) % photos.length),
    [index, photos.length, onIndexChange],
  );
  const prev = useCallback(
    () => onIndexChange((index - 1 + photos.length) % photos.length),
    [index, photos.length, onIndexChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [next, prev, onClose]);

  if (!photo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.title ?? "Photograph"}
      className="fixed inset-0 z-[70] flex flex-col bg-background/98 backdrop-blur-sm"
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX ?? null;
        if (start === null || end === null) return;
        if (Math.abs(end - start) > 50) (end < start ? next : prev)();
        touchX.current = null;
      }}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3 md:px-10">
        <span className="eyebrow text-muted-foreground">
          {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-11 w-11 items-center justify-center"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-6 md:px-16">
        <img
          src={photo.image_url}
          alt={photo.title ?? photo.caption ?? "Photograph by Prsad"}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <div className="flex items-end justify-between gap-6 border-t border-border px-5 py-4 md:px-10">
        <div className="min-w-0">
          {photo.title && <p className="text-sm font-semibold uppercase">{photo.title}</p>}
          {photo.caption && (
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{photo.caption}</p>
          )}
          <p className="eyebrow mt-2 text-muted-foreground">
            {[photo.location, photo.category, photo.taken_on].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous photo"
            className="flex h-11 w-11 items-center justify-center border border-border transition-colors hover:bg-foreground hover:text-background"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next photo"
            className="flex h-11 w-11 items-center justify-center border border-border transition-colors hover:bg-foreground hover:text-background"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
