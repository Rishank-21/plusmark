$n = 'pgtap-chk'
docker exec $n mkdir -p /tmp/t | Out-Null
docker cp supabase/tests "${n}:/tmp/t" | Out-Null
$res = @()
foreach ($f in (Get-ChildItem supabase/tests -Filter *.sql | Sort-Object Name)) {
  $o = docker exec -e PGPASSWORD=pw $n psql -U supabase_admin -h 127.0.0.1 -d postgres -X -At -v ON_ERROR_STOP=0 -f "/tmp/t/tests/$($f.Name)" 2>&1 | Out-String
  $ok = ([regex]::Matches($o, '(?m)^ok ')).Count
  $nok = ([regex]::Matches($o, '(?m)^not ok ')).Count
  $err = ([regex]::Matches($o, '(?m)ERROR:')).Count
  $plan = [regex]::Match($o, '(?m)^1\.\.(\d+)').Groups[1].Value
  $mis = if ($o -match 'planned to run|Looks like') { 'PLANMISMATCH' } else { '' }
  $res += "$($f.Name) plan=$plan ok=$ok notok=$nok err=$err $mis"
  if ($nok -gt 0 -or $err -gt 0 -or $mis) { $o | Out-File ".work/pgtap-out-$($f.BaseName).txt" -Encoding utf8 }
}
$res | Out-File .work/pgtap-summary.txt -Encoding utf8
"finished"

