DROP TABLE IF EXISTS project2;

CREATE TABLE project2 (
  id SERIAL PRIMARY KEY,
  question TEXT,
  answer1 TEXT,
  answer2 TEXT,
  answer3 TEXT,
  answer4 TEXT,
  correct_ans INT,
  is_deleted INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);