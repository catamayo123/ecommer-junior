# setup.ps1 - Crea BD y usuario para el proyecto
# Uso: .\setup.ps1

# Leer variables del .dev.env
$envVars = @{}
Get-Content ".dev.env" | ForEach-Object {
    if ($_ -match "^\s*([^#=]+)=(.*)") {
        $envVars[$matches[1]] = $matches[2].Trim()
    }
}

$dbUser = $envVars["DB_USERNAME"]
$dbPass = $envVars["DB_PASSWORD"]
$dbName = $envVars["DB_NAME"]

Write-Host "Creando usuario '$dbUser' y BD '$dbName'..." -ForegroundColor Cyan

# Usar PGPASSWORD del entorno si ya existe (no interactivo)
if (-not $env:PGPASSWORD) {
    $pgPassword = Read-Host "Contrasena del superusuario postgres" -AsSecureString
    $cred = New-Object System.Management.Automation.PSCredential ("postgres", $pgPassword)
    $env:PGPASSWORD = $cred.GetNetworkCredential().Password
}

# Generar SQL en un archivo temporal
$tempSql = [System.IO.Path]::GetTempFileName() + ".sql"

@"
-- Script generado por setup.ps1
CREATE ROLE $dbUser WITH LOGIN PASSWORD '$dbPass';
CREATE DATABASE $dbName OWNER $dbUser;
GRANT ALL PRIVILEGES ON DATABASE $dbName TO $dbUser;
"@ | Out-File -FilePath $tempSql -Encoding ASCII

& "C:\Program Files\Instaladores\PostgreSQL\15\bin\psql.exe" -U postgres -f $tempSql 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Base de datos '$dbName' y usuario '$dbUser' creados correctamente." -ForegroundColor Green
} else {
    Write-Host "Se ignoran errores de 'ya existe'. Verifica con: psql -U postgres -l" -ForegroundColor Yellow
}

Remove-Item -LiteralPath $tempSql -Force
$env:PGPASSWORD = $null
