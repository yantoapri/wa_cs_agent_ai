-- Add schedules column to auto_messages table
ALTER TABLE auto_messages ADD COLUMN schedules JSONB DEFAULT '[]';

-- Create index for schedules column
CREATE INDEX idx_auto_messages_schedules ON auto_messages USING GIN (schedules);

-- Update existing auto_messages to have empty schedules array
UPDATE auto_messages SET schedules = '[]' WHERE schedules IS NULL; 