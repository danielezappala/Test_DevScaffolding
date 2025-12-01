"use client";

import { useState, useMemo } from "react";
import { DataTable, type SortDirection } from "@/components/data-table";
import { Button } from "@/components/button";

interface Supplier {
  id: number;
  name: string;
  contact_email?: string | null;
  phone?: string | null;
  vat_number?: string | null;
}

interface SuppliersTableProps {
  suppliers: Supplier[];
}

export function SuppliersTable({ suppliers }: SuppliersTableProps) {
  const [sortState, setSortState] = useState<{ columnId?: string; direction?: SortDirection }>({});

  const sortedSuppliers = useMemo(() => {
    if (!sortState.columnId || !sortState.direction) {
      return suppliers;
    }

    const sorted = [...suppliers].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortState.columnId) {
        case "name":
          aValue = a.name || "";
          bValue = b.name || "";
          break;
        case "email":
          aValue = a.contact_email || "";
          bValue = b.contact_email || "";
          break;
        case "phone":
          aValue = a.phone || "";
          bValue = b.phone || "";
          break;
        case "vat":
          aValue = a.vat_number || "";
          bValue = b.vat_number || "";
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortState.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortState.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [suppliers, sortState]);

  const handleSortChange = (columnId: string, direction: SortDirection) => {
    setSortState({ columnId, direction });
  };

  return (
    <DataTable
      data={sortedSuppliers}
      sortState={sortState}
      onSortChange={handleSortChange}
      columns={[
        { id: "name", header: "Nome", accessor: "name", sortable: true },
        { id: "email", header: "Email", accessor: "contact_email", sortable: true },
        { id: "phone", header: "Telefono", accessor: "phone", sortable: true },
        { id: "vat", header: "P. IVA", accessor: "vat_number", sortable: true },
        {
          id: "actions",
          header: "Azioni",
          render: (supplier) => (
            <div className="flex items-center gap-2">
              <Button
                href={`/dashboard/suppliers/${supplier.id}/edit`}
                variant="outline"
                size="sm"
              >
                Modifica
              </Button>
            </div>
          ),
        },
      ]}
    />
  );
}
