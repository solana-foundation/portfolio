# UI Conventions

## Where components live

- `src/components/ui/` — shadcn/ui primitives only. Generated via `pnpm dlx shadcn@latest add <name>`. Owned source; editable when a primitive needs project-specific tweaks.
- `src/components/` — shared project components that are not shadcn primitives.
- `src/features/<name>/components/` — feature-local components. Consumed by the feature and its owning route(s), not by unrelated features.

## When to add a shadcn primitive

- When a new page or component needs a UI building block that is not installed yet (`dialog`, `tooltip`, `sheet`, etc.).
- Install via the shadcn CLI, not by hand-writing the file.
- Prefer wrapping a generated primitive in a project component over modifying generated files in place — unless the modification is project-wide and intentional.

## Prefer compound composition over prop explosion

- If a reusable component is about to grow a third boolean prop or a second `ReactNode` slot, convert it to a compound pattern (`<Thing>` + `<Thing.Header>` + `<Thing.Content>`) instead of widening the prop surface. Shadcn's `<Empty>` is the reference pattern.
- Generated shadcn primitives already follow this; project components should too.

## Import aliasing

- `@/components/ui/<name>` for shadcn primitives
- `@/components/<name>` for shared project components
- `@/features/<name>` (barrel) or `@/features/<name>/components/<component>` for feature-local code
- Never import from deep shadcn internals

## Styling

- Use the shadcn CSS variable namespace: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, etc.
- `@wallet-ui/tailwind` variables (`--wallet-ui-*`) are isolated to wallet-ui components — do not mix.
- Use `cn()` from `@/lib/utils` for any conditional className composition; never build class strings by hand.

## Do not

- Do not install new icon libraries — use `lucide-react` (pulled in by shadcn).
- Do not edit generated files that regenerate via tooling (e.g. `routeTree.gen.ts`).
- Do not use `className` string interpolation without `cn()`.
