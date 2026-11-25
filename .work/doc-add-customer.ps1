$s = @{}; supabase status -o env 2>$null | ForEach-Object { if ($_ -match '^([A-Z_]+)="?(.*?)"?$') { $s[$Matches[1]] = $Matches[2] } }
$email = 'demo+hand1@plusmark.test'; $pw = 'Demo-Pass-2026!'
# 1. Auth user (service role, local script only)
$admin = @{ apikey = $s.SERVICE_ROLE_KEY; Authorization = "Bearer $($s.SERVICE_ROLE_KEY)" }
Invoke-RestMethod -Method Post "$($s.API_URL)/auth/v1/admin/users" -Headers $admin -ContentType 'application/json' `
  -Body (@{ email = $email; password = $pw; email_confirm = $true } | ConvertTo-Json) | Out-Null
# 2. Sign in as the customer; the Customer record is created on the first store call
$tok = Invoke-RestMethod -Method Post "$($s.API_URL)/auth/v1/token?grant_type=password" -Headers @{ apikey = $s.ANON_KEY } `
  -ContentType 'application/json' -Body (@{ email = $email; password = $pw } | ConvertTo-Json)
$h = @{ apikey = $s.ANON_KEY; Authorization = "Bearer $($tok.access_token)"; 'Content-Profile' = 'api' }
$rpc = { param($fn, $body) Invoke-RestMethod -Method Post "$($s.API_URL)/rest/v1/rpc/$fn" -Headers $h -ContentType 'application/json' -Body $body }
& $rpc 'store_update_customer' '{"p_profile": {"first_name": "Hand", "last_name": "Made", "phone": "+919800000077"}}' | Out-Null
& $rpc 'store_upsert_address' '{"p_address": {"first_name": "Hand", "last_name": "Made", "phone": "+919800000077", "address_1": "5 MG Road", "city": "Mumbai", "province": "Maharashtra", "postal_code": "400001", "country_code": "in", "is_default_shipping": true}}' | Out-Null
& $rpc 'store_set_marketing_consent' '{"p_granted": true, "p_channel": "email", "p_source": "manual"}' | Out-Null
(& $rpc 'store_get_customer' '{}').customer | Select-Object id, email, first_name, last_name
