import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('next/font/google', () => ({
  Inter: (opts?: { variable?: string }) => ({
    variable: opts?.variable ?? '--font-sans',
  }),
}))
