param([string]$File, [int]$From, [int]$To, [string]$Pattern)
$l = Get-Content $File
$l[$From..$To] | Where-Object { $_ -match $Pattern } | ForEach-Object { $t = $_.Trim(); $t.Substring(0, [Math]::Min(200, $t.Length)) }
