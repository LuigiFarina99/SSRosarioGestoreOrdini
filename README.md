# SSRosarioGestoreOrdini
Applicazione per la gestione degli ordini per le sagre parrocchiali

## Avvio durante la sagra (cassa/cucina/consegna su reti diverse)

Se cassa, cucina e tabellone consegne si collegano da hotspot/reti diverse (non la stessa rete Wi-Fi), non possono raggiungersi tra loro con un semplice indirizzo IP locale. Per questo il PC che fa da server espone l'app su un indirizzo pubblico temporaneo tramite [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/).

**Requisiti** (una tantum, già installati su questo PC): [Node.js](https://nodejs.org/) e `cloudflared` (installato con `winget install --id Cloudflare.cloudflared`).

**Ogni volta che si avvia la sagra, sul PC che fa da server:**

1. Fare doppio click su [avvia-sagra.bat](avvia-sagra.bat) nella cartella del progetto.
   (Si apre una finestra nera: è normale, va lasciata aperta per tutta la sagra.)
2. Attendere la scritta con l'indirizzo pubblico, del tipo:
   ```
   https://nome-a-caso.trycloudflare.com
   ```
3. Condividere quell'indirizzo (es. via WhatsApp o QR code) con tutte le postazioni. Ognuna apre nel browser:
   - Cassa: `https://nome-a-caso.trycloudflare.com/cassa.html`
   - Cucina/reparti: `https://nome-a-caso.trycloudflare.com/kds.html`
   - Tabellone consegne: `https://nome-a-caso.trycloudflare.com/consegna.html`

**Per fermare tutto a fine serata:** fare doppio click su [ferma-sagra.bat](ferma-sagra.bat). Ferma sia il server che il tunnel (in alternativa basta chiudere la finestra nera di `avvia-sagra.bat`).

**Note:**
- L'indirizzo è gratuito ma **casuale e temporaneo**: cambia ogni volta che si riavvia lo script, va quindi ridistribuito ad ogni riavvio.
- Il PC che esegue lo script deve restare acceso e connesso a internet per tutta la durata della sagra (funziona anche lui da un hotspot).
- Non serve aprire porte sul router o configurare il firewall: il tunnel funziona in uscita.
- `ferma-sagra.bat` chiude **tutti** i processi `node` e `cloudflared` attivi sul PC: se sul PC girano altre applicazioni Node.js contemporaneamente, verrebbero fermate anche quelle.

**Se preferisci avviarlo da PowerShell invece del doppio click:** Windows blocca di norma l'esecuzione degli script `.ps1` per sicurezza. Il file `avvia-sagra.bat` aggira il problema automaticamente; se vuoi comunque lanciare `avvia-sagra.ps1` direttamente da un terminale PowerShell, esegui prima una volta sola (per il tuo utente):
```
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```
