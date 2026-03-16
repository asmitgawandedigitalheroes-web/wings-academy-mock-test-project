-- Create triggers for updated_at columns (run after functions are created)
-- This migration should be run after 20240101000000_create_functions.sql

CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_submissions_updated_at
  BEFORE UPDATE ON exam_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_exam_progress_updated_at
  BEFORE UPDATE ON user_exam_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_violations_updated_at
  BEFORE UPDATE ON exam_violations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
