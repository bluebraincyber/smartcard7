BEGIN;

-- troque o hash por um bcrypt de verdade do seu ambiente
INSERT INTO users (name, email, password_hash)
VALUES ('Admin', 'admin@smartcard.local', '$2a$10$N1k1w6k3bY/EXEMPLOHASHxxxxxx')
ON CONFLICT (email) DO NOTHING;

INSERT INTO stores (userid, name, slug, description, active)
SELECT id, 'Minha Loja', 'minha-loja', 'Loja de exemplo', TRUE
FROM users WHERE email='admin@smartcard.local';

WITH s AS (SELECT id FROM stores WHERE slug='minha-loja' LIMIT 1)
INSERT INTO categories (storeid, name, description, position)
SELECT s.id, 'Bebidas', 'Bebidas geladas', 1 FROM s
UNION ALL
SELECT s.id, 'Lanches', 'Rápidos e saborosos', 2 FROM s;

WITH s AS (SELECT id FROM stores WHERE slug='minha-loja' LIMIT 1),
     c AS (SELECT id, name FROM categories WHERE storeid IN (SELECT id FROM s))
INSERT INTO items (storeid, categoryid, name, description, price_cents)
SELECT (SELECT id FROM s), c.id, 'Suco Natural', 'Copo 300ml', 899 FROM c WHERE c.name='Bebidas'
UNION ALL
SELECT (SELECT id FROM s), c.id, 'Hambúrguer', 'Carne + queijo', 2499 FROM c WHERE c.name='Lanches';

COMMIT;