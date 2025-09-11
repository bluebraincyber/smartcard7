-- =====================================================
-- SMARTCARD7 DATABASE SCHEMA
-- PostgreSQL 13+ Compatible
-- Multi-tenant SaaS for Digital Menus
-- =====================================================

BEGIN;

-- =====================================================
-- AUTHENTICATION TABLES (NextAuth.js)
-- =====================================================

-- Users table - Core user accounts
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  name            TEXT,
  email           TEXT UNIQUE NOT NULL,
  emailverified   TIMESTAMP,
  image           TEXT,
  password_hash   TEXT,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- OAuth accounts (Google, GitHub, etc.)
CREATE TABLE accounts (
  id                  SERIAL PRIMARY KEY,
  userid              INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                TEXT NOT NULL,
  provider            TEXT NOT NULL,
  provideraccountid   TEXT NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          BIGINT,
  token_type          TEXT,
  scope               TEXT,
  id_token            TEXT,
  session_state       TEXT,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW(),
  UNIQUE (provider, provideraccountid)
);

-- User sessions
CREATE TABLE sessions (
  id              SERIAL PRIMARY KEY,
  sessiontoken    TEXT UNIQUE NOT NULL,
  userid          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires         TIMESTAMP NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Email verification tokens
CREATE TABLE verification_token (
  identifier      TEXT NOT NULL,
  token           TEXT NOT NULL,
  expires         TIMESTAMP NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (identifier, token)
);

-- =====================================================
-- CORE APPLICATION TABLES
-- =====================================================

-- Stores (Multi-tenant root entity)
CREATE TABLE stores (
  id              SERIAL PRIMARY KEY,
  userid          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  slug            TEXT NOT NULL UNIQUE,
  logo            TEXT,
  coverimage      TEXT,
  whatsapp        TEXT,
  address         TEXT,
  business_type   TEXT DEFAULT 'general' CHECK (business_type IN ('restaurant', 'retail', 'service', 'general')),
  requires_address BOOLEAN DEFAULT FALSE,
  primary_color   TEXT DEFAULT '#EA1D2C',
  isactive        BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_slug CHECK (slug ~* '^[a-z0-9-]+$'),
  CONSTRAINT valid_color CHECK (primary_color ~* '^#[0-9A-Fa-f]{6}$')
);

-- Categories within stores
CREATE TABLE categories (
  id              SERIAL PRIMARY KEY,
  storeid         INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  position        INTEGER DEFAULT 0,
  isactive        BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  
  -- Ensure position uniqueness within store
  UNIQUE (storeid, position)
);

-- Items/Products within categories
CREATE TABLE items (
  id              SERIAL PRIMARY KEY,
  storeid         INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  categoryid      INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  price_cents     INTEGER NOT NULL CHECK (price_cents >= 0),
  image           TEXT,
  isfeatured      BOOLEAN DEFAULT FALSE,
  isarchived      BOOLEAN DEFAULT FALSE,
  isactive        BOOLEAN DEFAULT TRUE,
  position        INTEGER DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  
  -- Business rules
  CONSTRAINT valid_price CHECK (price_cents BETWEEN 0 AND 999999999), -- Max R$ 9.999.999,99
  CONSTRAINT archived_not_active CHECK (NOT (isarchived = TRUE AND isactive = TRUE))
);

-- =====================================================
-- AUDIT AND LOGGING TABLES
-- =====================================================

-- Audit log for all mutations
CREATE TABLE audit_logs (
  id              SERIAL PRIMARY KEY,
  actor_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  entity_type     TEXT NOT NULL,
  entity_id       INTEGER NOT NULL,
  action          TEXT NOT NULL,
  details         JSONB,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_action CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'TOGGLE', 'UPLOAD'))
);

-- Store analytics (aggregated data)
CREATE TABLE store_analytics (
  id              SERIAL PRIMARY KEY,
  storeid         INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  page_views      INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  item_clicks     INTEGER DEFAULT 0,
  whatsapp_clicks INTEGER DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  
  UNIQUE (storeid, date)
);

-- =====================================================
-- FUTURE EXTENSIONS (Prepared structure)
-- =====================================================

