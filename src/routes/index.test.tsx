import { describe, expect, it, vi } from 'vitest'
import { renderWithRouter } from '@/test/render'

vi.mock('@wallet-ui/react', async () => {
  const { createWalletUiMock } = await import('@/test/wallet-ui-mock')
  return createWalletUiMock()
})

describe('/ route', () => {
  it('redirects to /portfolio', async () => {
    const { router } = await renderWithRouter('/')

    expect(router.state.location.pathname).toBe('/portfolio')
  })
})
