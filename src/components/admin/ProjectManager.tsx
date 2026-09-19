import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PROJECT_CATEGORIES, projectsQuery, type Project } from "@/lib/content";
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
import { ProjectImagesEditor } from "./ProjectImagesEditor";
import { OptimizedImage } from "@/components/site/OptimizedImage";

type Draft = Partial<Project> & { title: string; slug: string };

const empty: Draft = {
  title: "",
  slug: "",
  description: "",
  client: "",
  year: String(new Date().getFullYear()),
  category: "Web Development",
  cover_image_url: null,
  live_url: "",
  github_url: "",
  featured: false,
  published: true,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function ProjectManager() {
  const queryClient = useQueryClient();
  const { data: projects = [] } = useQuery(projectsQuery(true));
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["projects"] });

  const save = async () => {
    if (!draft?.title) {
      toast.error("A title is required.");
      return;
    }
    const payload = {
      title: draft.title,
      slug: draft.slug || slugify(draft.title),
      description: draft.description || null,
      client: draft.client || null,
      year: draft.year || null,
      category: draft.category ?? "Web Development",
      cover_image_url: draft.cover_image_url || null,
      live_url: draft.live_url || null,
      github_url: draft.github_url || null,
      featured: draft.featured ?? false,
      published: draft.published ?? true,
      display_order: draft.display_order ?? projects.length + 1,
    };
    const { error } = editingId
      ? await supabase.from("projects").update(payload).eq("id", editingId)
      : await supabase.from("projects").insert(payload);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? "Project updated" : "Project added");
    setDraft(null);
    setEditingId(null);
    refresh();
  };

  const patch = async (id: string, values: Partial<Project>) => {
    const { error } = await supabase.from("projects").update(values).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Project deleted");
    refresh();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const current = projects[index];
    const target = projects[index + direction];
    if (!current || !target) return;
    await Promise.all([
      supabase
        .from("projects")
        .update({ display_order: index + direction + 1 })
        .eq("id", current.id),
      supabase
        .from("projects")
        .update({ display_order: index + 1 })
        .eq("id", target.id),
    ]);
    refresh();
  };

  return (
    <Panel title={`Projects (${projects.length})`}>
      {draft ? (
        <div className="space-y-5 border border-border p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="TITLE">
              <TextInput
                value={draft.title}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    title: e.target.value,
                    slug: editingId ? draft.slug : slugify(e.target.value),
                  })
                }
              />
            </Field>
            <Field label="SLUG">
              <TextInput
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })}
              />
            </Field>
          </div>
          <Field label="DESCRIPTION">
            <TextArea
              value={draft.description ?? ""}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </Field>
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="CLIENT">
              <TextInput
                value={draft.client ?? ""}
                onChange={(e) => setDraft({ ...draft, client: e.target.value })}
              />
            </Field>
            <Field label="YEAR">
              <TextInput
                value={draft.year ?? ""}
                onChange={(e) => setDraft({ ...draft, year: e.target.value })}
              />
            </Field>
            <Field label="CATEGORY">
              <SelectInput
                options={PROJECT_CATEGORIES}
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              />
            </Field>
          </div>
          <ImageInput
            bucket="project-images"
            label="COVER IMAGE"
            value={draft.cover_image_url ?? null}
            onChange={(url) => setDraft({ ...draft, cover_image_url: url })}
          />
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="LIVE URL">
              <TextInput
                value={draft.live_url ?? ""}
                onChange={(e) => setDraft({ ...draft, live_url: e.target.value })}
              />
            </Field>
            <Field label="GITHUB URL">
              <TextInput
                value={draft.github_url ?? ""}
                onChange={(e) => setDraft({ ...draft, github_url: e.target.value })}
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
          {editingId && <ProjectImagesEditor projectId={editingId} />}
          <div className="flex gap-2">
            <AdminButton onClick={save}>{editingId ? "SAVE PROJECT" : "ADD PROJECT"}</AdminButton>
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
        <AdminButton onClick={() => setDraft({ ...empty })}>+ ADD PROJECT</AdminButton>
      )}

      <ul className="divide-y divide-border border-t border-border">
        {projects.map((project, i) => (
          <li key={project.id} className="flex flex-wrap items-center gap-4 py-4">
            <div className="h-16 w-24 shrink-0 border border-border bg-subtle">
              {project.cover_image_url && (
                <OptimizedImage
                  src={project.cover_image_url}
                  alt=""
                  className="h-full w-full object-cover"
                  width={400}
                  quality={75}
                  sizes="96px"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold uppercase">{project.title}</p>
              <p className="eyebrow text-muted-foreground">
                {[project.category, project.year, project.published ? "PUBLISHED" : "DRAFT"]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Toggle
                label="FEATURED"
                checked={project.featured}
                onChange={(v) => patch(project.id, { featured: v })}
              />
              <Toggle
                label={project.published ? "PUBLISHED" : "UNPUBLISHED"}
                checked={project.published}
                onChange={(v) => patch(project.id, { published: v })}
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
                disabled={i === projects.length - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </AdminButton>
              <AdminButton
                variant="outline"
                onClick={() => {
                  setEditingId(project.id);
                  setDraft({ ...project });
                }}
              >
                EDIT
              </AdminButton>
              <AdminButton variant="outline" aria-label="Delete" onClick={() => remove(project.id)}>
                <Trash2 className="h-4 w-4" />
              </AdminButton>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
