-- Add no_hp field to agents table
ALTER TABLE agents ADD COLUMN no_hp VARCHAR(50);

-- Update existing agents with sample phone numbers
UPDATE agents SET no_hp = '628123456789' WHERE name = 'AI Bot 1';
UPDATE agents SET no_hp = '628987654321' WHERE name = 'AI Bot 2';
UPDATE agents SET no_hp = '628111111111' WHERE name = 'Agent 1';
UPDATE agents SET no_hp = '628222222222' WHERE name = 'Agent 2'; 