param([string[]]$Tables)
foreach ($t in $Tables) {
  $sch, $name = $t -split '\.'
  "== $t"
  "select column_name||' '||data_type||case when is_nullable='NO' and column_default is null then ' NOT NULL' else '' end from information_schema.columns where table_schema='$sch' and table_name='$name' order by ordinal_position" | docker exec -i supabase_db_plusmark psql -U postgres -At | ForEach-Object { $_ } | Join-String -Separator '; '
}
