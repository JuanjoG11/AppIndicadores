$ErrorActionPreference = "Stop"
Set-Location "C:\Users\Juanjo\Documents\AppIndicadores"
$output = & node "generar_informe_junio.mjs" 2>&1
$output | ForEach-Object { Write-Host $_ }
Write-Host "EXIT: $LASTEXITCODE"
