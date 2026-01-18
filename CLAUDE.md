# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React + TypeScript + Vite web application for visualizing juggling passing patterns using siteswap notations. Converts notation formats (social siteswap, 4-handed siteswap, Prechac) into JIF (Juggling Interchange Format) and renders interactive orbit diagrams with optional manipulators.

Deployed at: https://notations.bonauer.me/

## Commands

```bash
npm install       # Install dependencies
npm start         # Start Vite dev server with HMR
npm run build     # TypeScript check + Vite production build, use for type checking
npm run format    # Format with Prettier
npm run test          # Run unit tests
```

## Testing

After making changes, always ensure:

- that the code remain formatted (`npm run format`)
- that tests still pass (`npm run test`)

## Architecture & Data Flow

1. **Input parsing** (`src/jif/high_level_converter.ts`):

   - `prechacToJif()` - Semi-synchronous patterns like "3B 3 3" (pass to B, self, self)
   - `siteswapToJIF()` - Asynchronous n-handed notation (e.g. "77862" for Why Not)

2. **JIF loading** (`src/jif/jif_loader.ts`):

   - `loadWithDefaults()` - Fills in missing fields, creates `FullJIF` with all optional fields populated

3. **Manipulation** (`src/jif/manipulation.ts`):

   - `addManipulator()` - Adds manipulator juggler executing intercepts/substitutes
   - Pattern shifts in time to avoid relabeling edge cases
   - Every intercept is followed by a "carried" throw, but this is not notated in the
     instructions. Instead, the carry gets automatically calculated based on the causal
     continuation of the intercepted juggler.

4. **Orbit calculation** (`src/jif/orbits.ts`):

   - `calculateOrbits()` - Traces object paths through throws
   - `getThrowsTableByJuggler()` / `getThrowsTableByLimb()` - 2D arrays for rendering

5. **Rendering** (`src/components/ThrowsTable.tsx`):
   - Visual table with throws per juggler/limb per beat
   - Arrow overlays for orbit or causal arrow visualization

## Key Files

- `src/jif/jif.ts` - Core JIF type definitions
- `src/jif/presets.ts` - Named pattern presets (dropdown selections)
- `src/components/OrbitsCalculator.tsx` - Main UI container component

## State Management

Uses `unstated-next` for lightweight container-based state:

- `SearchParamsContainer` (`src/hooks/useSearchParams.ts`) - Syncs URL params with state
- `ViewSettingsContainer` (`src/components/ViewSettings.tsx`) - Display preferences

**URL Parameters:** `pattern` (preset name), `q` (custom notation), `m` (manipulators), `embed=1` (iframe mode)

## Domain Concepts

**JIF Structure:**

- Jugglers have `becomes` field for cyclic relabeling at period end
- Limbs default to 2 per juggler (right/left hands), indexed `2*j + handIndex`
- Throws specify `from`/`to` limb indices, `time`, `duration`
- `repetition.limbPermutation` tracks limb relabeling for odd-period patterns

**Manipulator Notation:**

- `sA` - Substitute throw from juggler A
- `i1A` / `i2A` - Intercept A's throw (followed by a carry 1 or 2 beats later)
- `-` - No manipulation this beat
- Example: `"sA - - i2B"` = substitute A at beat 0, intercept B at beat 3 with 2-beat carry

**Type Distinctions:**

- `JIF` = raw input format (all fields optional)
- `FullJIF` = loaded format (required fields populated)
- `FullThrow` = `Throw` with all fields required

## Adding Pattern Presets

Edit `src/jif/presets.ts`:

```typescript
{
  name: "Pattern Name",
  instructions: "3B 3 3\n3A 3 3",  // Prechac notation
  manipulators: ["sA - - i2B"]     // Optional manipulator strings
}
```

## Styling

- Component-scoped `.scss` files co-located with components
- Shared styles in `src/index.scss`, `src/breakpoints.scss`
- BEM-like naming convention (e.g., `throws-container`, `collapsible-tile__panel`)
