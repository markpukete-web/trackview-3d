# TrackView 3D — Roadmap

> Interactive 3D map viewer for Australian racecourses.
> Built with Google Photorealistic 3D Tiles + CesiumJS.
> Live at [trackview-3d.vercel.app](https://trackview-3d.vercel.app)

## Current state (April 2026)

Eagle Farm Racecourse is fully explorable with 19 POIs, a guided tour, live weather, transport and accessibility info, and a polished mobile bottom sheet. No backend — entirely client-side.

## Completed

| Phase | What shipped |
|-------|-------------|
| 1 | 3D Foundation — tiles rendering, camera controls, mobile touch support |
| 1.5 | Polish & Deploy — loading states, error boundary, Vercel hosting, reset view |
| 2 | POI Markers — billboard markers, info panels, category filters |
| 2.5 | Expanded POI Data — 19 Eagle Farm POIs, fact-checked against BRC sources |
| 3a | Unified Context Drawer — tabbed panel (Explore, Getting Here), mobile bottom sheet |
| 3a+ | Guided Tour — 7-stop narrated fly-through with auto-play, orbit, and dwell timers |
| 3b | Weather — Open-Meteo integration, current conditions, 3-day forecast, recent rainfall |
| — | UI/UX Design Critique — stone palette, brand colour system, accessibility features, Framer Motion bottom sheet |

## Up next

| Item | Effort | Notes |
|------|--------|-------|
| Event-day mode | Medium | Gate times, dress codes, road closures, special transport. Needs BRC calendar data |
| Track condition indicator | Small | Firm (1) to Heavy (10) badge with educational context |
| Walking routes | Large | 3D polyline paths between POIs with estimated walk times |

## Future

| Phase | Focus |
|-------|-------|
| 4 | Multi-track expansion — Doomben, Flemington, track selector, URL routing |
| — | First Furlong integration — deep links from firstfurlong.app track profiles |

## Tech stack

React 18 + TypeScript, Vite, Tailwind CSS v4, CesiumJS, Framer Motion. Hosted on Vercel.
