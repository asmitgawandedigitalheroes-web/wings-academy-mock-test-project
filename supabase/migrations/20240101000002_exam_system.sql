
CREATE TABLE IF NOT EXISTS exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  time_limit_minutes INTEGER NOT NULL DEFAULT 60,
  questions JSONB NOT NULL,
  passing_score INTEGER DEFAULT 70,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  correct_answers INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  violation_count INTEGER DEFAULT 0,
  flagged_for_review BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'completed' CHECK (
    status IN ('in_progress', 'completed', 'under_review', 'rejected', 'approved')
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS user_exam_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'not_started' CHECK (
    status IN ('not_started', 'in_progress', 'completed', 'terminated')
  ),
  score DECIMAL(5,2),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  violation_count INTEGER DEFAULT 0,
  last_position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exam_id)
);


CREATE INDEX idx_exams_active ON exams(is_active);
CREATE INDEX idx_exam_submissions_user ON exam_submissions(user_id);
CREATE INDEX idx_exam_submissions_exam ON exam_submissions(exam_id);
CREATE INDEX idx_exam_submissions_score ON exam_submissions(score);
CREATE INDEX idx_exam_submissions_status ON exam_submissions(status);
CREATE INDEX idx_user_exam_progress_user ON user_exam_progress(user_id);
CREATE INDEX idx_user_exam_progress_exam ON user_exam_progress(exam_id);
CREATE INDEX idx_user_exam_progress_status ON user_exam_progress(status);

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exam_progress ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Anyone can view active exams" ON exams
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage exams" ON exams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );


CREATE POLICY "Users can view their own submissions" ON exam_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions" ON exam_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can create their own submissions" ON exam_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);


CREATE POLICY "Users can view their own progress" ON user_exam_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" ON user_exam_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can manage their own progress" ON user_exam_progress
  FOR ALL USING (auth.uid() = user_id);

-- Note: Triggers will be created after the function is available
-- Run the 20240101000000_create_functions.sql migration first

CREATE VIEW exam_analytics AS
SELECT 
  e.id as exam_id,
  e.title,
  COUNT(es.id) as total_submissions,
  AVG(es.score) as average_score,
  MAX(es.score) as highest_score,
  MIN(es.score) as lowest_score,
  COUNT(CASE WHEN es.flagged_for_review THEN 1 END) as flagged_submissions,
  AVG(es.violation_count) as average_violations
FROM exams e
LEFT JOIN exam_submissions es ON e.id = es.exam_id
WHERE e.is_active = true
GROUP BY e.id, e.title;

CREATE VIEW user_exam_history AS
SELECT 
  u.id as user_id,
  u.email,
  e.id as exam_id,
  e.title,
  es.score,
  es.status,
  es.submitted_at,
  es.violation_count,
  es.flagged_for_review
FROM auth.users u
JOIN exam_submissions es ON u.id = es.user_id
JOIN exams e ON es.exam_id = e.id
ORDER BY es.submitted_at DESC;
