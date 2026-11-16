CREATE TABLE IF NOT EXISTS visitors (
  id bigserial PRIMARY KEY,
  name varchar(50) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);