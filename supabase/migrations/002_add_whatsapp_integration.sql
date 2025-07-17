-- WhatsApp Integration Tables

-- Create WhatsApp sessions table
CREATE TABLE whatsapp_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chanel_id UUID NOT NULL REFERENCES chanels(id) ON DELETE CASCADE,
    session_name VARCHAR(255) NOT NULL DEFAULT 'default',
    status VARCHAR(50) NOT NULL DEFAULT 'STOPPED', -- STOPPED, SCAN_QR_CODE, WORKING
    qr_code_url TEXT,
    phone_number VARCHAR(50),
    is_authenticated BOOLEAN DEFAULT FALSE,
    is_ready BOOLEAN DEFAULT FALSE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chanel_id, session_name)
);

-- Create WhatsApp message templates table
CREATE TABLE whatsapp_message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chanel_id UUID NOT NULL REFERENCES chanels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]', -- Array of variable names that can be replaced
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create auto-reply rules table
CREATE TABLE auto_reply_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chanel_id UUID NOT NULL REFERENCES chanels(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    trigger_keywords TEXT[] NOT NULL, -- Array of keywords that trigger this rule
    reply_message TEXT NOT NULL,
    reply_template_id UUID REFERENCES whatsapp_message_templates(id),
    delay_seconds INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0, -- Higher priority rules are checked first
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation metrics table
CREATE TABLE conversation_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id),
    response_time_seconds INTEGER, -- Time taken to respond
    message_count INTEGER DEFAULT 0,
    customer_satisfaction INTEGER, -- 1-5 rating
    resolution_time_minutes INTEGER,
    handover_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI conversation logs table
CREATE TABLE ai_conversation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    used_knowledge TEXT, -- Which knowledge base was used
    handover_triggered BOOLEAN DEFAULT FALSE,
    handover_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for new tables
CREATE INDEX idx_whatsapp_sessions_chanel_id ON whatsapp_sessions(chanel_id);
CREATE INDEX idx_whatsapp_sessions_status ON whatsapp_sessions(status);
CREATE INDEX idx_whatsapp_message_templates_chanel_id ON whatsapp_message_templates(chanel_id);
CREATE INDEX idx_auto_reply_rules_chanel_id ON auto_reply_rules(chanel_id);
CREATE INDEX idx_auto_reply_rules_agent_id ON auto_reply_rules(agent_id);
CREATE INDEX idx_auto_reply_rules_priority ON auto_reply_rules(priority);
CREATE INDEX idx_conversation_metrics_conversation_id ON conversation_metrics(conversation_id);
CREATE INDEX idx_conversation_metrics_agent_id ON conversation_metrics(agent_id);
CREATE INDEX idx_ai_conversation_logs_conversation_id ON ai_conversation_logs(conversation_id);
CREATE INDEX idx_ai_conversation_logs_agent_id ON ai_conversation_logs(agent_id);
CREATE INDEX idx_ai_conversation_logs_created_at ON ai_conversation_logs(created_at);

-- Create triggers for updated_at
CREATE TRIGGER update_whatsapp_sessions_updated_at BEFORE UPDATE ON whatsapp_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_whatsapp_message_templates_updated_at BEFORE UPDATE ON whatsapp_message_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_auto_reply_rules_updated_at BEFORE UPDATE ON auto_reply_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversation_metrics_updated_at BEFORE UPDATE ON conversation_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_reply_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on whatsapp_sessions" ON whatsapp_sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations on whatsapp_message_templates" ON whatsapp_message_templates FOR ALL USING (true);
CREATE POLICY "Allow all operations on auto_reply_rules" ON auto_reply_rules FOR ALL USING (true);
CREATE POLICY "Allow all operations on conversation_metrics" ON conversation_metrics FOR ALL USING (true);
CREATE POLICY "Allow all operations on ai_conversation_logs" ON ai_conversation_logs FOR ALL USING (true);

-- Insert sample data
INSERT INTO whatsapp_sessions (chanel_id, session_name, status) 
SELECT id, 'default', 'STOPPED' FROM chanels WHERE name = 'WhatsApp chanel 1';

INSERT INTO whatsapp_message_templates (chanel_id, name, content, variables) VALUES 
(
    (SELECT id FROM chanels WHERE name = 'WhatsApp chanel 1' LIMIT 1),
    'Welcome Message',
    'Halo {{customer_name}}, terima kasih telah menghubungi kami. Ada yang bisa kami bantu?',
    '["customer_name"]'
),
(
    (SELECT id FROM chanels WHERE name = 'WhatsApp chanel 1' LIMIT 1),
    'Order Confirmation',
    'Terima kasih {{customer_name}}, pesanan Anda dengan nomor {{order_number}} telah dikonfirmasi.',
    '["customer_name", "order_number"]'
);

INSERT INTO auto_reply_rules (chanel_id, agent_id, trigger_keywords, reply_message, delay_seconds, priority) VALUES 
(
    (SELECT id FROM chanels WHERE name = 'WhatsApp chanel 1' LIMIT 1),
    (SELECT id FROM agents WHERE name = 'AI Bot 1' LIMIT 1),
    ARRAY['halo', 'hai', 'hello'],
    'Halo! Terima kasih telah menghubungi kami. Ada yang bisa saya bantu?',
    2,
    1
),
(
    (SELECT id FROM chanels WHERE name = 'WhatsApp chanel 1' LIMIT 1),
    (SELECT id FROM agents WHERE name = 'AI Bot 1' LIMIT 1),
    ARRAY['harga', 'berapa', 'cost'],
    'Untuk informasi harga, silakan beri tahu saya produk yang Anda minati.',
    3,
    2
); 