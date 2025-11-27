/**
 * Common type definitions for the frontend application
 */

export interface VersionInfo {
  version: string;
  commit: string;
  build_date: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  message: string;
  details?: unknown;
}

export type WineType = "red" | "white" | "rose" | "sparkling" | "dessert" | "other";

export interface SupplierBase {
  name: string;
  contact_email?: string | null;
  phone?: string | null;
  address?: string | null;
  vat_number?: string | null;
  notes?: string | null;
}

export interface Supplier extends SupplierBase {
  id: number;
  created_at: string;
  updated_at: string;
}

export type SupplierCreate = SupplierBase;
export type SupplierUpdate = Partial<SupplierBase>;

export interface WineBase {
  name: string;
  vintage: number;
  type: WineType;
  denomination?: string | null;
  price: number;
  quantity: number;
  threshold?: number | null;
  barcode?: string | null;
  supplier_id?: number | null;
  notes?: string | null;
}

export interface Wine extends WineBase {
  id: number;
  created_at: string;
  updated_at: string;
  supplier?: Supplier | null;
}

export type WineCreate = WineBase;
export type WineUpdate = Partial<WineBase>;

export interface WineCriticalStock {
  id: number;
  name: string;
  vintage: number;
  quantity: number;
  threshold?: number | null;
  severity: "critical" | "warning";
  supplier?: Supplier | null;
}

export type MovementType = "in" | "out" | "adjust";

export interface StockMovementBase {
  wine_id: number;
  type: MovementType;
  quantity: number;
  lot_id?: number | null;
  note?: string | null;
  reference?: string | null;
}

export interface StockMovement extends StockMovementBase {
  id: number;
  timestamp: string;
  user_id?: number | null;
  wine_name?: string | null;
  wine_vintage?: number | null;
}

export type StockMovementCreate = StockMovementBase;
export type StockMovementRead = StockMovement;

export interface WineFilters {
  skip?: number;
  limit?: number;
  search?: string;
  type?: WineType | "all";
  vintage?: number;
  denomination?: string;
  supplier_id?: number;
  available_only?: boolean;
  below_threshold?: boolean;
}

export interface MovementFilters {
  skip?: number;
  limit?: number;
  wine_id?: number;
  type?: MovementType | "all";
}

export type CriticalSeverityFilter = "critical" | "warning" | "all";
