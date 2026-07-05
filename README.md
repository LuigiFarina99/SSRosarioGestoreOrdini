# SSRosarioGestoreOrdini
Applicazione per la gestione degli ordini per le sagre parrocchiali

## Avvio durante la sagra (cassa/cucina/consegna su reti diverse)

Se cassa, cucina e tabellone consegne si collegano da hotspot/reti diverse (non la stessa rete Wi-Fi), non possono raggiungersi tra loro con un semplice indirizzo IP locale. Per questo il PC che fa da server espone l'app su un indirizzo pubblico temporaneo tramite [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/).

**Requisiti** (una tantum, già installati su questo PC): [Node.js](https://nodejs.org/) e `cloudflared` (installato con `winget install --id Cloudflare.cloudflared`).

**Ogni volta che si avvia la sagra:**

1. Aprire PowerShell nella cartella del progetto ed eseguire:
   ```
   .\avvia-sagra.ps1
   ```
2. Attendere la scritta con l'indirizzo pubblico, del tipo:
   ```
   https://nome-a-caso.trycloudflare.com
   ```
3. Condividere quell'indirizzo (es. via WhatsApp o QR code) con tutte le postazioni. Ognuna apre nel browser:
   - Cassa: `https://nome-a-caso.trycloudflare.com/cassa.html`
   - Cucina/reparti: `https://nome-a-caso.trycloudflare.com/kds.html`
   - Tabellone consegne: `https://nome-a-caso.trycloudflare.com/consegna.html`

**Note:**
- L'indirizzo è gratuito ma **casuale e temporaneo**: cambia ogni volta che si riavvia lo script, va quindi ridistribuito ad ogni riavvio.
- Il PC che esegue lo script deve restare acceso e connesso a internet per tutta la durata della sagra (funziona anche lui da un hotspot).
- Non serve aprire porte sul router o configurare il firewall: il tunnel funziona in uscita.
- Per chiudere tutto, premere `Ctrl+C` nella finestra PowerShell: verranno fermati sia il server che il tunnel.
