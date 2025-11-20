# Linee guida UI/UX – Gestionale Magazzino Vino

## 1. Principi operativi
- Navigazione piatta: max 2 clic dalle funzioni principali (Inventario, Carico/Scarico, Ordini, Fornitori, Lotti/Annate).
- Ricerca omnipresente con suggerimenti live (vino, annata, fornitore, movimento, ordine).
- Input critici con validation inline; bottoni distinti per Salva, Elimina, Scarica a magazzino; conferme solo dove servono.
- Progressive disclosure: prima dati essenziali, approfondimenti via slide-over/drawer (schede vino, fornitori, movimenti).

## 2. Visual design
- Palette calda e piatta:
  - Primario: Bordeaux/Chianti `#6B0F1A`–`#7A1C24`
  - Secondario: Oro/Champagne `#C9A66B`–`#E9DDB5`
  - Neutri: grigi caldi `#F5F4F2`, `#D9D6D0`, `#7A7974`
  - Uso: primario per call-to-action principali; secondario per badge/highlight; neutri per fondi e separatori.
- Tipografia: titoli e UI sans lineare (Inter/Helvetica). 8pt grid, spaziature generose e gerarchie nette.
- Icone lineari morbide (Feather/Heroicons): bottiglia, cassa, cantina, annata, ordine, fornitore, lotto.

## 3. Componenti chiave
- Dashboard operativa: stock critici (semafori), ultimi movimenti, alert annate da ruotare, ordini in arrivo, rischi out-of-stock.
- Inventario smart: mini immagine, nome/denominazione/annata, qty disponibili e in arrivo, soglia minima, semafori (verde/giallo/rosso), filtri rapidi (denominazione, regione, annata, fornitore), ordinamenti (disponibilità, prezzo, categoria).
- Scheda vino (drawer): foto grande, proprietà (annata, vitigno, gradazione…), storico movimenti, mini line chart stock, pulsanti Carico/Scarico/Modifica/Ordine.
- Movimenti: modulo con shortcut (+6 bottiglie), autocomplete lotti, suggerimenti su annate esistenti; barcode opzionale.

## 4. IA e navigazione
- Menu semplice: Dashboard, Inventario, Movimenti, Ordini, Fornitori, Reportistica.
- Breadcrumb sempre visibili; ricerca globale sempre accessibile.
- Accesso rapido: bottoni/CTA per Carico, Scarico, Nuovo ordine, Nuovo fornitore; link diretti a lotti/annate.

## 5. Microinterazioni e feedback
- Animazioni leggere su cambio pagina e apertura drawer; skeleton/spinner per caricamenti.
- Evidenziazione campi modificati; toast discreti (es. “Carico registrato”).
- Focus state visibili; contrasto AA minimo; non affidarsi solo al colore per stato.

## 6. Responsive
- Desktop ottimizzato (uso da postazione fissa); mobile/tablet per operatore in magazzino con tasti ampi e funzioni chiave semplificate.

## 7. Workflow consigliati
- Nuova referenza: wizard 3 step (info vino → prezzo → disponibilità iniziale), drag&drop etichetta, suggerimenti categoria automatici.
- Carico/Scarico veloce: ricerca in 3 lettere, barcode opzionale, shortcut anomalie (rotture, inventario manuale).
- Esporta PDF/Excel; vista griglia per sommelier; cronologia utente filtrabile; dark mode stile cantina (opzionale).

## 8. Pattern di sicurezza/errore
- Conferme contestuali solo per operazioni destructive (elimina, scarico massivo).
- Messaggi chiari per quantità/lotti/annate invalidi, con suggerimento di correzione immediata.
