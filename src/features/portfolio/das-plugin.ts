import type { Rpc, RpcRequest } from '@solana/kit'
import {
  type ClusterUrl,
  createDefaultRpcTransport,
  createJsonRpcApi,
  createRpc,
  extendClient,
  pipe,
} from '@solana/kit'
import {
  getResultResponseTransformer,
  getThrowSolanaErrorResponseTransformer,
} from '@solana/rpc-transformers'
import type { DasApiMethod } from '@/features/portfolio/das-types'

/** Typed RPC client for DAS methods. */
export type DasRpc = Rpc<DasApiMethod>

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
      // Helius DAS expects a named-object params body. Kit's default packs
      // positional args into an array (e.g. `[{ownerAddress, ...}]`). Unwrap
      // a single-element array back to the bare object so the wire payload is
      // the named object Helius requires.
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
      // Mirrors `getDefaultResponseTransformerForSolanaRpc`: throw on error
      // envelopes, then unwrap `.result`. `pipe` is value-threaded, so each
      // step is a unary lambda.
      responseTransformer: (response, request) =>
        pipe(
          response,
          (r) => getThrowSolanaErrorResponseTransformer()(r, request),
          (r) => getResultResponseTransformer()(r, request),
        ),
    })
    const transport = createDefaultRpcTransport({ url: url as ClusterUrl })
    const dasRpc = createRpc({ api, transport })

    return extendClient(client, { das: dasRpc })
  }
}
