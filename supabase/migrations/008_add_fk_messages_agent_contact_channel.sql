-- Add foreign key for sender_id to agents
ALTER TABLE messages
ADD CONSTRAINT fk_sender_agent
FOREIGN KEY (sender_id) REFERENCES agents(id) ON DELETE SET NULL;

-- Add contact_id and chanel_id columns if not exist
ALTER TABLE messages ADD COLUMN IF NOT EXISTS contact_id UUID;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS chanel_id UUID;

-- Add foreign key for contact_id to contacts
ALTER TABLE messages
ADD CONSTRAINT fk_message_contact
FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;

-- Add foreign key for chanel_id to chanels
ALTER TABLE messages
ADD CONSTRAINT fk_message_chanel
FOREIGN KEY (chanel_id) REFERENCES chanels(id) ON DELETE SET NULL; 