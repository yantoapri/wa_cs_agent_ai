-- Add created_by to chanels and agents
ALTER TABLE chanels ADD COLUMN created_by UUID REFERENCES users(id);
ALTER TABLE agents ADD COLUMN created_by UUID REFERENCES users(id);

-- Update RLS policies for chanels
DROP POLICY IF EXISTS "Enable read access for all users" ON chanels;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON chanels;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON chanels;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON chanels;

CREATE POLICY "chanels: Users can read their own chanels" ON chanels
  FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "chanels: Users can insert their own chanels" ON chanels
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "chanels: Users can update their own chanels" ON chanels
  FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "chanels: Users can delete their own chanels" ON chanels
  FOR DELETE USING (created_by = auth.uid());

-- Update RLS policies for agents
DROP POLICY IF EXISTS "Enable read access for all users" ON agents;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON agents;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON agents;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON agents;

CREATE POLICY "Agents: Users can read their own agents" ON agents
  FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Agents: Users can insert their own agents" ON agents
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Agents: Users can update their own agents" ON agents
  FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Agents: Users can delete their own agents" ON agents
  FOR DELETE USING (created_by = auth.uid()); 