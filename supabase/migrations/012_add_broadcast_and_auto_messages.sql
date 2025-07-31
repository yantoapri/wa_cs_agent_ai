-- Create broadcast_messages table
CREATE TABLE broadcast_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    contact_ids JSONB NOT NULL DEFAULT '[]',
    contact_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'sent', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create auto_messages table
CREATE TABLE auto_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    contact_ids JSONB NOT NULL DEFAULT '[]',
    contact_count INTEGER NOT NULL DEFAULT 0,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed', 'cancelled')),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_broadcast_messages_created_by ON broadcast_messages(created_by);
CREATE INDEX idx_broadcast_messages_status ON broadcast_messages(status);
CREATE INDEX idx_broadcast_messages_created_at ON broadcast_messages(created_at);

CREATE INDEX idx_auto_messages_created_by ON auto_messages(created_by);
CREATE INDEX idx_auto_messages_status ON auto_messages(status);
CREATE INDEX idx_auto_messages_scheduled_at ON auto_messages(scheduled_at);
CREATE INDEX idx_auto_messages_scheduled_at_status ON auto_messages(scheduled_at, status);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_broadcast_messages_updated_at 
    BEFORE UPDATE ON broadcast_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auto_messages_updated_at 
    BEFORE UPDATE ON auto_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE broadcast_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for broadcast_messages
CREATE POLICY "Users can view their own broadcast messages" ON broadcast_messages
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own broadcast messages" ON broadcast_messages
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own broadcast messages" ON broadcast_messages
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own broadcast messages" ON broadcast_messages
    FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for auto_messages
CREATE POLICY "Users can view their own auto messages" ON auto_messages
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own auto messages" ON auto_messages
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own auto messages" ON auto_messages
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own auto messages" ON auto_messages
    FOR DELETE USING (auth.uid() = created_by);

-- Insert sample data for testing
INSERT INTO broadcast_messages (title, message, contact_ids, contact_count, status, created_by) VALUES
(
    'Promo Weekend',
    'Dapatkan diskon 50% untuk semua produk kami di akhir pekan ini! Jangan lewatkan kesempatan terbatas ini.',
    '["contact1", "contact2", "contact3"]',
    150,
    'sent',
    (SELECT id FROM auth.users LIMIT 1)
),
(
    'Update Sistem',
    'Sistem akan mengalami maintenance pada hari Minggu pukul 02:00 WIB. Mohon maaf atas ketidaknyamanannya.',
    '["contact4", "contact5"]',
    89,
    'pending',
    (SELECT id FROM auth.users LIMIT 1)
);

INSERT INTO auto_messages (title, message, contact_ids, contact_count, scheduled_at, status, created_by) VALUES
(
    'Selamat Pagi',
    'Selamat pagi! Semoga hari Anda menyenangkan dan produktif. Jangan lupa untuk tetap semangat!',
    '["contact1", "contact2", "contact3", "contact4"]',
    200,
    NOW() + INTERVAL '1 day',
    'scheduled',
    (SELECT id FROM auth.users LIMIT 1)
),
(
    'Reminder Meeting',
    'Jangan lupa meeting hari ini pukul 14:00 WIB di ruang konferensi. Mohon hadir tepat waktu.',
    '["contact5", "contact6"]',
    45,
    NOW() - INTERVAL '2 hours',
    'sent',
    (SELECT id FROM auth.users LIMIT 1)
); 