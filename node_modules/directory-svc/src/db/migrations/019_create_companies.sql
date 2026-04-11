CREATE TABLE IF NOT EXISTS companies (
  company_key VARCHAR(20) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  legal_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO companies (company_key, name, legal_name)
VALUES
  (
    'ESL',
    'ESL',
    'Express Shipping and Logistics (E.A) Limited'
  ),
  (
    'EFL',
    'ESL Forwarders',
    'ESL Forwarders Limited'
  ),
  (
    'SLL',
    'Sovereign Logistics',
    'Sovereign Logistics Limited'
  )
ON CONFLICT (company_key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_companies_status
  ON companies(status);

CREATE INDEX IF NOT EXISTS idx_companies_name
  ON companies(name);
