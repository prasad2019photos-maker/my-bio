import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type Photo = Tables<"photos">;
export type Project = Tables<"projects">;
export type ProjectImage = Tables<"project_images">;
export type SocialLink = Tables<"social_links">;
export type SiteSettings = Tables<"site_settings">;

export const PHOTO_CATEGORIES = [
  "Travel",
  "People",
  "Photography",
  "City",
  "Nature",
  "Behind the Scenes",
  "Film",
  "Random",
] as const;

export const PHOTO_ASPECTS = ["portrait", "landscape", "square", "wide", "tall"] as const;

export const PROJECT_CATEGORIES = [
  "Web Development",
  "Web Design",
  "Personal Project",
  "Creative Development",
  "Experimental",
] as const;

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async (): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const settingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: async (): Promise<SiteSettings | null> => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const photosQuery = (all = false) =>
  queryOptions({
    queryKey: ["photos", all],
    queryFn: async (): Promise<Photo[]> => {
      let q = supabase.from("photos").select("*");
      if (!all) q = q.eq("published", true);
      const { data, error } = await q
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const projectsQuery = (all = false) =>
  queryOptions({
    queryKey: ["projects", all],
    queryFn: async (): Promise<Project[]> => {
      let q = supabase.from("projects").select("*");
      if (!all) q = q.eq("published", true);
      const { data, error } = await q
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const projectBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["project", slug],
    queryFn: async (): Promise<{ project: Project; images: ProjectImage[] } | null> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const { data: images, error: imgError } = await supabase
        .from("project_images")
        .select("*")
        .eq("project_id", data.id)
        .order("display_order", { ascending: true });
      if (imgError) throw imgError;
      return { project: data, images: images ?? [] };
    },
  });

export const projectImagesQuery = (projectId: string) =>
  queryOptions({
    queryKey: ["project_images", projectId],
    queryFn: async (): Promise<ProjectImage[]> => {
      const { data, error } = await supabase
        .from("project_images")
        .select("*")
        .eq("project_id", projectId)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

export const linksQuery = (all = false) =>
  queryOptions({
    queryKey: ["social_links", all],
    queryFn: async (): Promise<SocialLink[]> => {
      let q = supabase.from("social_links").select("*");
      if (!all) q = q.eq("enabled", true);
      const { data, error } = await q.order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });


const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/** Uploads a file to a storage bucket and returns a long-lived signed URL. */
export async function uploadImage(bucket: string, file: File): Promise<string> {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
  if (!allowed.includes(file.type)) {
    throw new Error("Only JPG, PNG, WEBP, AVIF or GIF images are allowed.");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("Image must be smaller than 15MB.");
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  const { data, error: signError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, TEN_YEARS);
  if (signError) throw signError;
  return data.signedUrl;
}
