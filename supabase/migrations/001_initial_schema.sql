-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE agent_type AS ENUM ('ai', 'manusia');
CREATE TYPE chanel_type AS ENUM ('whatsapp', 'messenger', 'telegram');
CREATE TYPE message_type AS ENUM ('text', 'image', 'document', 'audio', 'video');
CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE agent_status AS ENUM ('online', 'offline', 'busy', 'away');

-- Create users table (for authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chanels table
CREATE TABLE chanels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type chanel_type NOT NULL DEFAULT 'whatsapp',
    whatsapp_number VARCHAR(50),
    icon_url TEXT,
    takeover_ai BOOLEAN DEFAULT FALSE,
    waktu_takeover INTEGER DEFAULT 0, -- dalam menit
    limit_balasan_ai BOOLEAN DEFAULT FALSE,
    maksimum_balasan_ai INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agents table
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type agent_type NOT NULL,
    status agent_status DEFAULT 'offline',
    avatar_url TEXT,
    description TEXT,
    kepintaran VARCHAR(50) DEFAULT 'Basic', -- Basic, Intermediate, Advanced
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agent AI configurations table
CREATE TABLE agent_ai_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    gaya_bicara TEXT,
    pengetahuan TEXT,
    handover_conditions JSONB DEFAULT '[]',
    followup_configs JSONB DEFAULT '[]',
    kirim_gambar_configs JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agent_id)
);

-- Create contacts table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(50),
    avatar_url TEXT,
    chanel_id UUID REFERENCES chanels(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chanel_id UUID NOT NULL REFERENCES chanels(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    contact_phone VARCHAR(50) NOT NULL,
    contact_name VARCHAR(255),
    last_message TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE,
    unread_count INTEGER DEFAULT 0,
    assigned_agent_id UUID REFERENCES agents(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    message_type message_type DEFAULT 'text',
    direction message_direction NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    sender_id UUID REFERENCES agents(id),
    sender_name VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chanel_agent_connections table (for connecting agents to chanels)
CREATE TABLE chanel_agent_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chanel_id UUID NOT NULL REFERENCES chanels(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chanel_id, agent_id)
);

-- Create conversation_handovers table (for tracking handovers between agents)
CREATE TABLE conversation_handovers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    from_agent_id UUID REFERENCES agents(id),
    to_agent_id UUID NOT NULL REFERENCES agents(id),
    reason TEXT,
    handover_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_chanel_id ON conversations(chanel_id);
CREATE INDEX idx_conversations_contact_phone ON conversations(contact_phone);
CREATE INDEX idx_conversations_assigned_agent ON conversations(assigned_agent_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_contacts_chanel_id ON contacts(chanel_id);
CREATE INDEX idx_contacts_phone ON contacts(phone_number);
CREATE INDEX idx_agent_ai_configs_agent_id ON agent_ai_configs(agent_id);
CREATE INDEX idx_chanel_agent_connections_chanel_id ON chanel_agent_connections(chanel_id);
CREATE INDEX idx_chanel_agent_connections_agent_id ON chanel_agent_connections(agent_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chanels_updated_at BEFORE UPDATE ON chanels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agent_ai_configs_updated_at BEFORE UPDATE ON agent_ai_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO users (email, name, avatar_url) VALUES 
('admin@osmochat.com', 'Admin OsmoChat', 'https://i.pravatar.cc/40?img=1');

INSERT INTO chanels (name, type, whatsapp_number, icon_url) VALUES 
('WhatsApp chanel 1', 'whatsapp', '6281234567890', 'https://img.icons8.com/color/48/000000/whatsapp.png'),
('WhatsApp chanel 2', 'whatsapp', '6289876543210', 'https://img.icons8.com/color/48/000000/whatsapp.png');

INSERT INTO agents (name, type, status, avatar_url, description, kepintaran) VALUES 
('AI Bot 1', 'ai', 'online', 'https://i.pravatar.cc/40?img=7', 'AI Assistant untuk customer service', 'Advanced'),
('AI Bot 2', 'ai', 'offline', 'https://i.pravatar.cc/40?img=8', 'AI untuk handling order', 'Intermediate'),
('Agent 1', 'manusia', 'online', 'https://i.pravatar.cc/40?img=9', 'Customer service agent', 'Basic'),
('Agent 2', 'manusia', 'offline', 'https://i.pravatar.cc/40?img=10', 'Sales agent', 'Basic');

INSERT INTO agent_ai_configs (agent_id, gaya_bicara, pengetahuan, handover_conditions, followup_configs) VALUES 
(
    (SELECT id FROM agents WHERE name = 'AI Bot 1' LIMIT 1),
    'Saya adalah AI assistant yang ramah dan membantu. Saya akan selalu memberikan jawaban yang akurat dan sopan.',
    'Saya memiliki pengetahuan tentang produk dan layanan perusahaan. Saya dapat membantu dengan pertanyaan umum, pemesanan, dan dukungan pelanggan.',
    '[{"id": 1, "text": "customer ingin berbicara dengan manusia"}, {"id": 2, "text": "pertanyaan kompleks tentang teknis"}]',
    '[{"keyword": "order", "mode": "generate", "reply": "Baik, saya akan membantu Anda dengan pemesanan", "delay": "5 detik"}]'
),
(
    (SELECT id FROM agents WHERE name = 'AI Bot 2' LIMIT 1),
    'Saya adalah AI yang fokus pada handling order dan transaksi.',
    'Saya memiliki pengetahuan khusus tentang proses pemesanan, pembayaran, dan tracking order.',
    '[{"id": 1, "text": "masalah pembayaran"}, {"id": 2, "text": "komplain order"}]',
    '[{"keyword": "status", "mode": "generate", "reply": "Saya akan cek status order Anda", "delay": "10 detik"}]'
);

INSERT INTO contacts (name, email, phone_number, avatar_url, chanel_id) VALUES 
('Andi', 'andi@email.com', '6281234567890', 'https://randomuser.me/api/portraits/men/32.jpg', (SELECT id FROM chanels LIMIT 1)),
('Budi', 'budi@email.com', '6289876543210', 'https://randomuser.me/api/portraits/men/45.jpg', (SELECT id FROM chanels LIMIT 1));

-- Connect agents to chanels
INSERT INTO chanel_agent_connections (chanel_id, agent_id) 
SELECT c.id, a.id 
FROM chanels c, agents a 
WHERE c.name = 'WhatsApp chanel 1' AND a.type = 'ai';

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chanels ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_ai_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chanel_agent_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_handovers ENABLE ROW LEVEL SECURITY;

-- Create policies (basic - allow all for now, can be customized later)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on chanels" ON chanels FOR ALL USING (true);
CREATE POLICY "Allow all operations on agents" ON agents FOR ALL USING (true);
CREATE POLICY "Allow all operations on agent_ai_configs" ON agent_ai_configs FOR ALL USING (true);
CREATE POLICY "Allow all operations on contacts" ON contacts FOR ALL USING (true);
CREATE POLICY "Allow all operations on conversations" ON conversations FOR ALL USING (true);
CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on chanel_agent_connections" ON chanel_agent_connections FOR ALL USING (true);
CREATE POLICY "Allow all operations on conversation_handovers" ON conversation_handovers FOR ALL USING (true); 