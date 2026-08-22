-- 1. Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) UNIQUE NOT NULL,   -- e.g. "PRD001"
    name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 2. Inventory batches table
-- Every "purchase" event creates one row here.
-- remaining_quantity is what FIFO consumption decrements.
CREATE TABLE IF NOT EXISTS inventory_batches (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL REFERENCES products(product_id),
    quantity INTEGER NOT NULL,              -- original purchased quantity
    remaining_quantity INTEGER NOT NULL,    -- decreases as sales consume this batch
    unit_price NUMERIC(12, 2) NOT NULL,     -- purchase price per unit
    purchase_timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


--Avoids full table scans on every sale event).
CREATE INDEX IF NOT EXISTS idx_batches_fifo
    ON inventory_batches (product_id, purchase_timestamp ASC)
    WHERE remaining_quantity > 0;


-- 3. Sales table
-- Every "sale" event creates one row here, with cost computed from FIFO batches.
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL REFERENCES products(product_id),
    quantity INTEGER NOT NULL,              -- quantity sold
    total_cost NUMERIC(12, 2) NOT NULL,     -- sum of (consumed_qty * batch_unit_price)
    sale_timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Users table (basic auth for login page)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);