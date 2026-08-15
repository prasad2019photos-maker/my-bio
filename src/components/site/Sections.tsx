import { Reveal } from "./Reveal";
import type { Profile } from "@/lib/content";

export function About({ profile }: { profile: Profile | null }) {
  const paragraphs = (profile?.about_text ?? "").split(/\n\s*\n/).filter(Boolean);

  return (
    <section id="about" className="border-b border-border py-16 md:py-24 lg:py-28">
      <div className="mx-auto grid max-w-[1600px] gap-8 px-5 md:grid-cols-12 md:gap-12 md:px-10 lg:gap-16">
        <div className="md:col-span-3">
          <Reveal>
            <h2 className="eyebrow text-muted-foreground">ABOUT ME</h2>
          </Reveal>
        </div>
        <div className="md:col-span-8 md:col-start-5">
          <Reveal>
            <p className="display-lg text-[13vw] leading-[0.9] md:text-[5vw] lg:text-[4.8vw]">
              I&apos;m {profile?.name ?? "Prsad"}.
            </p>
          </Reveal>
          <div className="mt-8 max-w-2xl space-y-6 text-base leading-[1.9] text-muted-foreground md:mt-10 md:space-y-7 md:text-lg md:leading-[1.8]">
            {paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 60}>
                <p className="max-w-xl">{p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function PersonalStatement({ profile }: { profile: Profile | null }) {
  const lines = (profile?.personal_statement ?? "").split("\n").filter(Boolean);

  return (
    <section className="border-b border-border py-24 md:py-40">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="space-y-1">
          {lines.map((line, i) => (
            <Reveal key={i} delay={i * 90}>
              <p className="display-lg text-[12vw] leading-[0.92] md:text-[7vw]">{line}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={220}>
          <p className="eyebrow mt-10 text-muted-foreground">{profile?.statement_sub}</p>
        </Reveal>
      </div>
    </section>
  );
}
