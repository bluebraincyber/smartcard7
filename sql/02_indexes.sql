BEGIN;

-- nextauth
CREATE INDEX IF NOT EXISTS idx_accounts_userid        ON accounts (userid);
CREATE INDEX IF NOT EXISTS idx_sessions_userid        ON sessions (userid);
CREATE INDEX IF NOT EXISTS idx_sessions_expires       ON sessions (expires);
CREATE INDEX IF NOT EXISTS idx_verify_expires         ON verification_token (expires);
CREATE INDEX IF NOT EXISTS idx_users_email            ON users (email);

-- app
CREATE INDEX IF NOT EXISTS idx_stores_userid          ON stores (userid);
CREATE INDEX IF NOT EXISTS idx_stores_slug            ON stores (slug);
CREATE INDEX IF NOT EXISTS idx_categories_storeid     ON categories (storeid);
CREATE INDEX IF NOT EXISTS idx_items_storeid          ON items (storeid);
CREATE INDEX IF NOT EXISTS idx_items_categoryid       ON items (categoryid);
CREATE INDEX IF NOT EXISTS idx_items_isarchived       ON items (isarchived);

COMMIT;