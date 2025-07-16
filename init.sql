-- ./init.sql
CREATE DATABASE awladna;
CREATE USER awladna_user WITH PASSWORD 'awladna_password';
GRANT ALL PRIVILEGES ON DATABASE awladna TO awladna_user;
GRANT USAGE ON SCHEMA public TO awladna_user;
GRANT CREATE ON SCHEMA public TO awladna_user;
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);