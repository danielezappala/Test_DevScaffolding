# Requirements Document - Barcode Scanning System

## Introduction

Il sistema di scansione barcode permette la gestione rapida di carichi e scarichi di vini tramite lettura del codice a barre presente sulle bottiglie. Il sistema deve supportare sia scanner hardware (USB/Bluetooth) che camera smartphone, utilizzando la stessa webapp responsive.

## Glossary

- **Barcode**: Codice a barre univoco che identifica un prodotto (EAN-13, Code128, etc.)
- **EAN-13**: Standard europeo per codici a barre (13 cifre)
- **Scanner Hardware**: Dispositivo fisico dedicato alla lettura barcode (USB o Bluetooth)
- **Camera Scanner**: Utilizzo della fotocamera smartphone/tablet per leggere barcode
- **PWA**: Progressive Web App - applicazione web installabile come app nativa
- **Quick Scan**: Modalità rapida di carico/scarico tramite scansione barcode
- **Wine**: Vino presente nell'inventario dell'enoteca
- **Movement**: Movimento di stock (carico/scarico) di un vino
- **System**: Il sistema di gestione enoteca

## Requirements

### Requirement 1: Gestione Barcode nel Database

**User Story:** Come gestore dell'enoteca, voglio associare un barcode a ogni vino, così da poterlo identificare rapidamente durante le operazioni di magazzino.

#### Acceptance Criteria

1. WHEN un vino viene creato o modificato THEN the System SHALL allow storing a barcode field with maximum 20 characters
2. WHEN a barcode is stored THEN the System SHALL validate it is not empty and contains only alphanumeric characters
3. WHEN a barcode is assigned to a wine THEN the System SHALL ensure the barcode is unique across all wines
4. WHEN a wine has no barcode THEN the System SHALL allow null values in the barcode field
5. WHEN searching wines THEN the System SHALL provide an index on the barcode field for fast lookups

### Requirement 2: Ricerca Vino per Barcode

**User Story:** Come operatore di magazzino, voglio cercare un vino scansionando il suo barcode, così da trovarlo immediatamente senza digitare il nome.

#### Acceptance Criteria

1. WHEN a barcode is provided THEN the System SHALL search for a wine with matching barcode
2. WHEN a matching wine is found THEN the System SHALL return complete wine information including name, vintage, type, quantity, and supplier
3. WHEN no matching wine is found THEN the System SHALL return a 404 error with message "Wine not found for barcode {barcode}"
4. WHEN the barcode parameter is empty THEN the System SHALL return a 400 error with message "Barcode is required"
5. WHEN multiple wines have the same barcode THEN the System SHALL return the first match and log a warning

### Requirement 3: Creazione Movimento da Barcode

**User Story:** Come operatore, voglio registrare un carico o scarico scansionando il barcode, così da velocizzare le operazioni quotidiane.

#### Acceptance Criteria

1. WHEN a barcode and movement type are provided THEN the System SHALL create a movement for the corresponding wine
2. WHEN creating a movement THEN the System SHALL require barcode, type (in/out), quantity, and unit fields
3. WHEN the wine is found THEN the System SHALL update the wine quantity according to movement type
4. WHEN movement type is "in" THEN the System SHALL increase wine quantity by the specified amount
5. WHEN movement type is "out" THEN the System SHALL decrease wine quantity by the specified amount
6. WHEN movement type is "out" and quantity exceeds available stock THEN the System SHALL return a 400 error
7. WHEN the movement is created THEN the System SHALL return the created movement with wine information

### Requirement 4: Scanner Hardware Support

**User Story:** Come operatore alla cassa, voglio usare uno scanner USB per registrare vendite rapidamente, così da servire i clienti velocemente.

#### Acceptance Criteria

1. WHEN a hardware scanner is connected THEN the System SHALL accept barcode input as keyboard input
2. WHEN a barcode is scanned THEN the System SHALL auto-submit the form on Enter key press
3. WHEN the input field receives focus THEN the System SHALL maintain focus for continuous scanning
4. WHEN a barcode is successfully processed THEN the System SHALL clear the input field and refocus it
5. WHEN running on desktop THEN the System SHALL display a hint about hardware scanner usage

