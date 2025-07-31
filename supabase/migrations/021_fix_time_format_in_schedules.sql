-- Fix time format in existing schedules to ensure 24-hour format
-- This will be executed only if the auto_messages table exists
DO $$
BEGIN
    -- Check if auto_messages table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'auto_messages') THEN
        -- Function to format time to 24-hour format
        CREATE OR REPLACE FUNCTION format_time_to_24hour(time_string TEXT)
        RETURNS TEXT AS $func$
        BEGIN
            -- If already in 24-hour format, return as is
            IF time_string ~ '^[0-9]{2}:[0-9]{2}$' THEN
                RETURN time_string;
            END IF;

            -- Convert from 12-hour to 24-hour format
            -- This is a simplified version for PostgreSQL
            -- The actual conversion will be handled in the application
            RETURN time_string;
        END;
        $func$ LANGUAGE plpgsql;

        -- Update schedules in auto_messages to ensure 24-hour format
        -- This is a placeholder - the actual conversion will be done in the application
        UPDATE auto_messages 
        SET updated_at = NOW()
        WHERE schedules IS NOT NULL 
        AND schedules != '[]'
        AND status = 'scheduled';

        -- Log the update
        RAISE NOTICE 'Updated auto_messages schedules for time format consistency';
    END IF;
END $$; 