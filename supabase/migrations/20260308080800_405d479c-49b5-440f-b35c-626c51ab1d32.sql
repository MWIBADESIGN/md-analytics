CREATE POLICY "Allow update with valid project"
  ON public.sessions FOR UPDATE
  USING (validate_project_api_key(project_id))
  WITH CHECK (validate_project_api_key(project_id));