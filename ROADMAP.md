# TrackView 3D — Roadmap

> Interactive 3D map viewer for Australian racecourses.
> Built with Google Photorealistic 3D Tiles + CesiumJS.
> Live at [trackview-3d.vercel.app](https://trackview-3d.vercel.app)

## Current state (May 2026)

Eagle Farm Racecourse is fully explorable with 19 POIs, an 8-stop first-visit guided tour, live weather, transport and accessibility info, walking routes, and a floating map discovery layer for search, visitor intent filters, arrival, and tour entry. Doomben Racecourse is loaded as a second track (18 POIs, its own first-visit guided tour, transport, and accessibility), reached via a full-screen track picker and an in-map switcher — its first two arrival walking routes are in, with the station and infield routes still to trace. No backend — entirely client-side.

## Completed

| Phase | What shipped |
|-------|-------------|
| 1 | 3D Foundation — tiles rendering, camera controls, mobile touch support |
| 1.5 | Polish & Deploy — loading states, error boundary, Vercel hosting, reset view |
| 2 | POI Markers — billboard markers, info panels, category filters |
| 2.5 | Expanded POI Data — 19 Eagle Farm POIs, fact-checked against BRC sources |
| 3a | Unified Context Drawer — tabbed panel (Explore, Getting Here), mobile bottom sheet |
| 3a+ | Guided Tour — 8-stop narrated fly-through with auto-play, orbit, dwell timers, reduced-motion support, and confidence prompt |
| 3b | Weather — Open-Meteo integration, current conditions, 3-day forecast, recent rainfall |
| 3b | Walking Routes — selectable public walking paths between key arrival and venue POIs |
| — | UI/UX Design Critique — stone palette, brand colour system, accessibility features, Framer Motion bottom sheet |
| — | UI/UX Accessibility + Visual Hierarchy Pass — calmer map-first layout, stronger drawer/tour/weather semantics, clearer POI filters |
| — | Map Discovery UX Refactor — Google Maps-inspired search and visitor-intent controls above the map, with the drawer as a reactive result/detail surface |
| 4 (started) | Multi-track shell — full-screen track picker on first visit, in-map track switcher, `?track=` URL routing, session persistence, and back-to-landing nav |
| 4 (started) | Doomben track — 18 POIs and a first-visit guided tour, with transport and accessibility info, plus two short arrival walking routes (Gate 4 → Public Grandstand, Gate 4 → Mounting Yard) |
| 4 (started) | Plan Your Visit — evergreen race-day guidance tab (dress code, gates & arrival, entry essentials) for Eagle Farm, fact-checked against BRC and First Furlong |

## Up next

| Item | Effort | Notes |
|------|--------|-------|
| Real-device mobile validation | Small | Retest selected POI/tour callout anchoring during fast pinch, zoom, and tilt gestures, especially Gate 4 |
| Event-day mode | Medium | Gate times, dress codes, road closures, special transport. Needs BRC calendar data |
| Track condition indicator | Small | Firm (1) to Heavy (10) badge with educational context |
| Stradbroke Day tour decision | Small | Decide whether to ship tour selection + Stradbroke tour standalone or bundle with event-day mode |
| Doomben hero routes | Small | Two short arrival routes (Gate 4 → grandstand, Gate 4 → mounting yard) are in. Still to trace on the 3D tiles (in-app `Shift+W` capture): the railway station → Gate 4 approach and the infield car park → grandstand tunnel crossing |
| Doomben railway station POI | Small | No `doomben-station` POI exists yet (Eagle Farm has `ascot-station`). Add it and link the train transport option to it, to anchor the station → Gate 4 hero route |
| Collapsed-drawer nested buttons | Small | The resting desktop drawer and mobile header in `ContextDrawer.tsx` wrap `TrackSwitcher`'s buttons inside a `role="button"` container — nested interactive elements that misdirect clicks and hurt a11y. Restructure so the switcher and the open/expand affordance aren't nested |

## Future

| Phase | Focus |
|-------|-------|
| 4 | Multi-track expansion — more tracks beyond Eagle Farm and Doomben (Flemington next). The track picker, in-map switcher, and `?track=` routing are already shipped |
| — | First Furlong integration — deep links from firstfurlong.app track profiles |

## Product focus

The current strategy is to prove the Eagle Farm wedge before expanding: help first-time or low-frequency racegoers arrive confidently, understand the venue quickly, and know where to enter, watch, eat, and move around.

Multi-track expansion remains valuable, but it is deliberately behind Eagle Farm event-day usefulness and validation.

## Tech stack

React 18 + TypeScript, Vite, Tailwind CSS v4, CesiumJS, Framer Motion. Hosted on Vercel.
