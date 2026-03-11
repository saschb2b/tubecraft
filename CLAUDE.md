# TubeCraft

3D printable tube and adapter generator with real-time 3D preview and STL export.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **UI**: Material UI (MUI) v6 with dark theme — see `lib/theme.ts`
- **3D**: React Three Fiber + Three.js + @react-three/drei
- **CAD/Export**: @jscad/modeling + @jscad/stl-serializer
- **Icons**: lucide-react + @mui/icons-material (ExpandMore only)
- **Package manager**: pnpm

## Commands

- `pnpm dev` — start dev server (Turbopack)
- `pnpm build` — production build
- `pnpm lint` — ESLint

## Project Structure

```
app/
  layout.tsx          — Root layout (server component), MUI ThemeProvider
  page.tsx            — Main page with sidebar controls + 3D preview
  globals.css         — Minimal CSS reset (no Tailwind)
components/
  ThemeProvider.tsx    — "use client" boundary for MUI ThemeProvider + CssBaseline
  tube-controls.tsx   — Tube configuration panel (Accordion, TextField, Switch)
  tube-preview.tsx    — 3D tube preview (React Three Fiber Canvas)
  adapter-controls.tsx — Adapter configuration panel
  adapter-preview.tsx — 3D adapter preview
lib/
  theme.ts            — MUI dark theme (palette, accordion overrides)
  tube-types.ts       — TypeScript types + defaults for tube configs
  adapter-types.ts    — TypeScript types + defaults for adapter configs
  stl-generator.ts    — Tube STL generation via @jscad
  adapter-generator.ts — Adapter STL generation via @jscad
```

## Conventions

- Use native MUI components — avoid custom style overrides; put necessary theme-level overrides in `lib/theme.ts`
- Use `sx` prop for layout/spacing; avoid inline `style` except inside Three.js `<Html>` components
- Path alias: `@/*` maps to project root
- No Tailwind CSS — fully removed
- Keep `layout.tsx` as a server component (required for `metadata` export); client providers go in `ThemeProvider.tsx`
