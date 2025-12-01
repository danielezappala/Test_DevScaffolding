# Requisiti UI Generali

## Componenti Riutilizzabili

### Button
- Usare sempre il componente `Button` da `@/components/button`
- Varianti disponibili: `primary`, `secondary`, `outline`, `ghost`
- Dimensioni: `sm`, `md`, `lg`

### Badge
- Usare sempre il componente `Badge` da `@/components/badge`
- Varianti disponibili:
  - `success`: verde salvia (carico)
  - `warning`: terracotta (scarico)
  - `danger`: brick (errori/critici)
  - `info`: sage (informazioni)
  - `neutral`: taupe (stati neutri)
  - `outline`: outline grigio (descrittivi)
  - `wine-*`: colori specifici per tipi di vino

## Palette Colori

### Palette Terrosa
- `earth-teal`: #1a4d4d (carico)
- `earth-sage`: #7a9b9b (info/riepilogo)
- `earth-terracotta`: #c86428 (scarico)
- `earth-brick`: #b83c2f (errori)
- `earth-taupe`: #c9b5a0 (neutri)

### Colori Vini
- `wine-white`: giallo paglierino
- `wine-rose`: rosa salmone
- `wine-red`: rosso rubino
- `wine-sparkling`: oro pallido
- `wine-sweet`: ambrato
- `wine-fortified`: mogano

## Form e Validazione

### Pulsante Salva
- **REQUISITO**: Il pulsante "Salva" deve essere abilitato SOLO se:
  1. Ci sono modifiche rispetto ai dati iniziali
  2. I campi obbligatori sono compilati
  3. Non c'è un salvataggio in corso

### Implementazione
```typescript
// Rileva modifiche
const hasChanges = React.useMemo(() => {
  return Object.keys(formData).some(
    (key) => formData[key] !== initialFormData[key]
  );
}, [formData, initialFormData]);

// Disabilita pulsante
<Button
  type="submit"
  disabled={isPending || !hasChanges || !requiredFieldsFilled}
  variant="primary"
>
  {isPending ? "Salvataggio..." : "Salva"}
</Button>
```

## Tabelle

### Sorting
- Tutte le tabelle devono supportare l'ordinamento per colonna
- Usare il componente `DataTable` con `sortable: true`

### Azioni Inline
- Usare pulsanti inline per le operazioni principali
- `variant="ghost"` per azioni di visualizzazione
- `variant="outline"` per azioni di modifica
- `size="sm"` per non occupare troppo spazio

## Contrasto e Accessibilità
- Tutti i badge e pulsanti devono avere contrasto sufficiente
- Testo bianco su sfondi scuri
- Testo scuro su sfondi chiari
- Evitare colori troppo saturi o pastello

## Traduzione
- Tutti i testi devono essere in italiano
- "Warning" → "Attenzione"
- "Critical" → "Critico"
- "Save" → "Salva"
- "Cancel" → "Annulla"
