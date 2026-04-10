import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createPortfolioQueryClient } from '@/features/portfolio'
import { SolanaProvider } from '@/features/wallet'
import { routeTree } from './routeTree.gen'
import './styles/globals.css'

const router = createRouter({ routeTree })
const queryClient = createPortfolioQueryClient()

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SolanaProvider>
        <RouterProvider router={router} />
      </SolanaProvider>
    </QueryClientProvider>
  </StrictMode>,
)
