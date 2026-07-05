# Installazione

Cosa serve installare su un PC nuovo prima di poter usare l'applicazione.

## 1. Node.js (obbligatorio)

Esegue il server dell'applicazione.

- Windows con winget:
  ```
  winget install --id OpenJS.NodeJS.LTS -e
  ```
- In alternativa, scaricare l'installer da https://nodejs.org/ (versione LTS).
- Verifica installazione:
  ```
  node --version
  npm --version
  ```

## 2. Dipendenze del progetto (obbligatorio)

Dalla cartella del progetto:
```
npm install
```
Installa `express` e `socket.io` (elencate in [package.json](package.json)), scaricandole nella cartella `node_modules` (non versionata su Git).

## 3. cloudflared (necessario solo se cassa/cucina/consegna sono su reti/hotspot diversi)

Serve per esporre il server con un indirizzo pubblico temporaneo, vedi [README.md](README.md).

- Windows con winget:
  ```
  winget install --id Cloudflare.cloudflared -e
  ```
- In alternativa, scaricare l'eseguibile da https://github.com/cloudflare/cloudflared/releases
- Verifica installazione:
  ```
  cloudflared --version
  ```

Se invece tutte le postazioni sono sulla stessa rete Wi-Fi, questo passaggio non serve: basta avviare il server con `node server.js` e collegarsi all'indirizzo IP locale del PC sulla porta 3000.

## Avvio dell'applicazione

- Stessa rete per tutti: `node server.js`, poi collegarsi a `http://<ip-locale-del-pc>:3000/cassa.html` (e `kds.html`, `consegna.html`) da ogni dispositivo.
- Reti/hotspot diversi: eseguire `.\avvia-sagra.ps1` e seguire le istruzioni nel [README.md](README.md).
