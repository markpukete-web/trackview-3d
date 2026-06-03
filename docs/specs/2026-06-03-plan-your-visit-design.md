# Plan Your Visit — Race-Day Guidance (v1) — Design Spec

- **Date:** 2026-06-03
- **Status:** Spec reviewed and approved — ready for implementation plan
- **Phase:** Event-day mode (evergreen scope) — Eagle Farm depth
- **Brainstormed with:** Mark

## Summary

Add a **"Plan Your Visit"** layer that helps first-time and low-frequency racegoers know what to
expect *before they arrive* on a race day. It is **evergreen and educational** — stable facts about
the venue (dress code, gates and arrival timing, entry essentials), held as static content in the
track config. No backend, no live feed, no event-specific dates. It surfaces as a new tab in the
existing ContextDrawer and is multi-track-ready, but only Eagle Farm gets content in v1.

This deepens the core Eagle Farm wedge ("arrive confidently") rather than expanding to new tracks,
consistent with the ROADMAP product focus.

## Goals

- Answer the three highest-anxiety first-timer questions: *What do I wear? Which gate, and when?
  What do I need to bring / can't I bring?*
- Stay within the "static TypeScript config, no backend" architecture.
- Reuse existing drawer/tab and POI-linking patterns — no new dependencies, no new interaction models.
- Be multi-track-ready by data shape, so Doomben (or future tracks) can add content with zero code change.

## Non-goals (v1)

- **Event-specific data** — no dates, no specific meetings (e.g. "Stradbroke Day, 14 Jun"), no
  per-day gate times. (Deferred "event-specific" path.)
- **Transport & road closures** — already covered comprehensively by the **Getting Here** tab;
  duplicating it here is out of scope.
- **Map re-theming / a "race-day mode"** — no map highlight/dim behaviour (the richer Approach C).
- **A discovery-bar entry chip** — the tab alone is the entry point in v1.
- **Doomben content** — structure supports it; copy comes later.

## Scope decisions (settled during brainstorming)

| Decision | Choice |
|---|---|
| Kind of event-day mode | Evergreen / educational (static config, always accurate) |
| v1 content elements | Dress code · Gates & arrival timing · Entry essentials |
| Surfacing | New drawer tab, **"Plan Your Visit"** |
| Data interactivity | Structured config + gate→POI "Show on map" links (Approach A) |
| Track scope | Eagle Farm content first; multi-track-ready data shape |

## Data model

`src/types/track.ts` — add an optional section, using the same shape language as
`TrackTransport` / `TrackAccessibility` (summary + arrays of line items + optional notes/tips):

```ts
// --- Plan Your Visit (evergreen race-day guidance) ---

export interface RaceDayDressCode {
  /** One-line overview of the general expectation. */
  summary: string;
  /** Standards per area / enclosure. */
  areas: { area: string; standard: string; notes?: string }[];
  /** Optional general tips (e.g. "a hat and sunscreen in summer"). */
  tips?: string[];
}

export interface RaceDayArrival {
  summary: string;
  /** Entry points. A gate may link to an existing gate POI for "Show on map". */
  gates: { name: string; detail: string; poiId?: string }[];
  /** When to arrive, queues, entry flow. */
  tips?: string[];
}

export interface RaceDayEntry {
  /** Ticket / enclosure types, if worth explaining. */
  ticketTypes?: { name: string; detail: string }[];
  /** Bring / don't-bring line items (bag policy, prohibited items, what to pack). */
  items: string[];
  /** Cash vs card / ATMs. */
  payment?: string;
  notes?: string;
}

export interface TrackRaceDayInfo {
  /** Short intro shown at the top of the tab. */
  intro?: string;
  dressCode?: RaceDayDressCode;
  arrival?: RaceDayArrival;
  entry?: RaceDayEntry;
}
```

```ts
// on TrackConfig, alongside transport? / accessibility? / routes? / tours?
raceDay?: TrackRaceDayInfo;
```

Every sub-section is optional and rendered only when present, so partial content degrades gracefully.

## UI / Components

### `ContextDrawer.tsx`

- Extend `DrawerTab`: `'explore' | 'getting-here' | 'plan-your-visit'`.
- Make the tab list **track-aware**: the static `TABS` constant becomes a small helper that appends
  `{ id: 'plan-your-visit', label: 'Plan Your Visit' }` only when `track.raceDay` is present.
  Eagle Farm shows 3 tabs; Doomben shows 2 (no empty tab).
- The `DrawerBody` explore/getting-here ternary becomes a 3-way switch; `'plan-your-visit'` renders
  the new tab. Pass `track` and an `onPOIClick` (the existing handler) for gate map-focus.

### `PlanYourVisitTab.tsx` (new)

