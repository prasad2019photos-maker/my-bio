import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/LinksContactFooter";
import { projectBySlugQuery, settingsQuery, linksQuery, profileQuery } from "@/lib/content";

export const Route = createFileRoute("/work/$slug")({
  head: ({ params }) => {
    const title = `Project — Prsad`;
    const description = `A project by Prsad. ${params.slug.replace(/-/g, " ")}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery(projectBySlugQuery(slug));
  const { data: settings } = useQuery(settingsQuery);
  const { data: profile } = useQuery(profileQuery);
  const { data: links = [] } = useQuery(linksQuery());

  const email = settings?.contact_email ?? profile?.contact_email ?? "hello@prsad.com";
  const project = data?.project;
  const images = data?.images ?? [];

  return (
    <div className="min-h-screen">
      <Navbar email={email} homeHref="/home" />
      <main className="mx-auto max-w-[1600px] px-5 pt-28 pb-20 md:px-10 md:pt-36">
        <Link
          to="/"
          hash="work"
          className="eyebrow inline-flex min-h-[44px] items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> BACK TO WORK
        </Link>

        {isLoading ? (
          <p className="mt-16 text-sm text-muted-foreground">Loading…</p>
        ) : !project ? (
          <p className="mt-16 text-sm text-muted-foreground">This project could not be found.</p>
        ) : (
          <article className="mt-10">
            <h1 className="display-lg text-[12vw] leading-[0.92] md:text-[6vw]">{project.title}</h1>

            <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-border py-6 md:grid-cols-4">
              {[
                ["CLIENT", project.client],
                ["YEAR", project.year],
                ["CATEGORY", project.category],
                ["ROLE", "Design & Development"],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <dt className="eyebrow text-muted-foreground">{label}</dt>
                  <dd className="mt-2 text-sm font-medium">{value || "—"}</dd>
                </div>
              ))}
            </dl>

            {project.cover_image_url && (
              <div className="mt-10 aspect-16/9 w-full overflow-hidden bg-subtle">
                <img
                  src={project.cover_image_url}
                  alt={project.title}
                  className="h-full w-full object-cover"
                  decoding="async"
                />
              </div>
            )}

            {project.description && (
              <p className="mt-10 max-w-2xl text-base leading-[1.85] text-muted-foreground md:text-lg">
                {project.description}
              </p>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="eyebrow inline-flex min-h-[48px] items-center gap-2 border border-foreground bg-foreground px-6 text-background transition-colors duration-300 hover:bg-transparent hover:text-foreground"
                >
                  LIVE WEBSITE <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="eyebrow inline-flex min-h-[48px] items-center gap-2 border border-foreground px-6 transition-colors duration-300 hover:bg-foreground hover:text-background"
                >
                  <Github className="h-3.5 w-3.5" /> GITHUB
                </a>
              )}
            </div>

            {images.length > 0 && (
              <div className="mt-16 space-y-6">
                {images.map((image) => (
                  <figure key={image.id}>
                    <img
                      src={image.image_url}
                      alt={image.caption ?? project.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full bg-subtle object-cover"
                    />
                    {image.caption && (
                      <figcaption className="eyebrow mt-3 text-muted-foreground">
                        {image.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}
          </article>
        )}
      </main>
      <Footer links={links} settings={settings ?? null} />
    </div>
  );
}
