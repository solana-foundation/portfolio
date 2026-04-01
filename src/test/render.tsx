import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render } from '@testing-library/react'
import { routeTree } from '@/routeTree.gen'

export async function renderWithRouter(initialUrl = '/'): Promise<void> {
  const history = createMemoryHistory({ initialEntries: [initialUrl] })
  const router = createRouter({
    routeTree,
    history,
    defaultPendingMinMs: 0,
  })

  await router.load()
  render(<RouterProvider router={router} />)
}
