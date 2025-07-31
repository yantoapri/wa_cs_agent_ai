-- Add indexes for auto message scheduler optimization
-- These indexes will be created only if the auto_messages table exists
DO $$
BEGIN
    -- Check if auto_messages table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'auto_messages') THEN
        -- Add indexes for auto message scheduler optimization
        CREATE INDEX IF NOT EXISTS idx_auto_messages_status_scheduled_at 
        ON auto_messages(status, scheduled_at);

        CREATE INDEX IF NOT EXISTS idx_auto_messages_created_by_status 
        ON auto_messages(created_by, status);

        CREATE INDEX IF NOT EXISTS idx_auto_messages_chanel_id_status 
        ON auto_messages(chanel_id, status);

        -- Add composite index for efficient scheduler queries
        CREATE INDEX IF NOT EXISTS idx_auto_messages_scheduler_query 
        ON auto_messages(status, scheduled_at, chanel_id) 
        WHERE status = 'scheduled';
    END IF;
END $$;

-- Note: idx_contacts_phone already exists in migration 001_initial_schema.sql
-- No need to create duplicate index for contacts phone number

-- Add index for channel session lookup
-- This will be created only if the chanels table exists
DO $$
BEGIN
    -- Check if chanels table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chanels') THEN
        CREATE INDEX IF NOT EXISTS idx_chanels_session_name 
        ON chanels(session_name);
    END IF;
END $$; 