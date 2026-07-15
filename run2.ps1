Set-Location "C:\Users\Juanjo\Documents\AppIndicadores"
$p = Start-Process -FilePath "node" -ArgumentList "generar_informe_junio.mjs" -PassThru -Wait -RedirectStandardOutput "out.txt" -RedirectStandardError "err.txt" -NoNewWindow
Write-Host "Exit: $($p.ExitCode)"
if (Test-Path "out.txt") { Write-Host "STDOUT:"; Get-Content "out.txt" }
if (Test-Path "err.txt") { Write-Host "STDERR:"; Get-Content "err.txt" }
