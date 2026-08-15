import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/LinksContactFooter";
import { settingsQuery, linksQuery } from "@/lib/content";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({ meta: [{ title: "Terms & Conditions - Prsad" }] }),
  component: Terms,
});

function paragraphs(text = "") {
  return text.split(/\n\n+/).map((p, i) => (
    <p key={i} className="mb-6 leading-relaxed">
      {p}
    </p>
  ));
}

function Terms() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: links = [] } = useQuery(linksQuery());

  const title = settings?.terms_title ?? "Terms & Conditions";
  const content = settings?.terms_content ?? defaultContent();
  const updated = settings?.terms_updated_at
    ? new Date(settings.terms_updated_at).toLocaleDateString()
    : undefined;

  return (
    <div className="min-h-screen">
      <Navbar email={settings?.contact_email ?? "hello@prsad.com"} />
      <main className="mx-auto max-w-[900px] px-5 py-24 md:py-32">
        <button
          onClick={() => window.history.back()}
          className="mb-6 text-sm text-muted-foreground"
        >
          ← Back
        </button>
        <h1 className="display-xl mb-4">{title}</h1>
        {updated && (
          <div className="eyebrow text-muted-foreground mb-8">Last updated: {updated}</div>
        )}
        <article className="prose max-w-none text-base text-muted-foreground">
          {paragraphs(content)}
        </article>
      </main>
      <Footer links={links} settings={settings ?? null} />
    </div>
  );
}

function defaultContent() {
  return `Terms & Conditions\n\n1. Services provided\nI provide freelance website development and creative services tailored to each client's needs.\n\n2. Project confirmation\nA project begins after a written agreement and receipt of the advance payment.\n\n3. Payment terms\nA 50% advance payment is required before work begins (non-refundable). The remaining 50% is due on completion and before final delivery.\n\n4. Client responsibilities\nClients must provide content, access, approvals, and materials in a timely manner.\n\n5. Project timelines\nTimelines are estimates and may change based on scope and client responsiveness.\n\n6. Revisions\nThe agreement includes a specified number of revision rounds. Additional revisions may incur extra fees.\n\n7. Changes to project scope\nScope changes may require cost and timeline adjustments and will be documented as change orders.\n\n8. Final delivery\nFinal delivery occurs after full payment and when client has approved deliverables.\n\n9. Intellectual property\nUpon full payment, client receives rights to deliverables unless otherwise agreed. I retain the right to showcase the work in my portfolio.\n\n10. Third-party services\nThird-party services (hosting, plugins, domains) are subject to their own terms. Clients are responsible for costs and refunds related to third parties.\n\n11. Portfolio rights\nI may display completed projects in my portfolio unless a separate NDA or agreement restricts this.\n\n12. Website usage\nClients must not use the delivered website for unlawful activities.\n\n13. Limitation of liability\nTo the extent permitted by law, liability for damages is limited to fees paid for the project.\n\n14. Changes to Terms\nTerms may be updated; material changes will be posted on the site.\n\n15. Contact\nContact: hello@prsad.com`;
}
