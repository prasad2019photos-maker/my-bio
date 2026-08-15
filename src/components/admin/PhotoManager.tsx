import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PHOTO_ASPECTS, PHOTO_CATEGORIES, photosQuery, type Photo } from "@/lib/content";
import {
  AdminButton,
  Field,
  ImageInput,
  Panel,
  SelectInput,
  TextArea,
  TextInput,
  Toggle,
} from "./ui";

type Draft = Partial<Photo> & { image_url: string };

const empty: Draft = {
  image_url: "",
  title: "",
  caption: "",
  location: "",
  category: "Photography",
  aspect: "portrait",
  featured: false,
  published: true,
};

export function PhotoManager() {
  const queryClient = useQueryClient();
  const { data: photos = [] } = useQuery(photosQuery(true));
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  // Track which photo is showing an inline image upload control
  const [editingImageId, setEditingImageId] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["photos"] });

  const save = async () => {
    if (!draft?.image_url) {
      toast.error("An image is required.");
      return;
    }
    const payload = {
      image_url: draft.image_url,
      title: draft.title || null,
      caption: draft.caption || null,
      location: draft.location || null,
      taken_on: draft.taken_on || null,
      category: draft.category ?? "Photography",
      aspect: draft.aspect ?? "portrait",
      featured: draft.featured ?? false,
      published: draft.published ?? true,
      display_order: draft.display_order ?? photos.length + 1,
    };
    const { error } = editingId
      ? await supabase.from("photos").update(payload).eq("id", editingId)
      : await supabase.from("photos").insert(payload);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? "Photo updated" : "Photo added");
    setDraft(null);
    setEditingId(null);
    refresh();
  };

  const patch = async (id: string, values: Partial<Photo>) => {
    const { error } = await supabase.from("photos").update(values).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this photo?")) return;
    const { error } = await supabase.from("photos").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Photo deleted");
    refresh();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = photos[index + direction];
    const current = photos[index];
    if (!target || !current) return;
    await Promise.all([
      supabase
        .from("photos")
        .update({ display_order: index + direction + 1 })
        .eq("id", current.id),
      supabase
        .from("photos")
        .update({ display_order: index + 1 })
        .eq("id", target.id),
    ]);
    refresh();
  };

  return (
    <Panel title={`Photos (${photos.length})`}>
      {photos.length < 15 && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Minimum 15 photos are recommended for the public gallery. Currently {photos.length} photo
          {photos.length === 1 ? "" : "s"}. Please add more photos to meet the minimum.
        </div>
      )}

      {draft ? (
        <div className="space-y-5 border border-border p-5">
          <ImageInput
            bucket="photos"
            value={draft.image_url || null}
            onChange={(url) => setDraft({ ...draft, image_url: url ?? "" })}
          />
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="TITLE">
              <TextInput
                value={draft.title ?? ""}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </Field>
            <Field label="LOCATION">
              <TextInput
                value={draft.location ?? ""}
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              />
            </Field>
          </div>
          <Field label="CAPTION">
            <TextArea
              rows={2}
              value={draft.caption ?? ""}
              onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
            />
          </Field>
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="DATE">
              <TextInput
                type="date"
                value={draft.taken_on ?? ""}
                onChange={(e) => setDraft({ ...draft, taken_on: e.target.value })}
              />
            </Field>
            <Field label="CATEGORY">
              <SelectInput
                options={PHOTO_CATEGORIES}
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              />
            </Field>
            <Field label="SHAPE IN GALLERY">
              <SelectInput
                options={PHOTO_ASPECTS}
                value={draft.aspect}
                onChange={(e) => setDraft({ ...draft, aspect: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex flex-wrap gap-2">
            <Toggle
              label="FEATURED"
              checked={!!draft.featured}
              onChange={(v) => setDraft({ ...draft, featured: v })}
            />
            <Toggle
              label={draft.published ? "PUBLISHED" : "UNPUBLISHED"}
              checked={!!draft.published}
              onChange={(v) => setDraft({ ...draft, published: v })}
            />
          </div>
          <div className="flex gap-2">
            <AdminButton onClick={save}>{editingId ? "SAVE PHOTO" : "ADD PHOTO"}</AdminButton>
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
        <AdminButton onClick={() => setDraft({ ...empty })}>+ ADD PHOTO</AdminButton>
      )}

      <ul className="divide-y divide-border border-t border-border">
        {photos.map((photo, i) => (
          <li key={photo.id} className="flex flex-wrap items-center gap-4 py-4">
            <img
              src={photo.image_url}
              alt=""
              className="h-16 w-16 shrink-0 border border-border object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold uppercase">
                {photo.title || "Untitled"}
              </p>
              <p className="eyebrow text-muted-foreground">
                {[photo.category, photo.location, photo.published ? "PUBLISHED" : "DRAFT"]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Toggle
                label="FEATURED"
                checked={photo.featured}
                onChange={(v) => patch(photo.id, { featured: v })}
              />
              <Toggle
                label={photo.published ? "PUBLISHED" : "UNPUBLISHED"}
                checked={photo.published}
                onChange={(v) => patch(photo.id, { published: v })}
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
                disabled={i === photos.length - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </AdminButton>

              {/* Inline per-photo image upload control */}
              {editingImageId === photo.id ? (
                <div className="flex items-center gap-2">
                  <ImageInput
                    bucket="photos"
                    value={photo.image_url}
                    onChange={async (url) => {
                      if (!url) return;
                      await patch(photo.id, { image_url: url });
                      setEditingImageId(null);
                    }}
                  />
                  <AdminButton variant="ghost" onClick={() => setEditingImageId(null)}>
                    Cancel
                  </AdminButton>
                </div>
              ) : (
                <AdminButton variant="outline" onClick={() => setEditingImageId(photo.id)}>
                  Upload
                </AdminButton>
              )}

              <AdminButton
                variant="outline"
                onClick={() => {
                  setEditingId(photo.id);
                  setDraft({ ...photo });
                }}
              >
                EDIT
              </AdminButton>
              <AdminButton variant="outline" aria-label="Delete" onClick={() => remove(photo.id)}>
                <Trash2 className="h-4 w-4" />
              </AdminButton>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
