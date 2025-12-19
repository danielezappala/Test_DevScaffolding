import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"

const mockInventoryApi = vi.hoisted(() => ({
  listWines: vi.fn(),
  listSuppliers: vi.fn(),
  listMovements: vi.fn(),
  criticalStock: vi.fn(),
}))

vi.mock("@/lib/api", () => ({
  inventoryApi: mockInventoryApi,
}))

import DashboardPage from "@/app/(app)/page"

describe("Dashboard page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInventoryApi.listWines.mockResolvedValue([
      { id: 1, name: "Barolo", quantity: 5, threshold: 2 },
      { id: 2, name: "Chianti", quantity: 3, threshold: 1 },
    ])
    mockInventoryApi.listSuppliers.mockResolvedValue([{ id: 1 }, { id: 2 }])
    mockInventoryApi.listMovements.mockResolvedValue([
      { id: 10, type: "in", quantity: 2, wine_id: 1, timestamp: new Date().toISOString() },
      { id: 11, type: "out", quantity: 1, wine_id: 2, timestamp: new Date().toISOString() },
    ])
    mockInventoryApi.criticalStock.mockResolvedValue([{ wine_id: 1, quantity: 1, threshold: 2 }])
  })

  it("mostra header, azioni rapide e riepilogo", async () => {
    render(<DashboardPage />)

    expect(await screen.findByText(/Riepilogo giornaliero/i)).toBeInTheDocument()
    expect(await screen.findByText("Carico")).toBeInTheDocument()
    expect(screen.getByText("Scarico")).toBeInTheDocument()
    expect(screen.getByText("Nuovo partner")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Etichette attive/i)).toBeInTheDocument()
      expect(screen.getByText(/Bottiglie a stock/i)).toBeInTheDocument()
    })
  })

  it("mostra un messaggio di errore se il caricamento fallisce", async () => {
    mockInventoryApi.listWines.mockRejectedValueOnce(new Error("boom"))

    render(<DashboardPage />)

    expect(await screen.findByText(/Errore nel recupero dati/i)).toBeInTheDocument()
  })
})
