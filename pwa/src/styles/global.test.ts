// @ts-expect-error Node types are not part of the browser production project.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const globalStyles = readFileSync('src/styles/global.css', 'utf8')

describe('exit confirmation styles', () => {
  it('uses the accessible soft text color for the dialog description', () => {
    expect(globalStyles).toMatch(
      /\.exit-confirmation__panel p:not\(\.exit-confirmation__eyebrow\)\s*\{[^}]*color:\s*var\(--text-soft\)/s,
    )
  })

  it('uses the accessible soft text color for the exit action', () => {
    expect(globalStyles).toMatch(
      /\.exit-confirmation__exit\s*\{[^}]*color:\s*var\(--text-soft\)/s,
    )
  })
})
