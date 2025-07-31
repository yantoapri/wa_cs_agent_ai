-- Create default agent for existing users who don't have one
INSERT INTO agents (name, type, description, created_by)
SELECT 
    'Agent Default',
    'manusia',
    'Agent default untuk user',
    u.id
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM agents a WHERE a.created_by = u.id
);

-- Create function to automatically create default agent for new users
CREATE OR REPLACE FUNCTION create_default_agent()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO agents (name, type, description, created_by)
    VALUES ('Agent Default', 'manusia', 'Agent default untuk user', NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically create default agent for new users
DROP TRIGGER IF EXISTS create_default_agent_trigger ON users;
CREATE TRIGGER create_default_agent_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_agent(); 