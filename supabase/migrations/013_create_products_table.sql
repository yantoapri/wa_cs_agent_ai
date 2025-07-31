-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    discount INTEGER DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_agent_id ON products(agent_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow authenticated users to select their own products
CREATE POLICY "Users can view their own products" ON products
    FOR SELECT USING (
        agent_id IN (
            SELECT id FROM agents 
            WHERE created_by = auth.uid()
        )
    );

-- Allow authenticated users to insert their own products
CREATE POLICY "Users can insert their own products" ON products
    FOR INSERT WITH CHECK (
        agent_id IN (
            SELECT id FROM agents 
            WHERE created_by = auth.uid()
        )
    );

-- Allow authenticated users to update their own products
CREATE POLICY "Users can update their own products" ON products
    FOR UPDATE USING (
        agent_id IN (
            SELECT id FROM agents 
            WHERE created_by = auth.uid()
        )
    );

-- Allow authenticated users to delete their own products
CREATE POLICY "Users can delete their own products" ON products
    FOR DELETE USING (
        agent_id IN (
            SELECT id FROM agents 
            WHERE created_by = auth.uid()
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - for testing)
INSERT INTO products (agent_id, name, price, stock, discount, description, image_url) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'Produk Sample 1', 150000, 50, 10, 'Deskripsi produk sample 1', NULL),
    ('550e8400-e29b-41d4-a716-446655440000', 'Produk Sample 2', 250000, 30, 0, 'Deskripsi produk sample 2', NULL),
    ('550e8400-e29b-41d4-a716-446655440001', 'Produk Sample 3', 75000, 100, 15, 'Deskripsi produk sample 3', NULL)
ON CONFLICT DO NOTHING; 