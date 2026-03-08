
-- Create a function to validate API key for inserts
CREATE OR REPLACE FUNCTION public.validate_project_api_key(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects WHERE id = p_project_id
  )
$$;

-- Drop the overly permissive policies
DROP POLICY "Allow insert via API key" ON public.sessions;
DROP POLICY "Allow insert via API key" ON public.pageviews;
DROP POLICY "Allow insert via API key" ON public.events;

-- Create proper insert policies that validate project exists
CREATE POLICY "Allow insert with valid project" ON public.sessions FOR INSERT
  WITH CHECK (public.validate_project_api_key(project_id));

CREATE POLICY "Allow insert with valid project" ON public.pageviews FOR INSERT
  WITH CHECK (public.validate_project_api_key(project_id));

CREATE POLICY "Allow insert with valid project" ON public.events FOR INSERT
  WITH CHECK (public.validate_project_api_key(project_id));
