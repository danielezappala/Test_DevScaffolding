#!/bin/bash

echo "🛑 Arresto di TUTTI i container Docker su TUTTI i profili Colima..."
echo "----------------------------------------------------------------"

# Funzione per fermare container in un contesto specifico
stop_containers_in_context() {
    local context=$1
    echo "🔍 Controllo contesto: $context"
    
    # Ottieni ID container in esecuzione per questo contesto
    local containers=$(docker --context "$context" ps -q)
    
    if [ -n "$containers" ]; then
        echo "   ⏳ Trovati container attivi. Arresto in corso..."
        docker --context "$context" stop $containers
        echo "   ✅ Container arrestati su $context."
    else
        echo "   ✨ Nessun container in esecuzione su $context."
    fi
    echo "----------------------------------------------------------------"
}

# 1. Ferma container sul contesto di default (quello attivo o docker desktop standard)
echo "👉 Controllo contesto DEFAULT/ATTIVO..."
stop_containers_in_context "default"

# 2. Trova tutti i contesti colima-* e itera
CONTEXTS=$(docker context ls --format "{{.Name}}" | grep "^colima-")

for ctx in $CONTEXTS; do
    # Evita di rifare il default se si chiama colima (spesso coincide, ma meglio controllare)
    if [ "$ctx" != "default" ]; then
        echo "👉 Controllo profilo COLIMA: $ctx..."
        stop_containers_in_context "$ctx"
    fi
done

echo "🎉 Operazione completata su tutti i profili rilevati."
