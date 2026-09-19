import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";
import type { Project } from "@/lib/content";
import { SERVICE_WEBSITE_URL } from "@/lib/config";
import { OptimizedImage } from "./OptimizedImage";

export function SelectedWork({ projects }: { projects: Project[] }) {
  return (
    <section id="work" className="border-b border-border py-20 md:py-32">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="eyebrow text-3xl font-black uppercase tracking-[0.16em] text-foreground md:text-4xl lg:text-5xl">
            SELECTED WORK
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            A few things I&apos;ve built for clients, friends, myself, and sometimes just because I
            could.
          </p>
          <a
            href={SERVICE_WEBSITE_URL}
            className="eyebrow inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="View Services"
          >
            VIEW SERVICES <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {projects.length === 0 ? (
          <p className="mt-16 text-sm text-muted-foreground">No projects published yet.</p>
        ) : (
          <div className="mt-14 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {projects.map((project) => (
              <Reveal as="article" key={project.id}>
                <Link
                  to="/work/$slug"
                  params={{ slug: project.slug }}
                  className="group block rounded-sm overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
                  aria-label={`View project ${project.title}`}
                >
                  <div className="relative">
                    <div className="aspect-16/9 w-full overflow-hidden bg-subtle">
                      {project.cover_image_url ? (
                        <OptimizedImage
                          src={project.cover_image_url}
                          alt={project.title}
                          className="h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-105"
                          width={800}
                          quality={78}
                          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
                        />
                      ) : (
                        <span className="eyebrow flex h-full w-full items-center justify-center text-muted-foreground">
                          [ PROJECT IMAGE ]
                        </span>
                      )}
                    </div>
                    <div className="absolute left-3 top-3 rounded-sm bg-background/70 px-2 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-sm">
                      {project.category}
                    </div>
                  </div>

                  <div className="mt-3 px-0">
                    <h3 className="text-lg font-semibold tracking-tight uppercase transition-colors group-hover:text-foreground">
                      {project.title}
                    </h3>
                    <p className="mt-2 max-h-[4.6rem] overflow-hidden text-sm leading-relaxed text-muted-foreground">
                      {project.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{project.year}</span>
                      <span className="eyebrow inline-flex items-center gap-2 border-b border-foreground pb-1">
                        VIEW PROJECT
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
