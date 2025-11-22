-- 문제 유형에 다답형(multiple_answer)과 OX 문제(true_false) 추가

ALTER TABLE questions 
MODIFY COLUMN type ENUM(
  'multiple_choice', 
  'multiple_answer', 
  'true_false', 
  'short_answer', 
  'image_puzzle', 
  'drag_drop', 
  'sequence', 
  'hotspot', 
  'password', 
  'story_choice', 
  'mini_game'
) NOT NULL;

