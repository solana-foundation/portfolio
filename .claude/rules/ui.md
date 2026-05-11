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

## Token literacy: token utilities vs. literal classes

- Token utilities (`bg-primary`, `border-border`, `rounded-medium`, `shadow-modal`, etc.) inherit `globals.css` updates automatically. Literal Tailwind values (`bg-black/10`, `w-8`, `rounded-xl`) do not — they are baked into the file. When the design system says X and a generated primitive ships Y as a literal class, X needs a real edit either at the consumer (`<Component className="...">`) or in the primitive source.
- Reach-ability matters. Some primitives render internal slots that are not addressable via the public `className` (e.g. `DialogContent` renders `DialogOverlay` internally). For those, align the primitive defaults to the design system at install time rather than asking every consumer to recompose the underlying portal.
- When a generated primitive's literal class survives class merging or a third-party package's inline style wins the CSS cascade, scope a `!`-prefix utility (`!rounded-medium`, `!z-50`) at the consumer that owns the design decision. Forking the primitive is the second-resort option; the call-site override keeps the project token visible where the choice lives.

## Stable handles via `data-slot`

- Project components add a kebab-case `data-slot="<component-name>"` to their root node when tests or scoped styling need an anchor that doesn't churn with className edits. Populated and skeleton variants get distinct slot names so each branch can be asserted independently.

## Skeleton interiors

- Skeletons stand in for shape only — no disabled live controls, no fake numbers, no placeholder chart slices. Slots whose data ships in a later issue render as a skeleton until then; in-place placeholders for known-missing values stay unambiguously "no data" (muted dash tokens), never synthetic numbers.

## Reading Figma extractions

- React/Tailwind code blocks from saved Figma extraction output or future Figma MCP output are machine-generated from the visual design tree. Treat them as measurement artifacts (sizes, colors, fills, spacing, frame structure) — not production source. Use the values; map them onto the project's existing primitives and components. Generated names like `Frame1597880827`, absolute positioning, and one-variant snapshots are extraction artifacts, not implementation guidance.

## Do not

- Do not install new icon libraries — use `lucide-react` (pulled in by shadcn).
- Do not edit generated files that regenerate via tooling (e.g. `routeTree.gen.ts`).
- Do not use `className` string interpolation without `cn()`.
