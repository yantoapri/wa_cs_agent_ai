-- Add foreign key for sender_id to agents
ALTER TABLE messages
ADD CONSTRAINT fk_sender_agent
FOREIGN KEY (sender_id) REFERENCES agents(id) ON DELETE SET NULL;

-- Add contact_id and channel_id columns if not exist
ALTER TABLE messages ADD COLUMN IF NOT EXISTS contact_id UUID;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS channel_id UUID;

-- Add foreign key for contact_id to contacts
ALTER TABLE messages
ADD CONSTRAINT fk_message_contact
FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;

-- Add foreign key for channel_id to channels
ALTER TABLE messages
ADD CONSTRAINT fk_message_channel
FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE SET NULL; 