import { describe, expect, it, vi } from "vitest"

const redirectMock = vi.fn()

vi.mock("next/navigation", () => ({
  redirect: (...args: Parameters<typeof redirectMock>) => redirectMock(...args),
}))

import Home from "@/app/page"

describe("Home page", () => {
  beforeEach(() => {
    redirectMock.mockClear()
  })

  it("redirects authenticated users to the dashboard", async () => {
    await Home()

    expect(redirectMock).toHaveBeenCalledWith("/dashboard")
  })

  it("returns null after triggering the redirect", async () => {
    const result = await Home()

    expect(result).toBeNull()
  })
})
