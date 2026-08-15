
-- roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- first signup becomes admin
CREATE OR REPLACE FUNCTION public.handle_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_first_admin
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_first_admin();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- profiles (single row site owner profile)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Prsad',
  tagline text NOT NULL DEFAULT 'I build websites for fun.',
  roles_line text NOT NULL DEFAULT 'TRAVELLER · TECHIE · FRONT-END DEVELOPER · CODER · PHOTOGRAPHER · FILMMAKER · STORYTELLER',
  hero_description text NOT NULL DEFAULT '',
  about_text text NOT NULL DEFAULT '',
  personal_statement text NOT NULL DEFAULT 'BUILD THINGS.
SEE THE WORLD.
TELL STORIES.',
  statement_sub text NOT NULL DEFAULT 'Build. Travel. Capture. Create. Repeat.',
  availability_status text NOT NULL DEFAULT 'AVAILABLE FOR PROJECTS',
  is_available boolean NOT NULL DEFAULT true,
  hero_image_url text,
  profile_image_url text,
  contact_email text NOT NULL DEFAULT 'hello@prsad.com',
  personal_site_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile is public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "admins manage profile" ON public.profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- photos
CREATE TABLE public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text,
  caption text,
  location text,
  taken_on date,
  category text NOT NULL DEFAULT 'Photography',
  aspect text NOT NULL DEFAULT 'portrait',
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.photos TO authenticated;
GRANT ALL ON public.photos TO service_role;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published photos are public" ON public.photos FOR SELECT USING (published);
CREATE POLICY "admins read all photos" ON public.photos FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins write photos" ON public.photos FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "admins update photos" ON public.photos FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins delete photos" ON public.photos FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER photos_touch BEFORE UPDATE ON public.photos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  client text,
  year text,
  category text NOT NULL DEFAULT 'Web Development',
  cover_image_url text,
  live_url text,
  github_url text,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published projects are public" ON public.projects FOR SELECT USING (published);
CREATE POLICY "admins read all projects" ON public.projects FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "admins update projects" ON public.projects FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins delete projects" ON public.projects FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER projects_touch BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- project images
CREATE TABLE public.project_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.project_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_images TO authenticated;
GRANT ALL ON public.project_images TO service_role;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "images of published projects are public" ON public.project_images FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.published));
CREATE POLICY "admins read all project images" ON public.project_images FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins insert project images" ON public.project_images FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "admins update project images" ON public.project_images FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins delete project images" ON public.project_images FOR DELETE TO authenticated USING (public.is_admin());

-- social links
CREATE TABLE public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  label text NOT NULL,
  url text NOT NULL,
  icon text NOT NULL DEFAULT 'link',
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.social_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_links TO authenticated;
GRANT ALL ON public.social_links TO service_role;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enabled links are public" ON public.social_links FOR SELECT USING (enabled);
CREATE POLICY "admins read all links" ON public.social_links FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins insert links" ON public.social_links FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "admins update links" ON public.social_links FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins delete links" ON public.social_links FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER social_links_touch BEFORE UPDATE ON public.social_links FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- site settings
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title text NOT NULL DEFAULT 'Prsad — I build websites for fun.',
  meta_description text NOT NULL DEFAULT 'Prsad is a front-end developer, traveller, photographer, aspiring filmmaker and storyteller who builds websites and digital experiences.',
  contact_email text NOT NULL DEFAULT 'hello@prsad.com',
  accent_color text NOT NULL DEFAULT '#C8FF3D',
  availability_status text NOT NULL DEFAULT 'AVAILABLE FOR PROJECTS',
  footer_text text NOT NULL DEFAULT 'building things, telling stories.',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings are public" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "admins manage settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER site_settings_touch BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- seed
INSERT INTO public.profiles (hero_description, about_text, personal_site_url) VALUES (
'I build websites and digital experiences, explore new places, capture moments, and turn ideas into things people can experience.',
'I build websites for fun, but there''s a lot more to me than just code.

I''m a front-end developer, coder, traveller, photographer, aspiring filmmaker and storyteller.

I like technology. I like design. I like cameras. I like discovering new places. I like sitting down with an idea and seeing where it takes me.

I''ve built websites and digital projects for clients, experimented with personal ideas, travelled to new places, captured moments through photography, and collected stories along the way.

I''m still figuring things out.

And that''s probably the fun part.',
NULL);

INSERT INTO public.site_settings DEFAULT VALUES;

INSERT INTO public.social_links (platform, label, url, icon, display_order, enabled) VALUES
('Instagram','Instagram','#','instagram',1,true),
('GitHub','GitHub','#','github',2,true),
('LinkedIn','LinkedIn','#','linkedin',3,true),
('YouTube','YouTube','#','youtube',4,true),
('Email','Email','mailto:hello@prsad.com','mail',5,true);

INSERT INTO public.projects (title, slug, description, client, year, category, display_order, featured, published) VALUES
('[PROJECT TITLE]','placeholder-project-one','[PROJECT DESCRIPTION]','[CLIENT NAME]','2026','Web Design',1,true,true),
('[PROJECT TITLE]','placeholder-project-two','[PROJECT DESCRIPTION]','[CLIENT NAME]','2026','Web Development',2,false,true),
('[PROJECT TITLE]','placeholder-project-three','[PROJECT DESCRIPTION]','[CLIENT NAME]','2026','Personal Project',3,false,true);
