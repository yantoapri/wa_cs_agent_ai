-- Clean up duplicate agent_ai_configs entries
-- Keep only the most recent config for each agent_id
DELETE FROM agent_ai_configs 
WHERE id NOT IN (
  SELECT DISTINCT ON (agent_id) id 
  FROM agent_ai_configs 
  ORDER BY agent_id, created_at DESC
);

-- Ensure the unique constraint is properly enforced
ALTER TABLE agent_ai_configs DROP CONSTRAINT IF EXISTS agent_ai_configs_agent_id_key;
ALTER TABLE agent_ai_configs ADD CONSTRAINT agent_ai_configs_agent_id_key UNIQUE (agent_id); 