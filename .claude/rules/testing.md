# Testing Guidelines

- Prefer accessibility queries: `getByRole` → `getByText` → `getByTestId` (use `getByTestId` only when no accessible role or text exists)
- Use `screen` for queries — do not destructure from `render()`
- Use `renderWithRouter()` from `@/test/render` for components that need routing or the full provider tree
- `vi.mock()` calls must appear before the imports they affect
- Add new shared mocks to `src/test/` when multiple test files need the same mock
- Test hooks/context via small consumer components that render return values into the DOM — assert on rendered output, not hook internals
- Focus coverage on shared logic (`src/lib/`, `src/features/*/`) and risky code paths — entry points (`main.tsx`) and static route wrappers are low priority
- Do not test: auto-generated files (`routeTree.gen.ts`), pure layout with no logic, third-party library internals
