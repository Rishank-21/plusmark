$targets = Get-CimInstance Win32_Process | Where-Object {
  $_.CommandLine -match 'next\\dist\\bin\\next' -or
  $_.CommandLine -match 'next dev' -or
  $_.CommandLine -match 'next-server'
}
foreach ($t in $targets) {
  try { Stop-Process -Id $t.ProcessId -Force -ErrorAction Stop; Write-Output "stopped $($t.ProcessId)" } catch { }
}
Start-Sleep -Seconds 2
