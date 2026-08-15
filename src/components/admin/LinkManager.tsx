import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { linksQuery, type SocialLink } from "@/lib/content";
import { AdminButton, Field, Panel, SelectInput, TextInput, Toggle } from "./ui";

const ICON_OPTIONS = [
  "instagram",
  "github",
  "linkedin",
  "youtube",
  "twitter",
  "whatsapp",
  "mail",
  "camera",
  "globe",
  "link",
] as const;

type Draft = Partial<SocialLink> & { platform: string; label: string; url: string };

const empty: Draft = { platform: "", label: "", url: "", icon: "link", enabled: true };

export function LinkManager() {
  const queryClient = useQueryClient();
  const { data: links = [] } = useQuery(linksQuery(true));
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["social_links"] });

  const save = async () => {
    if (!draft?.platform || !draft.url) {
      toast.error("Platform and URL are required.");
      return;
    }
    const payload = {
      platform: draft.platform,
      label: draft.label || draft.platform,
      url: draft.url,
      icon: draft.icon ?? "link",
      enabled: draft.enabled ?? true,
      display_order: draft.display_order ?? links.length + 1,
    };
    const { error } = editingId
      ? await supabase.from("social_links").update(payload).eq("id", editingId)
      : await supabase.from("social_links").insert(payload);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? "Link updated" : "Link added");
    setDraft(null);
    setEditingId(null);
    refresh();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const current = links[index];
    const target = links[index + direction];
    if (!current || !target) return;
    await Promise.all([
      supabase
        .from("social_links")
        .update({ display_order: index + direction + 1 })
        .eq("id", current.id),
      supabase
        .from("social_links")
        .update({ display_order: index + 1 })
        .eq("id", target.id),
    ]);
    refresh();
  };

  return (
    <Panel title={`Links (${links.length})`}>
      {draft ? (
        <div className="space-y-5 border border-border p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="PLATFORM">
              <TextInput
                value={draft.platform}
                onChange={(e) => setDraft({ ...draft, platform: e.target.value })}
              />
            </Field>
            <Field label="LABEL">
              <TextInput
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="URL">
              <TextInput
                value={draft.url}
                onChange={(e) => setDraft({ ...draft, url: e.target.value })}
              />
            </Field>
            <Field label="ICON">
              <SelectInput
                options={ICON_OPTIONS}
                value={draft.icon}
                onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
              />
            </Field>
          </div>
          <Toggle
            label={draft.enabled ? "ENABLED" : "DISABLED"}
            checked={!!draft.enabled}
            onChange={(v) => setDraft({ ...draft, enabled: v })}
          />
          <div className="flex gap-2">
            <AdminButton onClick={save}>{editingId ? "SAVE LINK" : "ADD LINK"}</AdminButton>
            <AdminButton
              variant="ghost"
              onClick={() => {
                setDraft(null);
                setEditingId(null);
              }}
            >
              CANCEL
            </AdminButton>
          </div>
        </div>
      ) : (
        <AdminButton onClick={() => setDraft({ ...empty })}>+ ADD LINK</AdminButton>
      )}

      <ul className="divide-y divide-border border-t border-border">
        {links.map((link, i) => (
          <li key={link.id} className="flex flex-wrap items-center gap-4 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold uppercase">{link.label}</p>
              <p className="truncate text-xs text-muted-foreground">{link.url}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Toggle
                label={link.enabled ? "ENABLED" : "DISABLED"}
                checked={link.enabled}
                onChange={async (v) => {
                  await supabase.from("social_links").update({ enabled: v }).eq("id", link.id);
                  refresh();
                }}
              />
              <AdminButton
                variant="outline"
                aria-label="Move up"
                onClick={() => move(i, -1)}
                disabled={i === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </AdminButton>
              <AdminButton
                variant="outline"
                aria-label="Move down"
                onClick={() => move(i, 1)}
                disabled={i === links.length - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </AdminButton>
              <AdminButton
                variant="outline"
                onClick={() => {
                  setEditingId(link.id);
                  setDraft({ ...link });
                }}
              >
                EDIT
              </AdminButton>
              <AdminButton
                variant="outline"
                aria-label="Delete"
                onClick={async () => {
                  if (!confirm("Delete this link?")) return;
                  await supabase.from("social_links").delete().eq("id", link.id);
                  refresh();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </AdminButton>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
