-- docker/postgres-init.sql
DO
$$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'awladna_user') THEN
    CREATE USER awladna_user WITH PASSWORD 'StrongPassword123!';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'awladna') THEN
    CREATE DATABASE awladna OWNER awladna_user;
  END IF;
END
$$;
