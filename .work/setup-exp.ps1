$n = 'pgtap-exp125'
for ($i = 0; $i -lt 60; $i++) {
  $o = docker exec -e PGPASSWORD=pw $n psql -U supabase_admin -h localhost -d postgres -At -c "select 1" 2>$null
  if ($o -eq '1') { break }
  Start-Sleep 2
}
Start-Sleep 5
docker cp supabase/migrations "${n}:/tmp/m" | Out-Null
$p = @('exec','-e','PGPASSWORD=pw',$n,'psql','-U','supabase_admin','-h','localhost','-d','postgres','-q','-v','ON_ERROR_STOP=1')
& docker @p -c "alter table storage.buckets add column if not exists public boolean default false, add column if not exists file_size_limit bigint, add column if not exists allowed_mime_types text[]; alter table auth.users add column if not exists email_confirmed_at timestamptz, add column if not exists raw_user_meta_data jsonb, add column if not exists phone text; create extension if not exists pgtap"
foreach ($f in (Get-ChildItem supabase/migrations -Filter *.sql | Sort-Object Name)) {
  $out = & docker @p -f "/tmp/m/$($f.Name)" 2>&1
  if ($LASTEXITCODE -ne 0) { "FAIL $($f.Name): $out"; break }
}
"done"
