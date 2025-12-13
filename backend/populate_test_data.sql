-- Popola database con dati di test per API Inventario Vini
-- Esegui con: psql -U postgres -h localhost -p 5432 -d eno_inventory_db -f populate_test_data.sql

BEGIN;

-- Pulisci dati esistenti (opzionale)
TRUNCATE TABLE stock_movements, wines, suppliers RESTART IDENTITY CASCADE;

-- Inserisci fornitori
INSERT INTO suppliers (name, contact_email, phone, address, vat_number, created_at, updated_at) VALUES
('Cantina Sociale di Alba', 'info@cantinaalba.it', '+39 0173 123456', 'Via Roma 1, 12051 Alba (CN)', 'IT12345678901', NOW(), NOW()),
('Tenuta di Montalcino', 'info@montalcino.it', '+39 0577 654321', 'Località Montalcino, 53024 Montalcino (SI)', 'IT98765432109', NOW(), NOW()),
('Azienda Vinicola Gavi', 'info@gavi.it', NULL, NULL, NULL, NOW(), NOW());

-- Inserisci vini
INSERT INTO wines (name, vintage, type, denomination, price, quantity, threshold, barcode, supplier_id, notes, created_at, updated_at) VALUES
-- Vini rossi
('Barolo DOCG Riserva', 2018, 'RED', 'DOCG', 45.50, 18, 10, '8001234567890', 1, 'Invecchiato 5 anni in botte', NOW(), NOW()),
('Brunello di Montalcino DOCG', 2017, 'RED', 'DOCG', 55.00, 12, 8, NULL, 2, NULL, NOW(), NOW()),
('Barbaresco DOCG', 2019, 'RED', 'DOCG', 42.00, 18, 12, NULL, 1, NULL, NOW(), NOW()),
-- Vini bianchi
('Gavi DOCG', 2022, 'WHITE', 'DOCG', 18.00, 36, 15, NULL, 3, NULL, NOW(), NOW()),
('Vermentino di Gallura DOCG', 2023, 'WHITE', 'DOCG', 16.50, 48, 20, NULL, NULL, NULL, NOW(), NOW()),
-- Vini rosati e spumanti
('Chiaretto DOC', 2023, 'ROSE', 'DOC', 12.50, 30, 18, NULL, NULL, NULL, NOW(), NOW()),
('Franciacorta DOCG Brut', 2020, 'SPARKLING', 'DOCG', 28.00, 15, 10, NULL, NULL, NULL, NOW(), NOW()),
-- Vini per test critical
('Vino Sotto Soglia', 2021, 'RED', NULL, 20.00, 3, 15, NULL, NULL, NULL, NOW(), NOW()),
('Vino Esaurito', 2020, 'WHITE', NULL, 25.00, 0, 10, NULL, NULL, NULL, NOW(), NOW());

-- Inserisci movimenti
INSERT INTO stock_movements (wine_id, type, quantity, note, reference, timestamp) VALUES
-- Carichi iniziali
(1, 'IN', 24, 'Carico iniziale', 'ORD-2024-001', NOW() - INTERVAL '30 days'),
(2, 'IN', 12, 'Carico iniziale', 'ORD-2024-002', NOW() - INTERVAL '28 days'),
(3, 'IN', 18, 'Carico iniziale', NULL, NOW() - INTERVAL '25 days'),
(4, 'IN', 36, 'Carico iniziale', NULL, NOW() - INTERVAL '20 days'),
(5, 'IN', 48, 'Carico iniziale', NULL, NOW() - INTERVAL '18 days'),
(6, 'IN', 30, 'Carico iniziale', NULL, NOW() - INTERVAL '15 days'),
(7, 'IN', 15, 'Carico iniziale', NULL, NOW() - INTERVAL '12 days'),
-- Scarichi (vendite)
(1, 'OUT', 6, 'Vendita ristorante', NULL, NOW() - INTERVAL '10 days'),
(4, 'OUT', 12, 'Vendita enoteca', NULL, NOW() - INTERVAL '8 days'),
(5, 'OUT', 24, 'Grande ordine', NULL, NOW() - INTERVAL '5 days'),
-- Movimenti recenti
(1, 'OUT', 3, 'Vendita al dettaglio', NULL, NOW() - INTERVAL '2 days'),
(2, 'IN', 6, 'Riassortimento', 'ORD-2024-010', NOW() - INTERVAL '1 day'),
(3, 'OUT', 2, 'Degustazione evento', NULL, NOW());

COMMIT;

-- Mostra statistiche
SELECT 'Fornitori creati:' as info, COUNT(*) as count FROM suppliers
UNION ALL
SELECT 'Vini creati:', COUNT(*) FROM wines
UNION ALL
SELECT 'Movimenti creati:', COUNT(*) FROM stock_movements
UNION ALL
SELECT 'Stock critici:', COUNT(*) FROM wines WHERE quantity <= threshold;

-- Mostra alcuni dati
SELECT '--- FORNITORI ---' as section;
SELECT id, name, contact_email FROM suppliers;

SELECT '--- VINI ---' as section;
SELECT id, name, vintage, type, quantity, threshold FROM wines ORDER BY id;

SELECT '--- STOCK CRITICI ---' as section;
SELECT id, name, vintage, quantity, threshold FROM wines WHERE quantity <= threshold;
