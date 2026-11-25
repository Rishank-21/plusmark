Get-Content .work/record-migrations.sql -Raw | docker exec -i supabase_db_plusmark psql -U postgres -d postgres -v ON_ERROR_STOP=1
