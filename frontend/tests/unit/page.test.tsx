import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

const mockInventoryApi = vi.hoisted(() => ({
  listWines: vi.fn(),
  listSuppliers: vi.fn(),
  listMovements: vi.fn(),
  criticalStock: vi.fn(),
}))

vi.mock("@/lib/api", () => ({
  inventoryApi: mockInventoryApi,
}))

import Home from "@/app/(app)/page"

describe("Home page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInventoryApi.listWines.mockResolvedValue([])
    mockInventoryApi.listSuppliers.mockResolvedValue([])
    mockInventoryApi.listMovements.mockResolvedValue([])
    mockInventoryApi.criticalStock.mockResolvedValue([])
  })

  it("renders the dashboard summary at the root route", async () => {
    render(<Home />)

    expect(await screen.findByText(/Riepilogo giornaliero/i)).toBeInTheDocument()
    expect(screen.getByText("Carico")).toBeInTheDocument()
    expect(screen.getByText("Scarico")).toBeInTheDocument()
  })
})
