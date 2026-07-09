const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;
const FILE_DB = path.join(__dirname, 'ordini.json');

// Memoria temporanea del server
let ordiniInPreparazione = [];
let ordiniPronti = [];
let prossimoIdOrdine = 1;

// Calcola il prossimo id libero in base agli ordini gia' esistenti (dopo il caricamento da file)
function calcolaProssimoIdOrdine() {
    const idEsistenti = [...ordiniInPreparazione, ...ordiniPronti].map(o => o.id);
    return idEsistenti.length > 0 ? Math.max(...idEsistenti) + 1 : 1;
}

// Funzione per salvare lo stato corrente su file JSON (Anti-Crash)
function salvaSuFile() {
    const dati = {
        inPreparazione: ordiniInPreparazione,
        pronti: ordiniPronti
    };
    fs.writeFileSync(FILE_DB, JSON.stringify(dati, null, 2), 'utf8');
}

// Funzione per caricare i dati al riavvio del server
function caricaDaFile() {
    if (fs.existsSync(FILE_DB)) {
        try {
            const contenuto = fs.readFileSync(FILE_DB, 'utf8');
            const dati = JSON.parse(contenuto);
            ordiniInPreparazione = dati.inPreparazione || [];
            ordiniPronti = dati.pronti || [];
            console.log(`[DATABASE] Caricati con successo ${ordiniInPreparazione.length} ordini in preparazione e ${ordiniPronti.length} pronti.`);
        } catch (e) {
            console.log("[DATABASE] Errore nel caricamento del file di backup, avvio vuoto.", e);
        }
    }
}

// Inizializzazione server
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
caricaDaFile();
prossimoIdOrdine = calcolaProssimoIdOrdine();

// --- ROTTE API ---

// 1. Ricezione nuovo ordine dalla Cassa
app.post('/nuovo-ordine', (req, res) => {
    const nuovoOrdine = {
        id: prossimoIdOrdine++, // Generato dal server: garantisce id sempre univoci
        prodotti: req.body.prodotti,
        panini: req.body.panini || "",
        brace: req.body.brace || "",
        caciocavallo: req.body.caciocavallo || "",
        bevande: req.body.bevande || "",
        dolci: req.body.dolci || "",
        totaleEuro: req.body.totaleEuro,
        data: req.body.data,
        repartiPronti: [] // Inizialmente nessun reparto ha completato la sua parte
    };

    ordiniInPreparazione.push(nuovoOrdine);

    // Notifica i monitor dei reparti e il tabellone consegne
    io.emit('ordine-ricevuto', nuovoOrdine);

    salvaSuFile();
    res.json({ id: nuovoOrdine.id });
});

// 2. Gestione "Pronto" del singolo reparto (LA TUA ROTTA CORRETTA)
app.post('/ordine-pronto', (req, res) => {
    const { id, reparto } = req.body;
    
    let ordine = ordiniInPreparazione.find(o => o.id === parseInt(id));
    
    if (ordine) {
        if (!ordine.repartiPronti) {
            ordine.repartiPronti = [];
        }
        
        if (!ordine.repartiPronti.includes(reparto)) {
            ordine.repartiPronti.push(reparto);
        }
        
        // Dice alla cucina di nascondere l'ordine solo per quel reparto
        io.emit('rimuovi-ordine-schermo', { id: id, reparto: reparto });
        
        // Controlla quali reparti hanno effettivamente del cibo/bevande in questo ordine
        let repartiDaCompletare = [];
        if (ordine.panini && ordine.panini.trim() !== "") repartiDaCompletare.push('panini');
        if (ordine.brace && ordine.brace.trim() !== "") repartiDaCompletare.push('brace');
        if (ordine.caciocavallo && ordine.caciocavallo.trim() !== "") repartiDaCompletare.push('caciocavallo');
        if (ordine.bevande && ordine.bevande.trim() !== "") repartiDaCompletare.push('bevande');
        if (ordine.dolci && ordine.dolci.trim() !== "") repartiDaCompletare.push('dolci');
        
        // Passa a pronti solo se TUTTI i reparti coinvolti hanno cliccato "PRONTO"
        let tuttiPronti = repartiDaCompletare.every(rep => ordine.repartiPronti.includes(rep));
        
        if (tuttiPronti) {
            ordiniInPreparazione = ordiniInPreparazione.filter(o => o.id !== parseInt(id));
            ordiniPronti.push(ordine);

            // Sposta l'ordine a destra sul tabellone delle consegne
            io.emit('ordine-completato', id);
        }

        // Salva sempre, anche se e' pronto solo un reparto: altrimenti un riavvio
        // del server nel mezzo perderebbe il progresso parziale gia' segnalato
        salvaSuFile();
    }
    res.sendStatus(200);
});

// 3. Archiviazione dell'ordine (quando il cliente ritira il vassoio)
app.post('/ordine-archiviato', (req, res) => {
    const id = parseInt(req.body.id);
    // Rimuoviamo l'ordine dalla lista dei pronti visibili, ma lo lasciamo salvato nel file per l'incasso
    ordiniPronti = ordiniPronti.filter(o => o.id !== id);
    salvaSuFile();
    res.sendStatus(200);
});


// --- CONNESSIONI SOCKET.IO (Sincronizzazione Real-Time) ---
io.on('connection', (socket) => {
    // Sincronizza i monitor della cucina quando si collegano o aggiornano (F5)
    socket.emit('carica-ordini-attivi', ordiniInPreparazione);
    
    // Sincronizza il tabellone consegne (consegna.html) e ricalcola l'incasso della serata
    socket.emit('sincronizza-consegna', {
        inPreparazione: ordiniInPreparazione,
        pronti: ordiniPronti
    });
});

// Avvio effettivo del Server
server.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 SERVIZIO SAGRA ATTIVO SULLA PORTA ${PORT}`);
    console.log(`💻 Cassa principale: http://localhost:${PORT}/cassa.html`);
    console.log(`📺 Tabellone Consegne: http://localhost:${PORT}/consegna.html`);
    console.log(`📱 Monitor Reparti Cucina: http://localhost:${PORT}/cucina.html`);
    console.log(`==================================================\n`);
});
