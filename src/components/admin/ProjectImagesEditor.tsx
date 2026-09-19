import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { projectImagesQuery, uploadImage } from "@/lib/content";
import { AdminButton, Field } from "./ui";
import { OptimizedImage } from "@/components/site/OptimizedImage";

export function ProjectImagesEditor({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const { data: images = [] } = useQuery(projectImagesQuery(projectId));

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["project_images", projectId] });

  return (
    <div className="border border-border p-5">
      <Field label="ADDITIONAL PROJECT IMAGES">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            for (const [i, file] of files.entries()) {
              try {
                const url = await uploadImage("project-images", file);
                const { error } = await supabase.from("project_images").insert({
                  project_id: projectId,
                  image_url: url,
                  display_order: images.length + i + 1,
                });
                if (error) throw error;
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Upload failed");
              }
            }
            e.target.value = "";
            refresh();
            toast.success("Images added");
          }}
          className="block w-full text-xs file:mr-3 file:border file:border-border file:bg-background file:px-3 file:py-2 file:text-[10px] file:tracking-[0.18em] file:uppercase"
        />
      </Field>
      {images.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-3">
          {images.map((image) => (
            <li key={image.id} className="relative">
              <OptimizedImage
                src={image.image_url}
                alt=""
                className="h-24 w-32 border border-border object-cover"
                width={320}
                quality={75}
                sizes="128px"
              />
              <AdminButton
                variant="outline"
                aria-label="Delete image"
                className="absolute top-1 right-1 min-h-0 bg-background px-2 py-1"
                onClick={async () => {
                  const { error } = await supabase
                    .from("project_images")
                    .delete()
                    .eq("id", image.id);
                  if (error) {
                    toast.error(error.message);
                    return;
                  }
                  refresh();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </AdminButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
