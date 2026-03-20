-- Allow students to read test questions
CREATE POLICY "Allow public select on test_questions" 
ON public.test_questions FOR SELECT 
TO anon, authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.test_sets
    WHERE public.test_sets.id = public.test_questions.test_set_id
    AND public.test_sets.is_hidden = false
  )
);

-- Allow students to read question content
CREATE POLICY "Allow public select on questions" 
ON public.questions FOR SELECT 
TO anon, authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.test_questions
    JOIN public.test_sets ON public.test_sets.id = public.test_questions.test_set_id
    WHERE public.test_questions.question_id = public.questions.id
    AND public.test_sets.is_hidden = false
  )
);
