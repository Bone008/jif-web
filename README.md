# Passing Pattern Notations

This repo contains a React app that can visualize the siteswap notations of passing patterns.

The deployed tool is available at [notations.bonauer.me](https://notations.bonauer.me/).

## Adding a named pattern

Some juggling patterns are available as "presets" in the code, allowing the user to select it from a dropdown, and allowing a more compact deeplink to the pattern.

The presets are listed in this file: [src/jif/presets.ts](/src/jif/presets.ts)

The `instructions` and `manipulators` fields must be given in the same format accepted by the corresponding web app's text fields.

## Development

This app is based on TypeScript + React + Vite. To get started:

1. Install dependencies with `npm install`.
2. Run a development server with `npm run dev`.
3. Build with `npm run build`.
