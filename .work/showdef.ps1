param([string]$Sig, [string]$Pattern = '(, ''\{)|(\"[a-z_]+\":\{)|invalid\(|raise_error|enum')
$def = "select pg_get_functiondef('$Sig'::regprocedure)" | docker exec -i supabase_db_plusmark psql -U postgres -At
$def | Select-String -Pattern $Pattern | ForEach-Object { $t = $_.Line.Trim(); $t.Substring(0, [Math]::Min(230, $t.Length)) }
