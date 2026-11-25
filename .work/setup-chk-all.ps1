docker rm -f pgtap-chk 2>$null | Out-Null
docker run -d --name pgtap-chk -e POSTGRES_PASSWORD=pw public.ecr.aws/supabase/postgres:15.8.1.069
(Get-Content .work/setup-exp.ps1 -Raw).Replace("pgtap-exp125","pgtap-chk") | Set-Content .work/setup-chk.ps1
./.work/setup-chk.ps1
