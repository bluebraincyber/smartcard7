-- Migração para adicionar colunas ausentes na tabela stores
-- Execute este SQL no seu banco de dados

BEGIN;

-- Adicionar colunas que estão sendo usadas pela aplicação
ALTER TABLE stores ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'general';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS requires_address BOOLEAN DEFAULT FALSE;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#EA1D2C';

-- Verificar se as alterações foram aplicadas
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'stores' 
ORDER BY ordinal_position;

COMMIT;