-- Orders table (for future e-commerce features)
CREATE TABLE orders (
  id              SERIAL PRIMARY KEY,
  storeid         INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT,
  customer_email  TEXT,
  customer_address TEXT,
  total_cents     INTEGER NOT NULL CHECK (total_cents >= 0),
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Order items (for future e-commerce features)
CREATE TABLE order_items (
  id              SERIAL PRIMARY KEY,
  orderid         INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  itemid          INTEGER NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  total_cents     INTEGER NOT NULL CHECK (total_cents >= 0),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Authentication indexes
CREATE INDEX users_email_idx ON users (email);
CREATE INDEX accounts_userid_idx ON accounts (userid);
CREATE INDEX accounts_provider_idx ON accounts (provider, provideraccountid);
CREATE INDEX sessions_userid_idx ON sessions (userid);
CREATE INDEX sessions_token_idx ON sessions (sessiontoken);

-- Core application indexes
CREATE INDEX stores_userid_idx ON stores (userid);
CREATE INDEX stores_slug_idx ON stores (slug);
CREATE INDEX stores_active_idx ON stores (isactive) WHERE isactive = TRUE;

CREATE INDEX categories_storeid_idx ON categories (storeid);
CREATE INDEX categories_position_idx ON categories (storeid, position);
CREATE INDEX categories_active_idx ON categories (storeid, isactive) WHERE isactive = TRUE;

CREATE INDEX items_storeid_idx ON items (storeid);
CREATE INDEX items_categoryid_idx ON items (categoryid);
CREATE INDEX items_storeid_active_idx ON items (storeid, isactive) WHERE isactive = TRUE;
CREATE INDEX items_storeid_featured_idx ON items (storeid, isfeatured) WHERE isfeatured = TRUE;
CREATE INDEX items_storeid_created_idx ON items (storeid, created_at);
CREATE INDEX items_archived_idx ON items (isarchived) WHERE isarchived = FALSE;

-- Analytics indexes
CREATE INDEX audit_logs_actor_idx ON audit_logs (actor_id);
CREATE INDEX audit_logs_entity_idx ON audit_logs (entity_type, entity_id);
CREATE INDEX audit_logs_created_idx ON audit_logs (created_at);

CREATE INDEX store_analytics_storeid_idx ON store_analytics (storeid);
CREATE INDEX store_analytics_date_idx ON store_analytics (date);

-- Future e-commerce indexes
CREATE INDEX orders_storeid_idx ON orders (storeid);
CREATE INDEX orders_status_idx ON orders (status);
CREATE INDEX orders_created_idx ON orders (created_at);

CREATE INDEX order_items_orderid_idx ON order_items (orderid);
CREATE INDEX order_items_itemid_idx ON order_items (itemid);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_analytics_updated_at BEFORE UPDATE ON store_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =====================================================

-- Function to get store by slug (public access)
CREATE OR REPLACE FUNCTION get_store_by_slug(store_slug TEXT)
RETURNS TABLE (
    id INTEGER,
    name TEXT,
    description TEXT,
    logo TEXT,
    coverimage TEXT,
    whatsapp TEXT,
    address TEXT,
    business_type TEXT,
    primary_color TEXT,
    isactive BOOLEAN
) AS $
BEGIN
    RETURN QUERY
    SELECT s.id, s.name, s.description, s.logo, s.coverimage, 
           s.whatsapp, s.address, s.business_type, s.primary_color, s.isactive
    FROM stores s
    WHERE s.slug = store_slug AND s.isactive = TRUE;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get store items with categories (public access)
CREATE OR REPLACE FUNCTION get_store_menu(store_id INTEGER)
RETURNS TABLE (
    category_id INTEGER,
    category_name TEXT,
    category_description TEXT,
    category_position INTEGER,
    item_id INTEGER,
    item_name TEXT,
    item_description TEXT,
    item_price_cents INTEGER,
    item_image TEXT,
    item_isfeatured BOOLEAN,
    item_position INTEGER
) AS $
BEGIN
    RETURN QUERY
    SELECT c.id, c.name, c.description, c.position,
           i.id, i.name, i.description, i.price_cents, i.image, i.isfeatured, i.position
    FROM categories c
    LEFT JOIN items i ON c.id = i.categoryid AND i.isactive = TRUE AND i.isarchived = FALSE
    WHERE c.storeid = store_id AND c.isactive = TRUE
    ORDER BY c.position ASC, i.position ASC, i.created_at DESC;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_actor_id INTEGER,
    p_entity_type TEXT,
    p_entity_id INTEGER,
    p_action TEXT,
    p_details JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS INTEGER AS $
DECLARE
    audit_id INTEGER;
BEGIN
    INSERT INTO audit_logs (actor_id, entity_type, entity_id, action, details, ip_address, user_agent)
    VALUES (p_actor_id, p_entity_type, p_entity_id, p_action, p_details, p_ip_address, p_user_agent)
    RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for store summary with counts
CREATE VIEW store_summary AS
SELECT 
    s.id,
    s.userid,
    s.name,
    s.slug,
    s.description,
    s.logo,
    s.coverimage,
    s.whatsapp,
    s.address,
    s.business_type,
    s.primary_color,
    s.isactive,
    s.created_at,
    s.updated_at,
    COUNT(DISTINCT c.id) as categories_count,
    COUNT(DISTINCT CASE WHEN i.isactive = TRUE AND i.isarchived = FALSE THEN i.id END) as active_items_count,
    COUNT(DISTINCT CASE WHEN i.isfeatured = TRUE AND i.isactive = TRUE AND i.isarchived = FALSE THEN i.id END) as featured_items_count
FROM stores s
LEFT JOIN categories c ON s.id = c.storeid AND c.isactive = TRUE
LEFT JOIN items i ON c.id = i.categoryid
GROUP BY s.id, s.userid, s.name, s.slug, s.description, s.logo, s.coverimage, 
         s.whatsapp, s.address, s.business_type, s.primary_color, s.isactive, s.created_at, s.updated_at;

-- View for public store data (without sensitive info)
CREATE VIEW public_stores AS
SELECT 
    s.id,
    s.name,
    s.description,
    s.slug,
    s.logo,
    s.coverimage,
    s.whatsapp,
    s.address,
    s.business_type,
    s.primary_color,
    s.created_at
FROM stores s
WHERE s.isactive = TRUE;

-- =====================================================
-- SEED DATA FOR DEVELOPMENT
-- =====================================================

-- Insert default admin user (password: 'admin123' hashed with bcryptjs)
INSERT INTO users (name, email, password_hash)
VALUES ('Admin User', 'admin@smartcard7.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36vrQ8O5pO1MZ4dQfY2Kq6a')
ON CONFLICT (email) DO NOTHING;

-- Insert demo store
WITH demo_user AS (
    SELECT id FROM users WHERE email = 'admin@smartcard7.com' LIMIT 1
)
INSERT INTO stores (userid, name, slug, description, whatsapp, address, business_type, primary_color)
SELECT id, 'Restaurante Demo', 'restaurante-demo', 'Restaurante de demonstração do Smartcard7', 
       '+5511999999999', 'Rua das Flores, 123 - Centro', 'restaurant', '#EA1D2C'
FROM demo_user
ON CONFLICT (slug) DO NOTHING;

-- Insert demo categories
WITH demo_store AS (
    SELECT id FROM stores WHERE slug = 'restaurante-demo' LIMIT 1
)
INSERT INTO categories (storeid, name, description, position)
SELECT id, 'Pratos Principais', 'Nossos pratos especiais', 1 FROM demo_store
UNION ALL
SELECT id, 'Bebidas', 'Bebidas geladas e quentes', 2 FROM demo_store
UNION ALL
SELECT id, 'Sobremesas', 'Doces e sobremesas artesanais', 3 FROM demo_store;

-- Insert demo items
WITH demo_data AS (
    SELECT s.id as store_id, c.id as category_id, c.name as category_name
    FROM stores s
    JOIN categories c ON s.id = c.storeid
    WHERE s.slug = 'restaurante-demo'
)
INSERT INTO items (storeid, categoryid, name, description, price_cents, isfeatured, position)
SELECT store_id, category_id, 'Feijoada Completa', 'Feijoada tradicional com acompanhamentos', 2490, true, 1
FROM demo_data WHERE category_name = 'Pratos Principais'
UNION ALL
SELECT store_id, category_id, 'Grelhado do Chef', 'Peixe grelhado com legumes', 3200, true, 2
FROM demo_data WHERE category_name = 'Pratos Principais'
UNION ALL
SELECT store_id, category_id, 'Suco Natural', 'Suco de frutas frescas 300ml', 800, false, 1
FROM demo_data WHERE category_name = 'Bebidas'
UNION ALL
SELECT store_id, category_id, 'Café Especial', 'Café gourmet coado na hora', 600, false, 2
FROM demo_data WHERE category_name = 'Bebidas'
UNION ALL
SELECT store_id, category_id, 'Pudim Caseiro', 'Pudim tradicional da casa', 1200, true, 1
FROM demo_data WHERE category_name = 'Sobremesas';

COMMIT;

-- =====================================================
-- PERFORMANCE ANALYSIS QUERIES
-- =====================================================

/*
-- Query para analisar performance de índices
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Query para identificar tabelas com muitas operações
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY (n_tup_ins + n_tup_upd + n_tup_del) DESC;

-- Query para verificar tamanho das tabelas
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
*/