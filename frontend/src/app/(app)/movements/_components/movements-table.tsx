"use client";

import { useState, useMemo } from "react";
import type { StockMovement, Wine } from "@/types";
import { DataTable, type SortDirection } from "@/components/data-table";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";

const movementTypeLabels = {
  in: "Carico",
  out: "Scarico",
  adjust: "Rettifica",
} as const;

interface MovementsTableProps {
  movements: StockMovement[];
  wines: Wine[];
}

export function MovementsTable({ movements, wines }: MovementsTableProps) {
  const [sortState, setSortState] = useState<{ columnId?: string; direction?: SortDirection }>({});

  // Sort data based on current sort state
  const sortedMovements = useMemo(() => {
    if (!sortState.columnId || !sortState.direction) {
      return movements;
    }

    const sorted = [...movements].sort((a, b) => {
      type SortableValue = string | number;
      let aValue: SortableValue;
      let bValue: SortableValue;

      switch (sortState.columnId) {
        case "timestamp":
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case "wine": {
          const wineA = wines.find((w) => w.id === a.wine_id);
          const wineB = wines.find((w) => w.id === b.wine_id);
          aValue = wineA?.name || "";
          bValue = wineB?.name || "";
          break;
        }
        case "type":
          aValue = a.type;
          bValue = b.type;
          break;
        case "quantity":
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case "reference":
          aValue = a.reference || "";
          bValue = b.reference || "";
          break;
        case "note":
          aValue = a.note || "";
          bValue = b.note || "";
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortState.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortState.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [movements, wines, sortState]);

  const handleSortChange = (columnId: string, direction: SortDirection) => {
    setSortState({ columnId, direction });
  };

  return (
    <DataTable
      data={sortedMovements}
      sortState={sortState}
      onSortChange={handleSortChange}
      columns={[
        {
          id: "timestamp",
          header: "Data",
          sortable: true,
          render: (movement) => (
            <div className="flex flex-col">
              <span className="font-medium">{new Date(movement.timestamp).toLocaleDateString("it-IT")}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(movement.timestamp).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ),
        },
        {
          id: "wine",
          header: "Vino",
          sortable: true,
          render: (movement) => {
            const wine = wines.find((w) => w.id === movement.wine_id);
            return (
              <div className="flex flex-col">
                <span className="font-medium">{wine ? wine.name : `ID ${movement.wine_id}`}</span>
                {wine && <span className="text-xs text-muted-foreground">{wine.vintage}</span>}
              </div>
            );
          },
        },
        {
          id: "type",
          header: "Tipo",
          sortable: true,
          render: (movement) => (
            <Badge
              variant={
                movement.type === "in"
                  ? "success"
                  : movement.type === "out"
                    ? "warning"
                    : "neutral"
              }
            >
              {movementTypeLabels[movement.type] || movement.type}
            </Badge>
          ),
        },
        {
          id: "quantity",
          header: "Quantità",
          sortable: true,
          render: (movement) => (
            <span className="font-semibold">
              {movement.type === "out" ? "-" : "+"}
              {movement.quantity} btg
            </span>
          ),
        },
        {
          id: "reference",
          header: "Riferimento",
          sortable: true,
          render: (movement) => <span className="text-sm">{movement.reference || "—"}</span>,
        },
        {
          id: "note",
          header: "Note",
          sortable: true,
          render: (movement) => <span className="text-sm text-muted-foreground">{movement.note || "—"}</span>,
        },
        {
          id: "actions",
          header: "Azioni",
          render: (movement) => {
            const wine = wines.find((w) => w.id === movement.wine_id);
            return (
              <div className="flex items-center gap-2">
                {wine && (
                  <Button
                    href={`/stock/${wine.id}`}
                    variant="ghost"
                    size="sm"
                  >
                    Dettagli
                  </Button>
                )}
              </div>
            );
          },
        },
      ]}
    />
  );
}
