param([string]$f)
$shim = Get-Content .work/shim.sql -Raw
$body = (Get-Content "supabase/tests/$f" -Raw).Replace("BEGIN;", "BEGIN;`n" + $shim)
$o = $body | docker exec -i supabase_db_plusmark psql -U postgres -tA 2>&1 | Out-String
$l = @($o -split "`n")
for ($k = 0; $k -lt $l.Count; $k++) {
  if ($l[$k] -match 'ERROR' -and $l[$k] -notmatch 'aborted') { $l[[Math]::Max(0, $k - 3)..$k] | ForEach-Object { $_.Trim() }; break }
}
Write-Output "ok=$(@($l | Where-Object { $_ -match '^ok' }).Count) notok=$(@($l | Where-Object { $_ -match 'NOT OK' }).Count)"
