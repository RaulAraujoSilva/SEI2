-- Ensure UUID generation available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Set default UUIDs for primary keys
ALTER TABLE processos ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE protocolos ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE andamentos ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE observacoes ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE schedules ALTER COLUMN id SET DEFAULT gen_random_uuid();


