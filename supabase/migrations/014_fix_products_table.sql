-- Drop existing products table if it exists
DROP TABLE IF EXISTS products CASCADE;

-- Create products table with correct structure
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    discount INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_created_by ON products(created_by);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_created_at ON products(created_at);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for products table
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for products table
CREATE POLICY "Users can view their own products" ON products
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own products" ON products
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own products" ON products
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own products" ON products
    FOR DELETE USING (auth.uid() = created_by);

-- Insert sample data (without created_by for now)
INSERT INTO products (name, description, price, stock, discount, image) VALUES
('Laptop Asus ROG', 'Laptop gaming dengan performa tinggi', 15000000, 5, 10, NULL),
('Smartphone Samsung Galaxy', 'Smartphone dengan kamera terbaik', 8000000, 10, 0, NULL),
('Headphone Sony WH-1000XM4', 'Headphone wireless dengan noise cancelling', 3500000, 15, 5, NULL),
('Tablet iPad Pro', 'Tablet premium untuk produktivitas', 12000000, 3, 15, NULL),
('Smartwatch Apple Watch', 'Smartwatch dengan fitur kesehatan lengkap', 6000000, 8, 0, NULL); 