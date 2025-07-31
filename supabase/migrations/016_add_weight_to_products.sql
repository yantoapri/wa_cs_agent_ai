-- Add weight columns to products table
ALTER TABLE products 
ADD COLUMN weight DECIMAL(10,2) DEFAULT 0,
ADD COLUMN weight_unit VARCHAR(10) DEFAULT 'gram' CHECK (weight_unit IN ('gram', 'kg'));

-- Update existing products with default weight values
UPDATE products SET weight = 100, weight_unit = 'gram' WHERE weight IS NULL; 