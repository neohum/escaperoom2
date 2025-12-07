-- Add author and sponsor columns to rooms table
ALTER TABLE rooms ADD COLUMN author TEXT COMMENT '제작자 정보 (JSON)';
ALTER TABLE rooms ADD COLUMN sponsor TEXT COMMENT '후원자 정보 (JSON)';
