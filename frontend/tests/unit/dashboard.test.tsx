import { describe, expect, it } from "vitest"
import { fireEvent, render, screen, within } from "@testing-library/react"
import DashboardPage from "@/app/dashboard/page"

describe("Dashboard page", () => {
  it("mostra header, azioni rapide e riepilogo", () => {
    render(<DashboardPage />)

    expect(screen.getByText(/Control Room/i)).toBeInTheDocument()
    expect(screen.getByText(/Riepilogo giornaliero/i)).toBeInTheDocument()

    // quick actions
    expect(screen.getByText("Carico")).toBeInTheDocument()
    expect(screen.getByText("Scarico")).toBeInTheDocument()
    expect(screen.getByText("Nuovo fornitore")).toBeInTheDocument()

    // riepilogo cards
    expect(screen.getByText(/Etichette attive/i)).toBeInTheDocument()
    expect(screen.getByText(/Bottiglie a stock/i)).toBeInTheDocument()
  })

  it("collassa la sidebar con l'hamburger", () => {
    render(<DashboardPage />)

    // menu aperto: voce completa visibile
    const nav = screen.getByRole("navigation")
    expect(within(nav).getByText("Dashboard")).toBeInTheDocument()

    const toggle = screen.getByLabelText(/Apri\/chiudi menu/i)
    fireEvent.click(toggle)

    // dopo il click, l'etichetta testuale nella sidebar scompare (breadcrumb rimane)
    expect(within(nav).queryByText("Dashboard")).not.toBeInTheDocument()
  })
})