Mirrors `GettingHereTab` structure exactly: `flex flex-col gap-6`, `border-t border-stone-100`
section dividers, `text-xs font-semibold text-stone-500 uppercase tracking-wide` headings, bulleted
line items, amber "Heads up" callouts for warnings, and `lucide-react` icons. `memo`-wrapped like
the other tabs.

Three sections, each rendered only if its data exists:

1. **Dress code** — `summary`, then one block per `area` (area name + standard + optional notes),
   optional `tips` as a bulleted list.
2. **Gates & arrival** — `summary`, then one row per gate (name + detail). A gate with a `poiId`
   gets a **"Show on map"** button styled like the walking-routes button (`Map` icon), calling
   `onPOIClick(poi)` to fly the camera there. Optional `tips`.
3. **Entry essentials** — optional `ticketTypes`, the `items` bring/don't-bring list, optional
   `payment` and `notes`.

### `TrackExperience.tsx`

- `activeTab` is already typed `DrawerTab`; the new union member flows through existing handlers,
  which default to `'explore'` on filter/search/tour actions — no behavioural change needed there.
- The gate "Show on map" reuses `handlePOIClick`, which already selects the POI and flies the camera.

## Content (Eagle Farm)

Author the `raceDay` block in `src/data/tracks/eagle-farm.ts`.

**Sourcing policy:** real standards (dress code by enclosure, which gates, typical open/arrival
guidance, bag policy) must come from **BRC sources (brc.com.au) and be fact-checked**, exactly like
the existing POI data which CLAUDE.md notes is "fact-checked against BRC sources."

**v1 default (overridable):** ship **clearly-marked DRAFT copy** — structurally complete and
plausible, but every block flagged for verification — so the tab is fully buildable and demoable
immediately. A distinct **fact-check task gates launch**; no unverified fact ships to production
unmarked. (Alternative if preferred: structure-only, Mark authors all copy — tab not demoable until
filled.)

## Multi-track behaviour

- Doomben omits `raceDay`; its tab simply does not render. Content can be added later with no code change.
- Switching track via `TrackSwitcher` remounts `TrackExperience` (`key={trackId}` in `App.tsx`), so
  `activeTab` resets to `'explore'` — no stale "active tab that no longer exists" edge case.

## Edge cases / accessibility / motion

- **Reduced motion:** content is static; no orbit/animation concerns. Tab switching uses the existing
  drawer transitions.
- **Mobile bottom sheet:** 3 tabs fit within the existing `TabBar` layout (`px-3 py-2 text-xs`); verify
  no wrap on small viewports.
- **Keyboard / focus:** tab button and "Show on map" buttons reuse the existing `focus-visible:ring`
  patterns and `aria-pressed` semantics from `TabBar` / routes.
- **Partial content:** any missing sub-section (e.g. no `entry`) is omitted; an entirely missing
  `raceDay` hides the tab.

## Validation / testing

- `npm run build` (the stricter check per the run-build-before-push rule) + `tsc --noEmit` + `eslint`.
- Optionally extend `src/data/tracks/validate.ts` to assert every gate `poiId` resolves to a real POI
  in the same track (fail fast on typos), consistent with the existing config validator.
- Manual checklist:
  - Eagle Farm: "Plan Your Visit" tab present, all three sections render.
  - Doomben: tab absent (no `raceDay`).
  - Gate "Show on map" selects the POI and flies the camera.
  - Mobile bottom sheet: 3 tabs, no wrap; sections scroll cleanly.
  - Switch Eagle Farm → Doomben while on the new tab: returns to a valid tab, no error.

## Files touched

- `src/types/track.ts` — new interfaces + `raceDay?` on `TrackConfig`.
- `src/components/UI/ContextDrawer.tsx` — `DrawerTab`, track-aware tabs, `DrawerBody` switch.
- `src/components/UI/PlanYourVisitTab.tsx` — **new** presentational tab.
- `src/data/tracks/eagle-farm.ts` — `raceDay` content (DRAFT, to fact-check).
- `src/data/tracks/validate.ts` — *(optional)* gate `poiId` validation.
- `README.md` / `ROADMAP.md` — note the shipped tab once done.

## Out of scope / future

- Event-specific mode (real dated meetings, per-day times) — the natural next iteration.
- Race-day transport & closures surfaced here (currently in Getting Here).
- Race-day map mode (highlight gates / dim non-essentials).
- "Plan your visit" discovery-bar entry chip for prominence.
- Doomben (and future track) content.

## Resolved decisions

1. **Content sourcing** — DRAFT copy now, with a separate fact-check task gating launch. *(Confirmed 2026-06-03.)*
2. **Tab order** — "Plan Your Visit" sits last: Explore · Getting Here · Plan Your Visit. *(Confirmed 2026-06-03.)*
