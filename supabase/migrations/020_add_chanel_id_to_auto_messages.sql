-- Add chanel_id column to auto_messages table
-- This will be executed only if the auto_messages table exists
DO $$
BEGIN
    -- Check if auto_messages table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'auto_messages') THEN
        -- Add chanel_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'auto_messages' AND column_name = 'chanel_id'
        ) THEN
            ALTER TABLE auto_messages ADD COLUMN chanel_id UUID REFERENCES chanels(id) ON DELETE SET NULL;
        END IF;

        -- Add schedules column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'auto_messages' AND column_name = 'schedules'
        ) THEN
            ALTER TABLE auto_messages ADD COLUMN schedules JSONB DEFAULT '[]';
        END IF;

        -- Create index for schedules column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM pg_indexes 
            WHERE tablename = 'auto_messages' AND indexname = 'idx_auto_messages_schedules'
        ) THEN
            CREATE INDEX idx_auto_messages_schedules ON auto_messages USING GIN (schedules);
        END IF;

        -- Update existing auto_messages to have empty schedules array
        UPDATE auto_messages SET schedules = '[]' WHERE schedules IS NULL;
    END IF;
END $$; 