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
    Write-Host "L'indirizzo da condividere con cassa/cucina/consegna apparira' qui sotto (riga https://...trycloudflare.com)." -ForegroundColor Cyan
    Write-Host "Ogni postazione dovra' aprire quell'indirizzo seguito da /cassa.html, /kds.html oppure /consegna.html" -ForegroundColor Cyan
    Write-Host ""
    # cloudflared scrive i log normali su stderr: non deve essere trattato come un errore fatale
    $ErrorActionPreference = "Continue"
    cloudflared tunnel --url http://localhost:3000
}
finally {
    Write-Host ""
    Write-Host "Chiusura server..." -ForegroundColor Yellow
    Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
}
