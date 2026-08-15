
CREATE POLICY "public can read site images" ON storage.objects FOR SELECT
  USING (bucket_id IN ('photos','project-images','profile-images'));
CREATE POLICY "admins upload site images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('photos','project-images','profile-images') AND public.is_admin());
CREATE POLICY "admins update site images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('photos','project-images','profile-images') AND public.is_admin());
CREATE POLICY "admins delete site images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('photos','project-images','profile-images') AND public.is_admin());
