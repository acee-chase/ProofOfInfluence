-- Migration script for UserVault & TestRuns tables
-- Run this manually if drizzle-kit push fails
-- Execute: psql $DATABASE_URL -f scripts/migrate-user-vault-tables.sql

-- UserVault tables
CREATE TABLE IF NOT EXISTS user_vaults (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL DEFAULT 'demo',
  label VARCHAR(255),
  metadata JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS user_vaults_owner_idx ON user_vaults(owner_user_id);
CREATE INDEX IF NOT EXISTS user_vaults_type_idx ON user_vaults(type);
CREATE INDEX IF NOT EXISTS user_vaults_status_idx ON user_vaults(status);

CREATE TABLE IF NOT EXISTS vault_wallets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id TEXT NOT NULL REFERENCES user_vaults(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  chain_id INTEGER NOT NULL DEFAULT 84532,
  network VARCHAR(50) NOT NULL DEFAULT 'base-sepolia',
  role VARCHAR(20) NOT NULL DEFAULT 'nft',
  status VARCHAR(20) NOT NULL DEFAULT 'idle',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  last_used_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS vault_wallets_vault_id_idx ON vault_wallets(vault_id);
CREATE INDEX IF NOT EXISTS vault_wallets_address_idx ON vault_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS vault_wallets_chain_id_idx ON vault_wallets(chain_id);

CREATE TABLE IF NOT EXISTS agents (
  id VARCHAR(100) PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  wallet_address VARCHAR(42),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS vault_agent_permissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id TEXT NOT NULL REFERENCES user_vaults(id) ON DELETE CASCADE,
  agent_id VARCHAR(100) NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  scopes JSONB NOT NULL,
  constraints JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL,
  UNIQUE(vault_id, agent_id)
);

CREATE INDEX IF NOT EXISTS vault_agent_permissions_vault_id_idx ON vault_agent_permissions(vault_id);
CREATE INDEX IF NOT EXISTS vault_agent_permissions_agent_id_idx ON vault_agent_permissions(agent_id);
CREATE INDEX IF NOT EXISTS vault_agent_permissions_status_idx ON vault_agent_permissions(status);

CREATE TABLE IF NOT EXISTS test_runs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_key VARCHAR(100) NOT NULL,
  demo_user_id TEXT,
  vault_id TEXT REFERENCES user_vaults(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL,
  result JSONB,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS test_runs_scenario_key_idx ON test_runs(scenario_key);
CREATE INDEX IF NOT EXISTS test_runs_demo_user_id_idx ON test_runs(demo_user_id);
CREATE INDEX IF NOT EXISTS test_runs_status_idx ON test_runs(status);

CREATE TABLE IF NOT EXISTS test_steps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  input JSONB,
  output JSONB,
  error JSONB,
  created_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS test_steps_run_id_idx ON test_steps(run_id);
CREATE INDEX IF NOT EXISTS test_steps_status_idx ON test_steps(status);

-- Insert default immortality-ai agent
INSERT INTO agents (id, type, name) 
VALUES ('immortality-ai', 'user', 'Immortality AI')
ON CONFLICT (id) DO NOTHING;
