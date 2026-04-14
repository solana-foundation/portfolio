import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@solana/rpc-transport-http', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@solana/rpc-transport-http')>()
  return {
    ...actual,
    createHttpTransport: vi.fn(),
  }
})

import { isSolanaError } from '@solana/kit'
import { createHttpTransport } from '@solana/rpc-transport-http'
import type { DasRpc } from '@/features/portfolio/das-plugin'
import { das } from '@/features/portfolio/das-plugin'

/** Helper to install a spy transport as the mocked createHttpTransport's return value. */
function installSpyTransport(): ReturnType<typeof vi.fn> {
  const spyTransport = vi.fn()
  vi.mocked(createHttpTransport).mockReturnValue(
    spyTransport as unknown as ReturnType<typeof createHttpTransport>,
  )
  return spyTransport
}

describe('das plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('returns plugin and extends client', () => {
    it('das(url) returns a function', () => {
      installSpyTransport()

      const plugin = das('https://rpc.example.com')

      expect(typeof plugin).toBe('function')
    })

    it('calling the plugin with {} returns an object with a das property', () => {
      installSpyTransport()

      const plugin = das('https://rpc.example.com')
      const extended = plugin({})

      expect(extended).toHaveProperty('das')
    })

    it('preserves existing properties on the input client alongside das', () => {
      installSpyTransport()

      const plugin = das('https://rpc.example.com')
      const client = { rpc: 'existing-rpc', other: 42 }
      const extended = plugin(client)

      expect(extended).toHaveProperty('rpc', 'existing-rpc')
      expect(extended).toHaveProperty('other', 42)
      expect(extended).toHaveProperty('das')
    })
  })

  describe('sends named params (not positional array) to the transport', () => {
    it('transport receives params as the original object, not [params]', async () => {
      const spyTransport = installSpyTransport()
      spyTransport.mockResolvedValue({
        jsonrpc: '2.0',
        id: '0',
        result: { total: 0, limit: 10, page: 1, items: [] },
      })

      const plugin = das('https://rpc.example.com')
      const extended = plugin({})

      const params = {
        ownerAddress: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
        page: 1,
        limit: 3,
        displayOptions: {
          showFungible: true,
          showNativeBalance: true,
        },
      }

      await extended.das.getAssetsByOwner(params).send()

      expect(spyTransport).toHaveBeenCalledTimes(1)
      const call = spyTransport.mock.calls[0]!
      const config = call[0] as {
        payload: {
          jsonrpc: string
          method: string
          params: unknown
          id: unknown
        }
      }

      expect(config.payload.jsonrpc).toBe('2.0')
      expect(config.payload.method).toBe('getAssetsByOwner')
      expect(config.payload.params).toEqual(params)
      expect(Array.isArray(config.payload.params)).toBe(false)
    })
  })

  describe('unwraps the JSON-RPC success envelope', () => {
    it('.send() resolves to the result value directly (no .result wrapping)', async () => {
      const spyTransport = installSpyTransport()
      spyTransport.mockResolvedValue({
        jsonrpc: '2.0',
        id: '0',
        result: { total: 5, limit: 10, page: 1, items: [] },
      })

      const plugin = das('https://rpc.example.com')
      const extended = plugin({})

      const resolved = await extended.das
        .getAssetsByOwner({
          ownerAddress: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
          page: 1,
        })
        .send()

      expect(resolved.total).toBe(5)
      expect(resolved.limit).toBe(10)
      expect(resolved.page).toBe(1)
      expect(resolved.items).toEqual([])
    })
  })

  describe('rejects as SolanaError when the envelope carries an error', () => {
    it('.send() rejects and the error satisfies isSolanaError with code/message context', async () => {
      const spyTransport = installSpyTransport()
      spyTransport.mockResolvedValue({
        jsonrpc: '2.0',
        id: '0',
        error: {
          code: -32602,
          message:
            'unknown field `wrong`, expected one of `ownerAddress`, `page`, `limit`',
        },
      })

      const plugin = das('https://rpc.example.com')
      const extended = plugin({})

      let caught: unknown
      try {
        await extended.das
          .getAssetsByOwner({
            ownerAddress: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
            page: 1,
          })
          .send()
      } catch (err) {
        caught = err
      }

      expect(caught).toBeDefined()
      expect(isSolanaError(caught)).toBe(true)

      const context = (caught as { context: Record<string, unknown> }).context
      expect(context.__code).toBe(-32602)
      expect(String(context.__serverMessage)).toContain('unknown field')
    })
  })

  describe('exports DasRpc type', () => {
    it('DasRpc type alias is importable and assignable', () => {
      const x: DasRpc | undefined = undefined
      expect(x).toBeUndefined()
    })
  })
})
