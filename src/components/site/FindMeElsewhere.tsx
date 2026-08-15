import type { SocialLink } from "@/lib/content";
import { Twitter, Youtube, Instagram, Mail as MailIcon, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Simple WhatsApp SVG component (monochrome, uses currentColor)
function WhatsappIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.52 3.48A11.82 11.82 0 0 0 12 .5C6.21.5 1.5 5.21 1.5 11c0 1.95.51 3.86 1.48 5.56L.5 23.5l7.15-2.01A11.83 11.83 0 0 0 12 22.5c5.79 0 10.5-4.71 10.5-10.5 0-2.82-1.09-5.45-3.98-8.52zM12 20a9 9 0 0 1-4.53-1.17l-.33-.2-4.27 1.2 1.18-4.22-.21-.35A9.01 9.01 0 1 1 21 11 8.99 8.99 0 0 1 12 20zm4.22-6.12c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12s-.62.78-.76.94c-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.01-.37.11-.49.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.33-.02-.45-.07-.12-.54-1.3-.74-1.78-.2-.48-.4-.41-.55-.41h-.48c-.16 0-.42.06-.64.27-.22.21-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.68 2.56 4.07 3.49 2.39.92 2.39.61 2.82.57.43-.04 1.43-.58 1.63-1.14.2-.55.2-1.02.14-1.14-.06-.12-.24-.18-.48-.3z" />
    </svg>
  );
}

const ICON_MAP: Record<string, any> = {
  // github and linkedin removed per request
  twitter: Twitter,
  youtube: Youtube,
  instagram: Instagram,
  whatsapp: WhatsappIcon,
  mail: MailIcon,
};

export function FindMeElsewhere({ links }: { links: SocialLink[] }) {
  if (!links || links.length === 0) return null;

  const getPlatformKey = (link: SocialLink) => {
    // if the admin set an explicit icon, prefer that
    if (link.icon) {
      const ic = String(link.icon).toLowerCase();
      if (ic === "github" || ic === "linkedin") return "";
      if (Object.keys(ICON_MAP).includes(ic)) return ic;
    }

    // prioritize explicit platform field
    if (link.platform) {
      const p = String(link.platform).toLowerCase();
      if (p === "github" || p === "linkedin") return ""; // remove these
      if (Object.keys(ICON_MAP).includes(p)) return p;
      return "";
    }

    const label = link.label ?? "";
    const l = label.toLowerCase();
    // explicitly exclude github and linkedin
    if (l.includes("github") || l.includes("linkedin")) return "";
    if (l.includes("twitter")) return "twitter";
    if (l.includes("whatsapp") || l.includes("wa.me") || l.includes("whatsapp:")) return "whatsapp";
    if (l.includes("mailto:") || l.includes("@")) return "mail";
    if (l.includes("youtube")) return "youtube";
    if (l.includes("instagram")) return "instagram";
    // also check URL for mailto/wa
    const url = String(link.url ?? "").toLowerCase();
    if (url.includes("mailto:") || url.includes("@")) return "mail";
    if (url.includes("wa.me") || url.includes("whatsapp:")) return "whatsapp";
    return "";
  };

  return (
    <section className="py-10 md:py-16">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <h2 className="eyebrow text-muted-foreground">FIND ME ELSEWHERE</h2>
        <p className="mt-2 text-sm text-muted-foreground">Connect on other platforms.</p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          {links.map((link) => {
            const platform = getPlatformKey(link);
            if (!platform) return null; // skip github or unknown
            // if platform is whatsapp but link.platform originally was linkedin, keep URL as-is
            const Icon = ICON_MAP[platform] ?? LinkIcon;
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-center gap-3 text-sm"
                aria-label={`Visit ${link.label}`}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors",
                    "group-hover:bg-foreground group-hover:text-background",
                  )}
                >
                  {/* Use monochrome SVG icon (currentColor) */}
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground group-hover:text-foreground">
                  {link.label}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
