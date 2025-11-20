import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import RootLayout from "@/app/layout"

describe("RootLayout", () => {
  it("wraps children and sets body class", () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div>Child content</div>
      </RootLayout>
    )

    expect(html).toContain("Child content")
    expect(html).toContain("antialiased")
  })
})
