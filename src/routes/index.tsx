import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/Sections";
import { FindMeElsewhere } from "@/components/site/FindMeElsewhere";
import { PhotoGallery } from "@/components/site/PhotoGallery";
import { SelectedWork } from "@/components/site/SelectedWork";
import { Contact, Footer } from "@/components/site/LinksContactFooter";
import { photosQuery, profileQuery, projectsQuery, settingsQuery, linksQuery } from "@/lib/content";

const TITLE = "Prsad — I build websites for fun.";
const DESCRIPTION =
  "Prsad is a front-end developer, traveller, photographer, aspiring filmmaker and storyteller who builds websites and digital experiences.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: profile } = useQuery(profileQuery);
  const { data: settings } = useQuery(settingsQuery);
  const { data: photos = [] } = useQuery(photosQuery());
  const { data: projects = [] } = useQuery(projectsQuery());
  const { data: links = [] } = useQuery(linksQuery());

  const email = settings?.contact_email ?? profile?.contact_email ?? "hello@prsad.com";

  return (
    <div className="min-h-screen">
      <Navbar email={email} />
      <main>
        <Hero profile={profile ?? null} />
        <FindMeElsewhere links={links} />
        <About profile={profile ?? null} />
        <PhotoGallery photos={photos} />
        <SelectedWork projects={projects} />
        <Contact profile={profile ?? null} settings={settings ?? null} />
      </main>
      <Footer links={links} settings={settings ?? null} />
    </div>
  );
}
