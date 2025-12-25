# JIF-Web: Passing Pattern Notation Visualizer

## Project Overview
A React + TypeScript + Vite app for visualizing juggling passing patterns using siteswap notations. Converts high-level notation formats (social siteswap, 4-handed siteswap, Prechac) into JIF (Juggling Interchange Format) and renders orbit diagrams with manipulators.

**Key Files:**
- [src/jif/jif.ts](/src/jif/jif.ts) - Core JIF type definitions
- [src/jif/high_level_converter.ts](/src/jif/high_level_converter.ts) - Converts notations to JIF
- [src/jif/manipulation.ts](/src/jif/manipulation.ts) - Applies manipulators (substitutes, intercepts)
- [src/jif/orbits.ts](/src/jif/orbits.ts) - Calculates object orbits/paths
- [src/components/OrbitsCalculator.tsx](/src/components/OrbitsCalculator.tsx) - Main UI component

## Architecture & Data Flow

1. **Input parsing** ([high_level_converter.ts](/src/jif/high_level_converter.ts)):
   - `prechacToJif()` - Semi-synchronous patterns like "3B 3 3" (pass to B, self, self)
   - `siteswapToJIF()` - Asynchronous patterns in n-handed notation (e.g. "77862" for Why Not)

2. **JIF loading** ([jif_loader.ts](/src/jif/jif_loader.ts)):
   - `loadWithDefaults()` - Fills in missing fields (juggler labels, limb kinds, repetition info)
   - Creates `FullJIF` with all optional fields populated

3. **Manipulation** ([manipulation.ts](/src/jif/manipulation.ts)):
   - `addManipulator()` - Adds a new juggler executing intercepts/substitutes
   - Pattern shifts in time to avoid relabeling edge cases
   - Marks throws with `isManipulated: true`

4. **Orbit calculation** ([orbits.ts](/src/jif/orbits.ts)):
   - `calculateOrbits()` - Traces object paths through throws
   - `getThrowsTableByJuggler()` or `getThrowsTableByLimb()` - 2D array indexed by juggler/limb and time

5. **Rendering** ([ThrowsTable.tsx](/src/components/ThrowsTable.tsx)):
   - Visual table with throws per juggler/limb per beat
   - Arrow overlays for visualization of orbits or causal arrows

## State Management

Uses `unstated-next` for lightweight container-based state:
- `SearchParamsContainer` ([useSearchParams.ts](/src/hooks/useSearchParams.ts)) - Syncs URL params with component state for pattern sharing
- `ViewSettingsContainer` ([ViewSettings.tsx](/src/components/ViewSettings.tsx)) - Display preferences (limbs vs jugglers view)

**URL Parameters:**
- `pattern` - Preset name (slugified)
- `q` - Custom JIF/siteswap instructions
- `m` - Manipulator instructions
- `embed=1` - Embed mode (hides header)

## Development Workflows

**Commands:**
```bash
npm install       # Install dependencies
npm run dev       # Dev server (Vite HMR)
npm run build     # Type-check then build
npm run lint      # ESLint
npm run format    # Prettier
npm run preview   # Preview production build
```

**Adding presets:** Edit [src/jif/presets.ts](/src/jif/presets.ts):
```typescript
{
  name: "Pattern Name",
  instructions: "3B 3 3\n3A 3 3",  // Prechac notation
  manipulators: ["sA - - i2B"]     // Optional manipulator string
}
```

## Conventions & Patterns

**JIF Structure:**
- Jugglers have `becomes` field for relabeling at period end (cyclic permutation)
- Limbs default to 2 per juggler (right/left hands), indexed `2*j + handIndex`
- Throws specify `from`/`to` limb indices, `time`, `duration`
- `repetition.limbPermutation` tracks limb relabeling for odd-period patterns

**Manipulator Notation:**
- `sA` - Substitute throw from juggler A
- `i1A` / `i2A` - Intercept A's throw (1-beat or 2-beat carry)
- `-` - No manipulation this beat
- Example: `"sA - - i2B"` = substitute A at beat 0, intercept B at beat 3 with 2-beat carry

**Styling:**
- Each component has co-located `.scss` file
- Shared styles in [src/index.scss](/src/index.scss), [src/breakpoints.scss](/src/breakpoints.scss)
- BEM-like naming: `throws-container`, `throw-cell`, `collapsible-tile__panel`

**Type Safety:**
- `JIF` = raw input format (all fields optional)
- `FullJIF` = loaded format (required fields populated by [jif_loader.ts](/src/jif/jif_loader.ts))
- `FullThrow` = extends `Throw` with guaranteed non-null fields

## Critical Implementation Details

**Period & Relabeling:**
- Patterns repeat after `repetition.period` beats
- If period is odd, limbs switch handedness (right ↔ left)
- Manipulators temporarily shift pattern timeline to avoid crossing relabeling boundaries

**Orbit Algorithm:**
- Starts at earliest unvisited throw, follows to landing limb, repeats until cycle completes
- Uses `wrapLimb()` helper to handle relabeling across period boundaries

**Error Handling:**
- Parsing errors shown in red `.card.error` elements
- Multiple throws per limb/beat triggers console warnings

**Embed Mode:**
- `?embed=1` adds `embed` class to body, hides header, shows minimal UI
- Used for iframe embedding on external sites (e.g., passing.zone)
