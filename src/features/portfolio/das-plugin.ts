import type { Rpc, RpcRequest } from '@solana/kit'
import {
  type ClusterUrl,
  createJsonRpcApi,
  createRpc,
  extendClient,
} from '@solana/kit'
import {
  parseJsonWithBigInts,
  stringifyJsonWithBigInts,
} from '@solana/rpc-spec-types'
import {
  type AllowedNumericKeypaths,
  getDefaultResponseTransformerForSolanaRpc,
  KEYPATH_WILDCARD,
} from '@solana/rpc-transformers'
import { createHttpTransport } from '@solana/rpc-transport-http'
import type { DasApiMethod } from '@/features/portfolio/das-types'

/** Typed RPC client for DAS methods. */
export type DasRpc = Rpc<DasApiMethod>

/** Response fields to downcast from `bigint` to `number`. Price fields
 *  included because servers may serialize zero prices as integer `0`. */
const DAS_ALLOWED_NUMERIC_KEYPATHS: AllowedNumericKeypaths<DasApiMethod> = {
  getAssetsByOwner: [
    ['total'],
    ['limit'],
    ['page'],
    ['items', KEYPATH_WILDCARD, 'token_info', 'decimals'],
    ['items', KEYPATH_WILDCARD, 'token_info', 'price_info', 'price_per_token'],
    ['items', KEYPATH_WILDCARD, 'token_info', 'price_info', 'total_price'],
    ['nativeBalance', 'price_per_sol'],
    ['nativeBalance', 'total_price'],
  ],
}

/**
 * Kit plugin that adds a `das` property to the client with typed DAS RPC methods.
 *
 * Usage:
 * ```ts
 * createClient().use(rpc(endpoint)).use(das(endpoint))
 * // => client.rpc + client.das
 * ```
 */
export function das(url: string) {
  return <TClient extends object>(client: TClient) => {
    const api = createJsonRpcApi<DasApiMethod>({
      // DAS expects a named-object params body. Kit's default packs
      // positional args into an array (e.g. `[{ownerAddress, ...}]`). Unwrap
      // a single-element array back to the bare object so the wire payload is
      // the named object the DAS standard requires.
      requestTransformer: <TParams>(
        request: RpcRequest<TParams>,
      ): RpcRequest => {
        const { params } = request
        if (Array.isArray(params) && params.length === 1) {
          // `RpcRequest.params` is typed `unknown`; narrowing is safe here
          // because we've checked the shape at runtime.
          return { ...request, params: params[0] as unknown }
        }
        return request as RpcRequest
      },
      responseTransformer: getDefaultResponseTransformerForSolanaRpc({
        allowedNumericKeyPaths: DAS_ALLOWED_NUMERIC_KEYPATHS,
      }),
    })
    // createDefaultRpcTransport gates parseJsonWithBigInts behind isSolanaRequest(),
    // which doesn't include DAS methods — falling back to JSON.parse and losing
    // precision for integers above Number.MAX_SAFE_INTEGER.
    const transport = createHttpTransport({
      url: url as ClusterUrl,
      fromJson: (raw: string) => parseJsonWithBigInts(raw),
      toJson: (payload: unknown) => stringifyJsonWithBigInts(payload),
    })
    const dasRpc = createRpc({ api, transport })

    return extendClient(client, { das: dasRpc })
  }
}
