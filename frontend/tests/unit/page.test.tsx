import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import Home from "@/app/page"

describe("Home page", () => {
  it("shows backend version info when fetch succeeds", async () => {
    const versionInfo = {
      version: "1.2.3",
      commit: "abc123",
      build_date: "2024-01-01T00:00:00Z",
    }
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(versionInfo), { status: 200 })
    )

    const element = await Home()
    render(element)

    expect(screen.getByText("System Information")).toBeInTheDocument()
    expect(screen.getByText(versionInfo.version)).toBeInTheDocument()
    expect(screen.getByText(versionInfo.commit)).toBeInTheDocument()
  })

  it("falls back to unknown values on fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("boom"))

    const element = await Home()
    render(element)

    const unknowns = screen.getAllByText("unknown")
    expect(unknowns.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/n\/d/i)).toBeInTheDocument()
  })
})
