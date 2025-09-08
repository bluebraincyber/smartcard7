BEGIN;

-- ===== NEXTAUTH =====
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
  UNIQUE (provider, provideraccountid)
);

CREATE TABLE sessions (
  id              SERIAL PRIMARY KEY,
  sessiontoken    TEXT UNIQUE NOT NULL,
  userid          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires         TIMESTAMP NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE verification_token (
  identifier      TEXT NOT NULL,
  token           TEXT NOT NULL,
  expires         TIMESTAMP NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (identifier, token)
);

-- ===== APP =====
CREATE TABLE stores (
  id              SERIAL PRIMARY KEY,
  userid          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  slug            TEXT NOT NULL UNIQUE,
  logo            TEXT,
  coverimage      TEXT,
  active          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
  id              SERIAL PRIMARY KEY,
  storeid         INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  position        INTEGER DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE items (
  id              SERIAL PRIMARY KEY,
  storeid         INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  categoryid      INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  price_cents     INTEGER NOT NULL,
  image           TEXT,
  isfeatured      BOOLEAN DEFAULT FALSE,
  isarchived      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

COMMIT;