### Requirement 5: Camera Scanner Support (Mobile)

**User Story:** Come operatore in cantina, voglio usare il mio smartphone per scansionare barcode durante l'inventario, così da non dover portare attrezzature aggiuntive.

#### Acceptance Criteria

1. WHEN accessing the app on mobile THEN the System SHALL detect device type and offer camera scanning
2. WHEN camera permission is granted THEN the System SHALL activate the device camera for barcode scanning
3. WHEN a barcode is detected in camera view THEN the System SHALL automatically process it without manual confirmation
4. WHEN a barcode is successfully scanned THEN the System SHALL provide haptic feedback (vibration) if supported
5. WHEN camera scanning fails THEN the System SHALL fallback to manual input mode
6. WHEN switching between camera and manual mode THEN the System SHALL preserve the current page state

### Requirement 6: Responsive UI per Quick Scan

**User Story:** Come operatore, voglio un'interfaccia che si adatti al dispositivo che sto usando, così da avere sempre la migliore esperienza d'uso.

#### Acceptance Criteria

1. WHEN accessing on desktop THEN the System SHALL display a full dashboard with sidebar and manual input optimized for hardware scanner
2. WHEN accessing on tablet THEN the System SHALL display a compact layout with toggle between camera and manual input
3. WHEN accessing on smartphone THEN the System SHALL display a fullscreen camera scanner with minimal UI
4. WHEN a wine is found THEN the System SHALL display wine details with quick action buttons for in/out movements
5. WHEN no wine is found THEN the System SHALL display an error message with option to retry or manual search

### Requirement 7: PWA Installation e Offline Support

**User Story:** Come operatore mobile, voglio installare l'app sul mio smartphone e usarla anche senza connessione, così da lavorare in cantina dove il segnale è debole.

#### Acceptance Criteria

1. WHEN accessing the webapp THEN the System SHALL be installable as PWA on home screen
2. WHEN installed as PWA THEN the System SHALL display app icon and splash screen
3. WHEN offline THEN the System SHALL cache essential pages and assets for basic functionality
4. WHEN offline THEN the System SHALL queue movements and sync when connection is restored
5. WHEN connection is restored THEN the System SHALL automatically sync queued operations

### Requirement 8: Gestione Vini Senza Barcode

**User Story:** Come gestore, voglio gestire anche vini artigianali senza barcode, così da non essere limitato solo ai vini commerciali.

#### Acceptance Criteria

1. WHEN a wine has no barcode THEN the System SHALL allow manual search by name
2. WHEN creating a wine without barcode THEN the System SHALL suggest generating an internal barcode
3. WHEN generating internal barcode THEN the System SHALL use format "INT{wine_id}" padded to 13 characters
4. WHEN displaying wine details THEN the System SHALL indicate if barcode is internal or external
5. WHEN searching by internal barcode THEN the System SHALL work identically to external barcodes

### Requirement 9: Validazione e Error Handling

**User Story:** Come operatore, voglio ricevere messaggi chiari quando qualcosa va storto, così da capire come risolvere il problema.

#### Acceptance Criteria

1. WHEN barcode format is invalid THEN the System SHALL display error "Invalid barcode format"
2. WHEN camera permission is denied THEN the System SHALL display error and instructions to enable it
3. WHEN network error occurs THEN the System SHALL display error and retry button
4. WHEN wine is out of stock THEN the System SHALL prevent scarico and display current quantity
5. WHEN operation succeeds THEN the System SHALL display success message with operation details

### Requirement 10: Performance e Usabilità

**User Story:** Come operatore, voglio che la scansione sia veloce e fluida, così da non perdere tempo durante le operazioni.

#### Acceptance Criteria

1. WHEN scanning with hardware scanner THEN the System SHALL process barcode in less than 500ms
2. WHEN scanning with camera THEN the System SHALL detect barcode in less than 2 seconds
3. WHEN displaying wine details THEN the System SHALL load data in less than 1 second
4. WHEN creating movement THEN the System SHALL complete operation in less than 1 second
5. WHEN multiple scans occur rapidly THEN the System SHALL queue them and process sequentially without errors
