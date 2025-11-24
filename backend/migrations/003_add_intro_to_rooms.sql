-- Add intro_content and intro_image columns to rooms table
ALTER TABLE rooms ADD COLUMN intro_content TEXT;
ALTER TABLE rooms ADD COLUMN intro_image VARCHAR(500);