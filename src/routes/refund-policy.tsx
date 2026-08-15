import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/LinksContactFooter";
import { settingsQuery, linksQuery } from "@/lib/content";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({ meta: [{ title: "Refund Policy - Prsad" }] }),
  component: Refund,
});

function paragraphs(text = "") {
  return text.split(/\n\n+/).map((p, i) => (
    <p key={i} className="mb-6 leading-relaxed">
      {p}
    </p>
  ));
}

function Refund() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: links = [] } = useQuery(linksQuery());

  const title = settings?.refund_title ?? "Refund Policy";
  const content = settings?.refund_content ?? defaultContent();
  const updated = settings?.refund_updated_at
    ? new Date(settings.refund_updated_at).toLocaleDateString()
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
  return `Refund Policy\n\n1. Advance payment\nA 50% advance payment is required before work begins and is non-refundable.\n\n2. Remaining payment\nThe remaining 50% is due upon completion and before final delivery.\n\n3. Client cancellation\nIf a client cancels before work begins, the advance may be refundable at my discretion. Once work has started, the advance is non-refundable.\n\n4. Project cancellation\nIf the project is cancelled by me, refunds will be provided for any unused pre-paid services and third-party costs where applicable.\n\n5. Client delays\nClient-caused delays may pause timelines and do not entitle refunds.\n\n6. Failure to provide materials\nIf the client fails to provide required materials, work may be paused and the advance remains non-refundable.\n\n7. Scope changes\nChanges in scope may affect costs and refunds; additional fees may apply.\n\n8. Completed work\nWork completed and delivered is non-refundable once handed over after full payment.\n\n9. Third-party costs\nThird-party costs (domains, hosting, plugins) are subject to the vendors' refund policies and may not be refundable.\n\n10. Exceptional circumstances\nExceptions to the policy may be made at my discretion and where legally permitted.\n\n11. Contact\nContact: hello@prsad.com`;
}
