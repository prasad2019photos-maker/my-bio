import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { linksQuery, photosQuery, projectsQuery } from "@/lib/content";
import { AdminButton, Field, Panel, TextInput } from "@/components/admin/ui";
import { ProfileEditor, SiteSettingsEditor } from "@/components/admin/ProfileEditor";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { ProjectManager } from "@/components/admin/ProjectManager";
import { LinkManager } from "@/components/admin/LinkManager";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — Prsad" },
      { name: "description", content: "Content dashboard for prsad.com." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const TABS = ["DASHBOARD", "PROFILE", "PHOTOS", "PROJECTS", "LINKS", "SITE SETTINGS"] as const;
type Tab = (typeof TABS)[number];

function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light" | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-background text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<Tab>("DASHBOARD");
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Support selecting initial tab via ?tab=THINGS (or other tab names)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("tab");
      if (t && (TABS as readonly string[]).includes(t)) setTab(t as Tab);
    } catch (err) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  if (!ready) {
    return <div className="p-10 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!session) return <AdminAuth />;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md p-10">
        <p className="text-sm">This account does not have admin access.</p>
        <AdminButton
          className="mt-6"
          variant="outline"
          onClick={async () => {
            await supabase.auth.signOut();
            queryClient.clear();
          }}
        >
          SIGN OUT
        </AdminButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-subtle">
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <span className="text-sm font-bold tracking-[0.28em] uppercase">PRSAD / ADMIN</span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/" className="eyebrow text-muted-foreground hover:text-foreground">
              VIEW SITE
            </Link>
            <AdminButton
              variant="ghost"
              onClick={async () => {
                await queryClient.cancelQueries();
                queryClient.clear();
                await supabase.auth.signOut();
              }}
            >
              SIGN OUT
            </AdminButton>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-2">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn(
                "eyebrow min-h-[40px] shrink-0 border px-3 transition-colors",
                tab === item
                  ? "border-foreground bg-foreground text-background"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        {tab === "DASHBOARD" && <Dashboard />}
        {tab === "PROFILE" && <ProfileEditor />}
        {tab === "PHOTOS" && <PhotoManager />}
        {tab === "PROJECTS" && <ProjectManager />}
        {tab === "LINKS" && <LinkManager />}
        {tab === "SITE SETTINGS" && <SiteSettingsEditor />}
      </main>
    </div>
  );
}

function Dashboard() {
  const { data: photos = [] } = useQuery(photosQuery(true));
  const { data: projects = [] } = useQuery(projectsQuery(true));
  const { data: links = [] } = useQuery(linksQuery(true));

  const stats = [
    ["PHOTOS", photos.length],
    ["PROJECTS", projects.length],
    ["PUBLISHED PROJECTS", projects.filter((p) => p.published).length],
    ["ACTIVE LINKS", links.filter((l) => l.enabled).length],
  ] as const;

  return (
    <Panel title="Dashboard">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="border border-border p-5">
            <p className="text-4xl font-bold tracking-tight">{value}</p>
            <p className="eyebrow mt-2 text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AdminAuth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/admin` },
          });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (mode === "signup") toast.success("Account created — you are signed in.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <form onSubmit={submit} className="w-full max-w-sm border border-border p-7">
        <p className="text-sm font-bold tracking-[0.28em] uppercase">PRSAD / ADMIN</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {mode === "signin"
            ? "Sign in to manage your content."
            : "Create your admin account. The first account becomes the admin."}
        </p>
        <div className="mt-7 space-y-4">
          <Field label="EMAIL">
            <TextInput
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          <Field label="PASSWORD">
            <TextInput
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </Field>
        </div>
        <AdminButton type="submit" className="mt-6 w-full" disabled={busy}>
          {busy ? "…" : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
        </AdminButton>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="eyebrow mt-4 w-full text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "CREATE ADMIN ACCOUNT" : "I ALREADY HAVE AN ACCOUNT"}
        </button>
      </form>
    </div>
  );
}
