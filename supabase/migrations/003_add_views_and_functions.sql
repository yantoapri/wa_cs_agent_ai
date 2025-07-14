-- Create useful views for the application

-- View for conversation summary with latest message and agent info
CREATE VIEW conversation_summary AS
SELECT 
    c.id,
    c.channel_id,
    ch.name as channel_name,
    c.contact_id,
    co.name as contact_name,
    c.contact_phone,
    c.last_message,
    c.last_message_time,
    c.unread_count,
    c.assigned_agent_id,
    a.name as assigned_agent_name,
    a.type as assigned_agent_type,
    a.status as assigned_agent_status,
    c.is_active,
    c.created_at,
    c.updated_at
FROM conversations c
LEFT JOIN channels ch ON c.channel_id = ch.id
LEFT JOIN contacts co ON c.contact_id = co.id
LEFT JOIN agents a ON c.assigned_agent_id = a.id;

-- View for agent performance metrics
CREATE VIEW agent_performance AS
SELECT 
    a.id as agent_id,
    a.name as agent_name,
    a.type as agent_type,
    COUNT(DISTINCT c.id) as total_conversations,
    COUNT(DISTINCT CASE WHEN c.assigned_agent_id = a.id THEN c.id END) as assigned_conversations,
    AVG(cm.response_time_seconds) as avg_response_time,
    AVG(cm.customer_satisfaction) as avg_satisfaction,
    AVG(cm.resolution_time_minutes) as avg_resolution_time,
    SUM(cm.handover_count) as total_handovers
FROM agents a
LEFT JOIN conversations c ON a.id = c.assigned_agent_id
LEFT JOIN conversation_metrics cm ON c.id = cm.conversation_id AND cm.agent_id = a.id
WHERE a.is_active = true
GROUP BY a.id, a.name, a.type;

-- View for channel statistics
CREATE VIEW channel_statistics AS
SELECT 
    ch.id as channel_id,
    ch.name as channel_name,
    ch.type as channel_type,
    COUNT(DISTINCT c.id) as total_conversations,
    COUNT(DISTINCT CASE WHEN c.unread_count > 0 THEN c.id END) as unread_conversations,
    COUNT(DISTINCT co.id) as total_contacts,
    COUNT(DISTINCT a.id) as connected_agents,
    ws.status as whatsapp_status,
    ws.is_authenticated as whatsapp_authenticated
FROM channels ch
LEFT JOIN conversations c ON ch.id = c.channel_id
LEFT JOIN contacts co ON ch.id = co.channel_id
LEFT JOIN channel_agent_connections cac ON ch.id = cac.channel_id
LEFT JOIN agents a ON cac.agent_id = a.id
LEFT JOIN whatsapp_sessions ws ON ch.id = ws.channel_id AND ws.session_name = 'default'
WHERE ch.is_active = true
GROUP BY ch.id, ch.name, ch.type, ws.status, ws.is_authenticated;

-- View for AI conversation analysis
CREATE VIEW ai_conversation_analysis AS
SELECT 
    acl.id,
    acl.conversation_id,
    c.contact_phone,
    c.contact_name,
    acl.agent_id,
    ag.name as agent_name,
    acl.user_message,
    acl.ai_response,
    acl.confidence_score,
    acl.used_knowledge,
    acl.handover_triggered,
    acl.handover_reason,
    acl.created_at,
    CASE 
        WHEN acl.confidence_score >= 0.8 THEN 'High'
        WHEN acl.confidence_score >= 0.6 THEN 'Medium'
        ELSE 'Low'
    END as confidence_level
FROM ai_conversation_logs acl
JOIN conversations c ON acl.conversation_id = c.id
JOIN agents ag ON acl.agent_id = ag.id;

-- Create functions for common operations

-- Function to get conversation with messages
CREATE OR REPLACE FUNCTION get_conversation_with_messages(conv_id UUID)
RETURNS TABLE (
    conversation_id UUID,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    last_message TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE,
    unread_count INTEGER,
    assigned_agent_name VARCHAR(255),
    message_id UUID,
    message_content TEXT,
    message_type message_type,
    message_direction message_direction,
    sender_name VARCHAR(255),
    message_created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as conversation_id,
        c.contact_name,
        c.contact_phone,
        c.last_message,
        c.last_message_time,
        c.unread_count,
        a.name as assigned_agent_name,
        m.id as message_id,
        m.content as message_content,
        m.message_type,
        m.direction as message_direction,
        m.sender_name,
        m.created_at as message_created_at
    FROM conversations c
    LEFT JOIN agents a ON c.assigned_agent_id = a.id
    LEFT JOIN messages m ON c.id = m.conversation_id
    WHERE c.id = conv_id
    ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get agent AI configuration
CREATE OR REPLACE FUNCTION get_agent_ai_config(agent_uuid UUID)
RETURNS TABLE (
    agent_id UUID,
    agent_name VARCHAR(255),
    gaya_bicara TEXT,
    pengetahuan TEXT,
    handover_conditions JSONB,
    followup_configs JSONB,
    kirim_gambar_configs JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as agent_id,
        a.name as agent_name,
        aac.gaya_bicara,
        aac.pengetahuan,
        aac.handover_conditions,
        aac.followup_configs,
        aac.kirim_gambar_configs
    FROM agents a
    LEFT JOIN agent_ai_configs aac ON a.id = aac.agent_id
    WHERE a.id = agent_uuid AND a.type = 'ai';
END;
$$ LANGUAGE plpgsql;

-- Function to update conversation last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET 
        last_message = NEW.content,
        last_message_time = NEW.created_at,
        unread_count = CASE 
            WHEN NEW.direction = 'inbound' THEN unread_count + 1
            ELSE unread_count
        END,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating conversation last message
CREATE TRIGGER trigger_update_conversation_last_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Function to mark conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_as_read(conv_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE conversations 
    SET unread_count = 0, updated_at = NOW()
    WHERE id = conv_id;
    
    UPDATE messages 
    SET is_read = true
    WHERE conversation_id = conv_id AND direction = 'inbound';
END;
$$ LANGUAGE plpgsql;

-- Function to get auto-reply rules for a channel
CREATE OR REPLACE FUNCTION get_auto_reply_rules(channel_uuid UUID)
RETURNS TABLE (
    rule_id UUID,
    agent_id UUID,
    agent_name VARCHAR(255),
    trigger_keywords TEXT[],
    reply_message TEXT,
    delay_seconds INTEGER,
    priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        arr.id as rule_id,
        arr.agent_id,
        a.name as agent_name,
        arr.trigger_keywords,
        arr.reply_message,
        arr.delay_seconds,
        arr.priority
    FROM auto_reply_rules arr
    LEFT JOIN agents a ON arr.agent_id = a.id
    WHERE arr.channel_id = channel_uuid 
    AND arr.is_active = true
    ORDER BY arr.priority DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to log AI conversation
CREATE OR REPLACE FUNCTION log_ai_conversation(
    conv_id UUID,
    agent_uuid UUID,
    user_msg TEXT,
    ai_resp TEXT,
    conf_score DECIMAL DEFAULT NULL,
    knowledge_used TEXT DEFAULT NULL,
    handover_triggered BOOLEAN DEFAULT FALSE,
    handover_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO ai_conversation_logs (
        conversation_id,
        agent_id,
        user_message,
        ai_response,
        confidence_score,
        used_knowledge,
        handover_triggered,
        handover_reason
    ) VALUES (
        conv_id,
        agent_uuid,
        user_msg,
        ai_resp,
        conf_score,
        knowledge_used,
        handover_triggered,
        handover_reason
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql; 