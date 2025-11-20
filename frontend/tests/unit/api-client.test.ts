import { ApiClient, api } from "@/lib/api-client"
import { afterEach, describe, expect, it, vi } from "vitest"

describe("ApiClient", () => {
  const baseUrl = "http://example.com"
  const client = new ApiClient(baseUrl)

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("performs a successful GET request and returns parsed json", async () => {
    const payload = { ok: true }
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify(payload), { status: 200 }))

    const result = await client.get("/test")

    expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/test`, { method: "GET" })
    expect(result).toEqual(payload)
  })

  it("throws an ApiError when the response is not ok", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "boom" }), { status: 500 })
      )

    await expect(client.get("/fail")).rejects.toMatchObject({
      message: "boom",
      status: 500,
    })

    expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/fail`, { method: "GET" })
  })

  it("wraps network failures in an ApiError with status 0", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("offline"))

    await expect(client.get("/offline")).rejects.toMatchObject({
      message: "offline",
      status: 0,
    })
  })

  it("sends JSON payloads for POST/PUT and supports DELETE", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ created: true }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ updated: true }), { status: 200 })
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ deleted: true }), { status: 200 }))

    await client.post("/items", { name: "test" })
    await client.put("/items/1", { name: "updated" })
    await client.delete("/items/1")

    expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "test" }),
    })
    expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/items/1`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "updated" }),
    })
    expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/items/1`, {
      method: "DELETE",
    })
  })

  it("falls back to generic message when error payload is not JSON", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("not-json", { status: 502, headers: { "Content-Type": "text/plain" } })
    )

    await expect(client.get("/bad")).rejects.toMatchObject({
      message: "HTTP error 502",
      status: 502,
    })
  })
})

describe("api convenience helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("forwards calls to the shared ApiClient instance", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ created: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ updated: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ deleted: true }), { status: 200 }))

    expect(await api.get("/ping")).toEqual({ ok: true })
    expect(await api.post("/ping", { foo: "bar" })).toEqual({ created: true })
    expect(await api.put("/ping", { foo: "bar" })).toEqual({ updated: true })
    expect(await api.delete("/ping")).toEqual({ deleted: true })

    expect(fetchMock).toHaveBeenCalledTimes(4)
  })
})
