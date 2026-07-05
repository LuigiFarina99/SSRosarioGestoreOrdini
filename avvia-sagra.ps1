param()

$ErrorActionPreference = "Stop"

# Assicura che il PATH veda cloudflared anche se installato di recente in questa sessione
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "==================================================" -ForegroundColor Yellow
Write-Host " Avvio Gestore Ordini Sagra" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow

$server = Start-Process -FilePath "node" -ArgumentList "server.js" -PassThru -NoNewWindow

try {
    Start-Sleep -Seconds 2
    Write-Host ""
    Write-Host "Avvio tunnel pubblico (Cloudflare)..." -ForegroundColor Cyan
    Write-Host "Attendere qualche secondo: gli indirizzi da condividere appariranno qui sotto." -ForegroundColor Cyan
    Write-Host ""

    # cloudflared scrive i log normali su stderr: non deve essere trattato come un errore fatale
    $ErrorActionPreference = "Continue"
    $urlMostrato = $false

    cloudflared tunnel --url http://localhost:3000 2>&1 | ForEach-Object {
        $riga = $_.ToString()
        Write-Host $riga

        if (-not $urlMostrato -and $riga -match "(https://[a-zA-Z0-9\-]+\.trycloudflare\.com)") {
            $baseUrl = $Matches[1]
            $urlMostrato = $true
            Write-Host ""
            Write-Host "==================================================================" -ForegroundColor Green
            Write-Host " INDIRIZZI PUBBLICI DA CONDIVIDERE CON LE POSTAZIONI:" -ForegroundColor Green
            Write-Host " Cassa:         $baseUrl/cassa.html" -ForegroundColor Green
            Write-Host " Cucina (KDS):  $baseUrl/cucina.html" -ForegroundColor Green
            Write-Host " Consegne:      $baseUrl/consegna.html" -ForegroundColor Green
            Write-Host "==================================================================" -ForegroundColor Green
            Write-Host ""
        }
    }
}
finally {
    Write-Host ""
    Write-Host "Chiusura server..." -ForegroundColor Yellow
    Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
}
