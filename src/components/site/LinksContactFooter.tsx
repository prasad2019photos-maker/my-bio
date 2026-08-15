import {
  ArrowUpRight,
  Github,
  Instagram,
  Linkedin,
  Link as LinkIcon,
  Mail,
  Youtube,
  Camera,
  Globe,
  Twitter,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { Available } from "./Hero";
import type { Profile, SiteSettings, SocialLink } from "@/lib/content";
import { SERVICE_WEBSITE_URL } from "@/lib/config";

const ICONS: Record<string, typeof LinkIcon> = {
  instagram: Instagram,
  github: Github,
  linkedin: Linkedin,
  youtube: Youtube,
  mail: Mail,
  email: Mail,
  camera: Camera,
  globe: Globe,
  website: Globe,
  twitter: Twitter,
  link: LinkIcon,
};

export function LinksSection({ links }: { links: SocialLink[] }) {
  if (links.length === 0) return null;

  return (
    <section id="links" className="border-b border-border py-20 md:py-32">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <h2 className="eyebrow text-muted-foreground">FIND ME ELSEWHERE</h2>
        <ul className="mt-12">
          {links.map((link, i) => {
            const Icon = ICONS[link.icon?.toLowerCase() ?? "link"] ?? LinkIcon;
            return (
              <Reveal as="li" key={link.id} delay={i * 50}>
                <a
                  href={link.url}
                  target={link.url.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer noopener"
                  className="group flex min-h-[56px] items-center justify-between gap-4 border-t border-border py-5 transition-colors hover:text-muted-foreground"
                >
                  <span className="flex items-center gap-4">
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.6} />
                    <span className="text-base font-semibold tracking-tight uppercase md:text-xl">
                      {link.label}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function Contact({
  profile,
  settings,
}: {
  profile: Profile | null;
  settings: SiteSettings | null;
}) {
  const email = settings?.contact_email ?? profile?.contact_email ?? "";

  return (
    <section id="contact" className="border-b border-border py-24 md:py-40">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <Reveal>
          <h2 className="display-xl text-[14vw] leading-[0.9] md:text-[8vw]">
            Let&apos;s make
            <br />
            something.
          </h2>
        </Reveal>
        <div className="mt-12 flex flex-wrap items-end justify-between gap-8">
          <p className="text-base leading-relaxed text-muted-foreground">
            Have an idea?
            <br />
            Need a website?
            <br />
            Want to collaborate?
          </p>
          <div className="flex flex-col items-start gap-5">
            <a
              href={SERVICE_WEBSITE_URL}
              className="eyebrow inline-flex min-h-[52px] items-center gap-2 border border-foreground bg-foreground px-8 text-background transition-colors duration-300 hover:bg-transparent hover:text-foreground"
            >
              TALK TO ME <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            {profile && (
              <Available
                isAvailable={profile.is_available}
                label={
                  profile.is_available === false
                    ? "NOT AVAILABLE"
                    : settings?.availability_status ?? profile.availability_status ?? "AVAILABLE FOR PROJECTS"
                }
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer({
  links,
  settings,
}: {
  links: SocialLink[];
  settings: SiteSettings | null;
}) {
  return (
    <footer className="py-12">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8 px-5 md:flex-row md:items-end md:justify-between md:px-10">
        <div>
          <p className="text-sm font-bold tracking-[0.28em] uppercase">PRSAD</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {settings?.footer_text ?? "building things, telling stories."}
          </p>
        </div>
        <div className="flex gap-8 items-start">
          <ul className="flex flex-wrap gap-5">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target={link.url.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer noopener"
                  className="eyebrow text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div>
            <p className="text-xs font-bold tracking-[0.28em] uppercase text-muted-foreground">Legal</p>
            <ul className="mt-2 flex flex-col gap-2">
              <li>
                <a href="/privacy-policy" className="eyebrow text-muted-foreground hover:text-foreground">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms-and-conditions" className="eyebrow text-muted-foreground hover:text-foreground">Terms &amp; Conditions</a>
              </li>
              <li>
                <a href="/refund-policy" className="eyebrow text-muted-foreground hover:text-foreground">Refund Policy</a>
              </li>
            </ul>
          </div>
        </div>

        <p className="eyebrow text-muted-foreground">© {new Date().getFullYear()} PRSAD</p>
      </div>
    </footer>
  );
}
