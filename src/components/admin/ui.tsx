import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/content";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/site/OptimizedImage";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const base =
  "w-full border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-foreground";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(base, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={4} {...props} className={cn(base, "resize-y", props.className)} />;
}

export function SelectInput({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[] }) {
  return (
    <select {...props} className={cn(base, props.className)}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "eyebrow inline-flex min-h-10 items-center gap-2 border px-3 transition-colors",
        checked
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground",
      )}
      aria-pressed={checked}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", checked ? "bg-accent" : "bg-muted-foreground")}
      />
      {label}
    </button>
  );
}

export function AdminButton({
  variant = "solid",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "outline" | "ghost" }) {
  return (
    <button
      {...props}
      className={cn(
        "eyebrow inline-flex min-h-11 items-center justify-center gap-2 px-4 transition-colors disabled:opacity-50",
        variant === "solid" &&
          "border border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground",
        variant === "outline" && "border border-border hover:bg-foreground hover:text-background",
        variant === "ghost" && "text-muted-foreground hover:text-foreground",
        className,
      )}
    />
  );
}

export function ImageInput({
  bucket,
  value,
  onChange,
  label = "IMAGE",
}: {
  bucket: string;
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <Field label={label}>
      <div className="flex items-start gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden border border-border bg-subtle">
          {value ? (
            <OptimizedImage
              src={value}
              alt=""
              className="h-full w-full object-cover"
              width={200}
              quality={75}
              sizes="96px"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
              NONE
            </span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setBusy(true);
              try {
                const url = await uploadImage(bucket, file);
                onChange(url);
                toast.success("Image uploaded");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Upload failed");
              } finally {
                setBusy(false);
                e.target.value = "";
              }
            }}
            className="block w-full text-xs file:mr-3 file:border file:border-border file:bg-background file:px-3 file:py-2 file:text-[10px] file:tracking-[0.18em] file:uppercase"
          />
          <TextInput
            value={value ?? ""}
            placeholder="…or paste an image URL"
            onChange={(e) => onChange(e.target.value || null)}
          />
          {busy && <p className="text-xs text-muted-foreground">Uploading…</p>}
        </div>
      </div>
    </Field>
  );
}

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-border bg-background p-5 md:p-7">
      <h2 className="text-sm font-semibold tracking-[0.16em] uppercase">{title}</h2>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}
