import { ArrowUpRight } from "lucide-react";
import type { Profile } from "@/lib/content";

function Available({ label, isAvailable }: { label: string; isAvailable?: boolean }) {
  return (
    <span className="eyebrow inline-flex items-center gap-2 text-muted-foreground">
      <span
        className={
          "h-1.5 w-1.5 rounded-full " + (isAvailable === false ? "bg-red-600" : "bg-accent")
        }
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

export function Hero({ profile }: { profile: Profile | null }) {
  const roles = (profile?.roles_line ?? "").split("·").map((r) => r.trim());
  const half = Math.ceil(roles.length / 2);

  return (
    <section className="border-b border-border pt-28 pb-14 md:pt-36 md:pb-20" id="top">
      {/* Use a non-wrapping flex layout so text and image remain side-by-side at all sizes.
          Image width scales smoothly between a min and max using clamp().
      */}
      <div className="mx-auto flex max-w-[1600px] gap-8 px-5 md:gap-10 md:px-10 items-center flex-nowrap">
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="eyebrow text-muted-foreground">HELLO, I&apos;M PRSAD</p>
          <h1 className="display-xl mt-6 text-[16vw] leading-[0.86] sm:text-[12vw] md:text-[8.2vw]">
            I build
            <br />
            websites
            <br />
            for fun.
          </h1>

          <p className="mt-8 max-w-md text-[11px] leading-relaxed font-medium tracking-[0.16em] text-muted-foreground uppercase">
            {roles.slice(0, half).join(" · ")}
            <br />
            {roles.slice(half).join(" · ")}
          </p>

          <p className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground">
            {profile?.hero_description}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#work"
              className="eyebrow inline-flex min-h-[48px] items-center gap-2 border border-foreground bg-foreground px-6 text-background transition-colors duration-300 hover:bg-transparent hover:text-foreground"
            >
              VIEW MY WORK <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            {profile?.personal_site_url ? (
              <a
                href={profile.personal_site_url}
                target="_blank"
                rel="noreferrer noopener"
                className="eyebrow inline-flex min-h-[48px] items-center gap-2 border border-foreground px-6 transition-colors duration-300 hover:bg-foreground hover:text-background"
              >
                MY WEBSITE <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        </div>

        <div className="flex-none w-[clamp(120px,34vw,520px)]">
          <div className="relative aspect-4/5 w-full overflow-hidden border border-border bg-subtle">
            {profile?.hero_image_url ? (
              <img
                src={profile.hero_image_url}
                alt="Photograph by Prsad"
                className="h-full w-full object-cover"
                fetchPriority="high"
                decoding="async"
              />
            ) : (
              <span className="eyebrow absolute inset-0 flex items-center justify-center text-muted-foreground">
                [ HERO IMAGE ]
              </span>
            )}
          </div>
          {profile && (
            <div className="mt-4">
              <Available
                isAvailable={profile.is_available}
                label={
                  profile.is_available === false
                    ? "NOT AVAILABLE"
                    : (profile.availability_status ?? "AVAILABLE FOR PROJECTS")
                }
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export { Available };
