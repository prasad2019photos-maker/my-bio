import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/LinksContactFooter";
import { settingsQuery, linksQuery } from "@/lib/content";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({ meta: [{ title: "Privacy Policy - Prsad" }] }),
  component: PrivacyPolicy,
});

function paragraphs(text = "") {
  return text.split(/\n\n+/).map((p, i) => (
    <p key={i} className="mb-6 leading-relaxed">
      {p}
    </p>
  ));
}

function PrivacyPolicy() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: links = [] } = useQuery(linksQuery());

  const title = settings?.privacy_policy_title ?? "Privacy Policy";
  const content = settings?.privacy_policy_content ?? defaultContent();
  const updated = settings?.privacy_policy_updated_at
    ? new Date(settings.privacy_policy_updated_at).toLocaleDateString()
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
  return `Privacy Policy\n\nLast updated: [DATE]\n\n1. Information we collect\nWe collect information that you provide directly to us, including contact details, project descriptions, files, and payment information when you hire us for services.\n\n2. How we use information\nWe use information to provide, maintain, and improve our services, to communicate with you, to process payments, and to comply with legal obligations.\n\n3. Contact form information\nIf you use the contact form we collect the name, email, message and any files you attach. This allows us to respond to inquiries and estimate projects.\n\n4. Client and project information\nWhen you become a client we store project briefs, designs, and correspondence needed to deliver the project.\n\n5. Payment information\nWe do not store full payment card information on our servers. Payments are processed by third-party payment providers and subject to their terms and privacy practices.\n\n6. Cookies and local storage\nWe may use cookies and localStorage for site preferences and to remember theme choices. You can clear cookies or change browser settings to limit tracking.\n\n7. Third-party services\nWe use third-party services (for example: Supabase for data storage, email client for communications, and payment providers) to operate parts of the site. Please review their privacy policies for details.\n\n8. Data security\nWe take reasonable measures to protect data, including access controls and secure hosting. However no transmission over the internet is completely secure.\n\n9. Data retention\nWe retain personal data only as long as necessary to provide services and fulfill legal obligations.\n\n10. Sharing of information\nWe do not sell personal information. We may share information with service providers who perform tasks on our behalf (hosting, payments, email).\n\n11. User privacy rights\nYou may request access, correction, or deletion of your personal information by contacting us. We respond to legitimate requests in accordance with applicable law.\n\n12. Children’s privacy\nOur services are not directed to children under 13. We do not knowingly collect personal information from children under 13.\n\n13. Changes to this policy\nWe may update this policy. Material changes will be posted here with an updated date.\n\n14. Contact information\nIf you have questions about this policy, contact: hello@prsad.com`;
}
