import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery, settingsQuery, type Profile, type SiteSettings } from "@/lib/content";
import { AdminButton, Field, ImageInput, Panel, TextArea, TextInput, Toggle } from "./ui";

export function ProfileEditor() {
  const queryClient = useQueryClient();
  const { data } = useQuery(profileQuery);
  const [form, setForm] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (!form) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setForm({ ...form, [key]: value });

  const save = async () => {
    setSaving(true);
    const { id, created_at, updated_at, ...rest } = form;
    void created_at;
    void updated_at;
    const { error } = await supabase.from("profiles").update(rest).eq("id", id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile saved");
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  };

  return (
    <Panel title="Profile">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="NAME">
          <TextInput value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="TAGLINE">
          <TextInput value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
        </Field>
      </div>
      <Field label="ROLES (separate with ·)">
        <TextInput value={form.roles_line} onChange={(e) => set("roles_line", e.target.value)} />
      </Field>
      <Field label="HERO DESCRIPTION">
        <TextArea
          value={form.hero_description}
          onChange={(e) => set("hero_description", e.target.value)}
        />
      </Field>
      <Field label="ABOUT TEXT (blank line = new paragraph)">
        <TextArea
          rows={12}
          value={form.about_text}
          onChange={(e) => set("about_text", e.target.value)}
        />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="PERSONAL STATEMENT (one line each)">
          <TextArea
            rows={3}
            value={form.personal_statement}
            onChange={(e) => set("personal_statement", e.target.value)}
          />
        </Field>
        <Field label="STATEMENT SUBLINE">
          <TextInput
            value={form.statement_sub}
            onChange={(e) => set("statement_sub", e.target.value)}
          />
        </Field>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="CONTACT EMAIL">
          <TextInput
            type="email"
            value={form.contact_email}
            onChange={(e) => set("contact_email", e.target.value)}
          />
        </Field>
        <Field label="PERSONAL WEBSITE URL">
          <TextInput
            value={form.personal_site_url ?? ""}
            onChange={(e) => set("personal_site_url", e.target.value || null)}
          />
        </Field>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="AVAILABILITY LABEL">
          <TextInput
            value={form.availability_status}
            onChange={(e) => set("availability_status", e.target.value)}
          />
        </Field>
        <div className="flex items-end">
          <Toggle
            label={form.is_available ? "AVAILABLE" : "NOT AVAILABLE"}
            checked={form.is_available}
            onChange={(v) => set("is_available", v)}
          />
        </div>
      </div>
      <ImageInput
        bucket="profile-images"
        label="HERO IMAGE"
        value={form.hero_image_url}
        onChange={(url) => set("hero_image_url", url)}
      />
      <ImageInput
        bucket="profile-images"
        label="PROFILE IMAGE"
        value={form.profile_image_url}
        onChange={(url) => set("profile_image_url", url)}
      />
      <AdminButton onClick={save} disabled={saving}>
        {saving ? "SAVING…" : "SAVE PROFILE"}
      </AdminButton>
    </Panel>
  );
}

export function SiteSettingsEditor() {
  const queryClient = useQueryClient();
  const { data } = useQuery(settingsQuery);
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (!form) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setForm({ ...form, [key]: value });

  const save = async () => {
    setSaving(true);
    const { id, created_at, updated_at, ...rest } = form;
    void created_at;
    void updated_at;
    const { error } = await supabase.from("site_settings").update(rest).eq("id", id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Settings saved");
    queryClient.invalidateQueries({ queryKey: ["site_settings"] });
  };

  return (
    <Panel title="Site settings">
      <Field label="SITE TITLE">
        <TextInput value={form.site_title} onChange={(e) => set("site_title", e.target.value)} />
      </Field>
      <Field label="META DESCRIPTION">
        <TextArea
          value={form.meta_description}
          onChange={(e) => set("meta_description", e.target.value)}
        />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="CONTACT EMAIL">
          <TextInput
            type="email"
            value={form.contact_email}
            onChange={(e) => set("contact_email", e.target.value)}
          />
        </Field>
        <Field label="ACCENT COLOR">
          <TextInput
            value={form.accent_color}
            onChange={(e) => set("accent_color", e.target.value)}
          />
        </Field>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="AVAILABILITY STATUS">
          <TextInput
            value={form.availability_status}
            onChange={(e) => set("availability_status", e.target.value)}
          />
        </Field>
        <Field label="FOOTER TEXT">
          <TextInput
            value={form.footer_text}
            onChange={(e) => set("footer_text", e.target.value)}
          />
        </Field>
      </div>

      <AdminButton onClick={save} disabled={saving}>
        {saving ? "SAVING…" : "SAVE SETTINGS"}
      </AdminButton>
    </Panel>
  );
}
