-- PostgreSQL initialization script for test-devscaffolding
-- This script runs automatically when the database is first created

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create additional schemas if needed
-- CREATE SCHEMA IF NOT EXISTS app;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "test-devscaffolding_user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO "test-devscaffolding_user";

-- Configure database settings for optimal performance
ALTER DATABASE "test-devscaffolding_db" SET timezone TO 'UTC';
ALTER DATABASE "test-devscaffolding_db" SET log_statement TO 'mod';
ALTER DATABASE "test-devscaffolding_db" SET log_min_duration_statement TO 1000;

-- Create a health check function
CREATE OR REPLACE FUNCTION public.health_check()
RETURNS TABLE(status text, check_time timestamptz) AS $$
BEGIN
    RETURN QUERY SELECT 'healthy'::text, now();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.health_check() IS 'Health check function for monitoring';

-- Log initialization completion
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed for test-devscaffolding';
END $$;
