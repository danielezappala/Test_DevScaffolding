import { SupplierForm } from "../_components/supplier-form";

export default function NewSupplierPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Fornitori</p>
        <h1 className="font-display text-3xl text-foreground">Nuovo fornitore</h1>
      </header>
      <SupplierForm mode="create" />
    </div>
  );
}
