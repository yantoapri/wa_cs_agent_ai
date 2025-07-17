-- Add created_by to channels and agents
ALTER TABLE channels ADD COLUMN created_by UUID REFERENCES users(id);
ALTER TABLE agents ADD COLUMN created_by UUID REFERENCES users(id);

-- Update RLS policies for channels
DROP POLICY IF EXISTS "Enable read access for all users" ON channels;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON channels;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON channels;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON channels;

CREATE POLICY "Channels: Users can read their own channels" ON channels
  FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Channels: Users can insert their own channels" ON channels
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Channels: Users can update their own channels" ON channels
  FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Channels: Users can delete their own channels" ON channels
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