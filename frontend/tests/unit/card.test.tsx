import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

describe("Card UI components", () => {
  it("renders header, content and footer with provided text", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Subtitle</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    )

    expect(screen.getByText("Title")).toBeInTheDocument()
    expect(screen.getByText("Subtitle")).toBeInTheDocument()
    expect(screen.getByText("Body")).toBeInTheDocument()
    expect(screen.getByText("Footer")).toBeInTheDocument()
  })
})
