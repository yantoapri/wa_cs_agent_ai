-- Add interval_config column to auto_messages table
-- This will be executed only if the auto_messages table exists
DO $$
BEGIN
    -- Check if auto_messages table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'auto_messages') THEN
        -- Add interval_config column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'auto_messages' AND column_name = 'interval_config'
        ) THEN
            ALTER TABLE auto_messages ADD COLUMN interval_config JSONB DEFAULT NULL;
        END IF;

        -- Create index for interval_config column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM pg_indexes 
            WHERE tablename = 'auto_messages' AND indexname = 'idx_auto_messages_interval_config'
        ) THEN
            CREATE INDEX idx_auto_messages_interval_config ON auto_messages USING GIN (interval_config);
        END IF;

        -- Add comment to explain the interval_config structure
        COMMENT ON COLUMN auto_messages.interval_config IS 'Configuration for interval-based scheduling: {startDate: "YYYY-MM-DD", time: "HH:MM", weekDays: [0-6], endDate: "YYYY-MM-DD"}';
    END IF;
END $$; 