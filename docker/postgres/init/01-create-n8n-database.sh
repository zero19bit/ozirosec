#!/bin/sh
set -eu

# Executed only when PostgreSQL initializes a new empty data volume.
psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --set ON_ERROR_STOP=1 \
  --set=n8n_database="$POSTGRES_N8N_DB" --set=n8n_user="$POSTGRES_N8N_USER" \
  --set=n8n_password="$POSTGRES_N8N_PASSWORD" <<-'EOSQL'
  CREATE USER :"n8n_user" WITH PASSWORD :'n8n_password';
  CREATE DATABASE :"n8n_database" OWNER :"n8n_user";
  REVOKE ALL ON DATABASE :"n8n_database" FROM :"n8n_user";
EOSQL
