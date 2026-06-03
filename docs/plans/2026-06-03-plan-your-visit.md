# Plan Your Visit — Race-Day Guidance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an evergreen "Plan Your Visit" drawer tab (dress code, gates & arrival, entry essentials) so first-time racegoers know what to expect before a race day, starting with Eagle Farm.

**Architecture:** A new optional `raceDay` section on `TrackConfig` (static, config-driven, no backend), rendered by a new presentational `PlanYourVisitTab` that mirrors `GettingHereTab`, surfaced as a third `ContextDrawer` tab that only appears when a track has `raceDay` content. Gates can link to existing gate POIs via the established `onPOIClick` pattern.

**Tech Stack:** React 18 + TypeScript, Tailwind CSS v4, `lucide-react`, Vite. CesiumJS underneath (untouched here).

**Spec:** `docs/specs/2026-06-03-plan-your-visit-design.md`

---

## Testing approach (read first)

This project has **no unit-test framework** (no vitest/jest, no test deps) and is verified the way the rest of the app is:

- **`npm run check`** — `tsc --noEmit`, the fast type gate for each task.
- **`npm run lint`** — ESLint.
- **`npm run build`** — `tsc -b && vite build`, the stricter gate (run before pushing; see project memory).
- **Runtime config validator** — `validateTracks(tracks)` runs at module load (`src/data/tracks/index.ts:27`) and **throws** on bad POI references. We use this for a real red/green in Task 5 via the dev server.
- **Manual browser checklist** — for the presentational/UX parts (the norm for this Cesium app).

Do **not** add a test framework — it is out of scope for this feature.

---

## File structure

| File | Responsibility | Change |
|---|---|---|
| `src/types/track.ts` | Track data model | Add `TrackRaceDayInfo` + sub-interfaces; `raceDay?` on `TrackConfig` |
| `src/components/UI/PlanYourVisitTab.tsx` | Render the race-day guidance | **Create** |
| `src/components/UI/ContextDrawer.tsx` | Drawer tabs + routing | Extend `DrawerTab`, track-aware tab list, render new tab |
| `src/data/tracks/eagle-farm.ts` | Eagle Farm content | Add DRAFT `raceDay` block |
| `src/data/tracks/validate.ts` | Config integrity | Validate gate `poiId` references |
| `ROADMAP.md`, `README.md` | Docs | Note the shipped tab + fact-check follow-up |

---

## Task 1: Add the `raceDay` data model

**Files:**
- Modify: `src/types/track.ts` (add interfaces before `// --- Track Config ---`; add field on `TrackConfig`)

- [ ] **Step 1: Add the race-day interfaces**

In `src/types/track.ts`, immediately after the `WalkingRoute` interface (the `// --- Walking Routes ---` block) and before `// --- Track Config ---`, insert:

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
  /** One-line overview of arriving on a race day. */
  summary: string;
  /** Entry points. A gate may link to a gate POI for "Show on map". */
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
  /** Short intro shown at the top of the Plan Your Visit tab. */
  intro?: string;
  dressCode?: RaceDayDressCode;
  arrival?: RaceDayArrival;
  entry?: RaceDayEntry;
}
```

- [ ] **Step 2: Add the field to `TrackConfig`**

In the same file, inside `interface TrackConfig`, add `raceDay` right after the existing `routes?: WalkingRoute[];` line:

```ts
  routes?: WalkingRoute[];
  raceDay?: TrackRaceDayInfo;
```

- [ ] **Step 3: Type-check**

Run: `npm run check`
Expected: completes with no output (exit 0). Nothing consumes `raceDay` yet, so this only confirms the types compile.

- [ ] **Step 4: Commit**

```bash
git add src/types/track.ts
git commit -m "feat(visit): add raceDay data model to TrackConfig"
```

---

## Task 2: Create the `PlanYourVisitTab` component

**Files:**
- Create: `src/components/UI/PlanYourVisitTab.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/UI/PlanYourVisitTab.tsx` with the full contents below. It mirrors `GettingHereTab`'s section/list/card styling and uses only the `Map` icon (already used elsewhere, so guaranteed available in this `lucide-react` version):

```tsx
import { memo } from 'react';
import { Map } from 'lucide-react';
import { PointOfInterest, TrackRaceDayInfo } from '../../types/track';

interface PlanYourVisitTabProps {
  raceDay: TrackRaceDayInfo;
  /** All POIs for the track — used to resolve a gate's poiId for "Show on map". */
  pois: PointOfInterest[];
  onPOIClick: (poi: PointOfInterest) => void;
}

function PlanYourVisitTab({ raceDay, pois, onPOIClick }: PlanYourVisitTabProps) {
  const { intro, dressCode, arrival, entry } = raceDay;

  return (
    <div className="flex flex-col gap-6 pb-6">
      {intro && <p className="text-sm text-stone-600 leading-relaxed">{intro}</p>}

      {/* Dress code */}
      {dressCode && (
        <section>
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
            Dress Code
          </h3>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-stone-600 leading-relaxed">{dressCode.summary}</p>
            <div className="flex flex-col gap-3">
              {dressCode.areas.map((area, i) => (
                <div key={i} className="rounded-lg border border-stone-200 bg-white p-3">
                  <p className="text-sm font-semibold text-stone-800">{area.area}</p>
                  <p className="text-sm text-stone-500 leading-relaxed mt-0.5">{area.standard}</p>
                  {area.notes && (
                    <p className="text-xs text-stone-400 leading-relaxed mt-1.5">{area.notes}</p>
                  )}
                </div>
              ))}
            </div>
            {dressCode.tips && dressCode.tips.length > 0 && (
              <ul className="space-y-1.5">
                {dressCode.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-stone-500 leading-relaxed">
                    <span className="text-stone-300 flex-shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Gates & arrival */}
      {arrival && (
        <section className="pt-1 border-t border-stone-100">
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3 pt-4">
            Gates &amp; Arrival
          </h3>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-stone-600 leading-relaxed">{arrival.summary}</p>
            <div className="flex flex-col gap-3">
              {arrival.gates.map((gate, i) => {
                const poi = gate.poiId ? pois.find((p) => p.id === gate.poiId) : undefined;
                return (
                  <div
                    key={i}
                    className="flex justify-between items-start gap-4 rounded-lg border border-stone-200 bg-white p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-800">{gate.name}</p>
                      <p className="text-sm text-stone-500 leading-relaxed mt-0.5">{gate.detail}</p>
                    </div>
                    {poi && (
                      <button
                        type="button"
                        onClick={() => onPOIClick(poi)}
                        className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--track-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
                      >
                        <Map className="w-3.5 h-3.5" />
                        Show on map
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {arrival.tips && arrival.tips.length > 0 && (
              <ul className="space-y-1.5">
                {arrival.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-stone-500 leading-relaxed">
                    <span className="text-stone-300 flex-shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Entry essentials */}
      {entry && (
        <section className="pt-1 border-t border-stone-100">
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3 pt-4">
            Entry Essentials
          </h3>
          <div className="flex flex-col gap-4">
            {entry.ticketTypes && entry.ticketTypes.length > 0 && (
              <div className="flex flex-col gap-3">
                {entry.ticketTypes.map((t, i) => (
                  <div key={i}>
                    <p className="text-sm font-semibold text-stone-800">{t.name}</p>
                    <p className="text-sm text-stone-500 leading-relaxed mt-0.5">{t.detail}</p>
                  </div>
                ))}
              </div>
            )}
            {entry.items.length > 0 && (
              <ul className="space-y-1.5">
                {entry.items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-stone-500 leading-relaxed">
                    <span className="text-stone-300 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {entry.payment && (
              <p className="text-sm text-stone-500 leading-relaxed">{entry.payment}</p>
            )}
            {entry.notes && (
              <p className="text-xs text-stone-400 leading-relaxed p-3 bg-stone-50 rounded-lg">
                {entry.notes}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default memo(PlanYourVisitTab);
```

- [ ] **Step 2: Type-check and lint**

Run: `npm run check && npm run lint`
Expected: both pass with no output. The component is not imported anywhere yet — `tsc` still type-checks it (it is inside `src/`), confirming it compiles. It will not render until Task 4.

- [ ] **Step 3: Commit**

```bash
git add src/components/UI/PlanYourVisitTab.tsx
git commit -m "feat(visit): add PlanYourVisitTab presentational component"
```

---

## Task 3: Add Eagle Farm DRAFT content

**Files:**
- Modify: `src/data/tracks/eagle-farm.ts` (add a `raceDay` property to the `eagleFarm` config object)

The gate `poiId`s below (`gate-4`, `main-entrance`, `members-reserve-entry`) are real POI ids already present in this file.

- [ ] **Step 1: Add the `raceDay` block**

In `src/data/tracks/eagle-farm.ts`, add the following property to the `eagleFarm` `TrackConfig` object, as a sibling of `transport`, `accessibility`, and `routes` (placing it right after the `routes` array is fine). Keep the leading DRAFT comment:

```ts
  // DRAFT content — verify every detail against brc.com.au before launch.
  // Tracked by Task 7 (fact-check); do not ship unverified.
  raceDay: {
    intro:
      'A quick guide to arriving at Eagle Farm on a race day — what to wear, where to come in, and what to bring.',
    dressCode: {
      summary:
        'Eagle Farm is relaxed in the public areas and a little dressier in the members and premium spaces. Smart casual is a safe choice almost anywhere.',
      areas: [
        {
          area: 'General Admission',
          standard:
            'Neat casual — clean, tidy clothing and enclosed shoes or smart sandals are fine.',
          notes: 'Avoid offensive slogans; sports singlets and thongs may be knocked back on feature days.',
        },
        {
          area: "Members' Reserve & premium dining",
          standard:
            'Smart elegant — a collared shirt with tailored shorts or trousers, or a dress. Jackets optional.',
          notes: 'Premium marquees and dining packages can set a stricter standard — check your ticket.',
        },
      ],
      tips: [
        'Brisbane sun is strong — a hat and sunscreen go a long way at an open-air track.',
        'Lawns can be soft after rain; a block heel copes better than a stiletto.',
      ],
    },
    arrival: {
      summary:
        'Most general-admission racegoers come in through Gate 4 off Racecourse Road, a short walk from Ascot station.',
      gates: [
        {
          name: 'Gate 4 — main public entry',
          detail: 'The main general-admission gate, closest to Ascot train station and the public lawns.',
          poiId: 'gate-4',
        },
        {
          name: 'Main Entrance',
          detail: 'The front entrance off Racecourse Road — handy if you are dropped off or walking from the south.',
          poiId: 'main-entrance',
        },
        {
          name: "Members' Reserve entry",
          detail: 'Dedicated entry for members and premium ticket holders, leading straight to the members areas.',
          poiId: 'members-reserve-entry',
        },
      ],
      tips: [
        'Gates usually open well before the first race — arriving 45–60 minutes early beats the queues.',
        'Have your ticket (printed or on your phone) ready to scan at the gate.',
      ],
    },
    entry: {
      ticketTypes: [
        {
          name: 'General Admission',
          detail: 'Access to the public lawns, grandstand concourses, and most bars and food outlets.',
        },
        {
          name: 'Members & premium',
          detail: 'Adds the members areas and any dining or marquee package you have booked.',
        },
      ],
      items: [
        'Travel light — small bags are usually fine, but large bags and eskies are typically not permitted.',
        'No BYO alcohol; drinks are available inside the course.',
        'An empty reusable water bottle to refill is handy on hot days.',
      ],
      payment:
        'The course is effectively cashless — bring a card or your phone for taps; ATMs are limited.',
      notes:
        'DRAFT — gate, ticket, bag, and dress details must be confirmed against current brc.com.au race-day information before this ships.',
    },
  },
```

- [ ] **Step 2: Type-check**

Run: `npm run check`
Expected: passes with no output. This confirms the content conforms to the `TrackRaceDayInfo` type from Task 1 (wrong field names or shapes would fail here).

- [ ] **Step 3: Commit**

```bash
git add src/data/tracks/eagle-farm.ts
git commit -m "feat(visit): add Eagle Farm Plan Your Visit DRAFT content"
```

---

## Task 4: Wire the tab into `ContextDrawer`

**Files:**
- Modify: `src/components/UI/ContextDrawer.tsx`

- [ ] **Step 1: Import the new tab**

In `src/components/UI/ContextDrawer.tsx`, add the import next to the other tab imports (after the `GettingHereTab` import, ~line 14):

```ts
import PlanYourVisitTab from './PlanYourVisitTab';
```

- [ ] **Step 2: Extend the `DrawerTab` union**

Replace the existing `DrawerTab` type (~line 20):

```ts
export type DrawerTab = 'explore' | 'getting-here';
```

with:

```ts
export type DrawerTab = 'explore' | 'getting-here' | 'plan-your-visit';
```

- [ ] **Step 3: Make the tab list track-aware**

Replace the module-level `TABS` constant (~lines 68–71):

```ts
const TABS: { id: DrawerTab; label: string }[] = [
  { id: 'explore', label: 'Explore' },
  { id: 'getting-here', label: 'Getting Here' },
];
```

with a base list plus a helper that appends "Plan Your Visit" only when the track has `raceDay`:

```ts
const BASE_TABS: { id: DrawerTab; label: string }[] = [
  { id: 'explore', label: 'Explore' },
  { id: 'getting-here', label: 'Getting Here' },
];

function tabsForTrack(track: TrackConfig): { id: DrawerTab; label: string }[] {
  if (!track.raceDay) return BASE_TABS;
  return [...BASE_TABS, { id: 'plan-your-visit', label: 'Plan Your Visit' }];
}
```

- [ ] **Step 4: Have `TabBar` take the tab list as a prop**

Replace the entire `TabBar` function (~lines 444–467) with a version that maps over a `tabs` prop instead of the module constant:

```tsx
function TabBar({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: { id: DrawerTab; label: string }[];
  activeTab: DrawerTab;
  onTabChange: (tab: DrawerTab) => void;
}) {
  return (
    <div className="flex flex-shrink-0 border-b border-stone-200 px-4">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            type="button"
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            aria-pressed={isActive}
            className={`-mb-px border-b-2 px-3 py-2 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--track-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none ${
              isActive
                ? 'border-[var(--track-brand)] text-[var(--track-brand)]'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 5: Render the tab list and route the new tab in `DrawerBody`**

In `DrawerBody`, replace the render block (the `<TabBar ... />` line plus the `activeTab === 'explore' ? ... : ...` ternary, ~lines 529–559):

```tsx
  return (
    <>
      <TabBar activeTab={activeTab} onTabChange={onTabChange} />
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'explore' ? (
          <ExploreTab
            pois={pois}
            selectedPOI={selectedPOI}
            resultSummary={resultSummary}
            hasActiveFilter={hasActiveFilter}
            onClearFilter={onClearFilter}
            onPOIClick={onPOIClick}
            onPOIClose={onPOIClose}
            onPOIViewOnMap={onPOIViewOnMap}
            trackId={track.id}
          />
        ) : (
          <GettingHereTab
            weather={weather}
            weatherLoading={weatherLoading}
            weatherError={weatherError}
            track={track}
            activeRouteId={activeRouteId}
            onRouteSelect={onRouteSelect}
            tourAvailable={tourAvailable}
            tourMinutes={tourMinutes}
            onResetTourIntro={onResetTourIntro}
          />
        )}
      </div>
    </>
  );
```

with:

```tsx
  return (
    <>
      <TabBar tabs={tabsForTrack(track)} activeTab={activeTab} onTabChange={onTabChange} />
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'explore' && (
          <ExploreTab
            pois={pois}
            selectedPOI={selectedPOI}
            resultSummary={resultSummary}
            hasActiveFilter={hasActiveFilter}
            onClearFilter={onClearFilter}
            onPOIClick={onPOIClick}
            onPOIClose={onPOIClose}
            onPOIViewOnMap={onPOIViewOnMap}
            trackId={track.id}
          />
        )}
        {activeTab === 'getting-here' && (
          <GettingHereTab
            weather={weather}
            weatherLoading={weatherLoading}
            weatherError={weatherError}
            track={track}
            activeRouteId={activeRouteId}
            onRouteSelect={onRouteSelect}
            tourAvailable={tourAvailable}
            tourMinutes={tourMinutes}
            onResetTourIntro={onResetTourIntro}
          />
        )}
        {activeTab === 'plan-your-visit' && track.raceDay && (
          <PlanYourVisitTab
            raceDay={track.raceDay}
            pois={track.pois}
            onPOIClick={onPOIClick}
          />
        )}
      </div>
    </>
  );
```

Note: `pois={track.pois}` deliberately uses **all** track POIs (not the filtered `pois` prop) so gate links resolve regardless of any active filter.

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: `tsc -b` passes and `vite build` completes with no errors.

- [ ] **Step 7: Manual check in the browser**

Run: `npm run dev`, then open `http://localhost:5173/?track=eagle-farm`.
Expected:
- Open the details drawer — a third tab **"Plan Your Visit"** appears after "Getting Here".
- It shows three sections: Dress Code, Gates & Arrival, Entry Essentials.
- Each gate row has a **"Show on map"** button; clicking one flies the camera to that gate and selects it.
- Now open `http://localhost:5173/?track=doomben` — the drawer shows only **two** tabs (no "Plan Your Visit"), because Doomben has no `raceDay`.
- On a narrow viewport (DevTools mobile), the three tabs fit on one row in the bottom sheet without wrapping.

- [ ] **Step 8: Commit**

```bash
git add src/components/UI/ContextDrawer.tsx
git commit -m "feat(visit): surface Plan Your Visit as a track-aware drawer tab"
```

---

## Task 5: Validate gate POI references

**Files:**
- Modify: `src/data/tracks/validate.ts`

- [ ] **Step 1: Add the gate validation loop**

In `src/data/tracks/validate.ts`, inside `validateTrack`, add the following loop immediately after the `for (const route of track.routes ?? [])` block and before the `for (const nearby of track.nearbyTracks ?? [])` block:

```ts
  for (const gate of track.raceDay?.arrival?.gates ?? []) {
    if (gate.poiId && !poiIds.has(gate.poiId)) {
      throw new TrackConfigError(
        `${track.id}: race-day gate "${gate.name}" references unknown poiId "${gate.poiId}"`,
      );
    }
  }
```

- [ ] **Step 2: Type-check**

Run: `npm run check`
Expected: passes with no output.

- [ ] **Step 3: Prove the guard fires (RED)**

Temporarily break one gate id: in `src/data/tracks/eagle-farm.ts`, change the Gate 4 `poiId` from `'gate-4'` to `'gate-4-typo'`.
Run: `npm run dev` and load `http://localhost:5173/?track=eagle-farm`.
Expected: the app fails to render and the console / Vite error overlay shows:
`[track config] eagle-farm: race-day gate "Gate 4 — main public entry" references unknown poiId "gate-4-typo"`

- [ ] **Step 4: Restore and confirm (GREEN)**

Revert the `poiId` back to `'gate-4'`.
Reload the page.
Expected: the app loads normally and the Plan Your Visit gates render as before.

- [ ] **Step 5: Commit**

```bash
git add src/data/tracks/validate.ts
git commit -m "feat(visit): validate race-day gate poiId references at load"
```

---

## Task 6: Update docs and run the full verification sweep

**Files:**
- Modify: `ROADMAP.md`, `README.md`

- [ ] **Step 1: ROADMAP — add to Completed**

In `ROADMAP.md`, add this row to the bottom of the **Completed** table:

```markdown
| 4 (started) | Plan Your Visit — evergreen race-day guidance tab (dress code, gates & arrival, entry essentials) for Eagle Farm; copy is DRAFT pending BRC fact-check |
```

- [ ] **Step 2: ROADMAP — add the fact-check follow-up to Up next**

In `ROADMAP.md`, add this row to the **Up next** table:

```markdown
| Fact-check Plan Your Visit copy | Small | Verify Eagle Farm dress code, gates, and entry details against brc.com.au and replace the DRAFT copy before launch |
```

- [ ] **Step 3: README — list the feature**

In `README.md`, under `## Features`, add a new subsection after the **Guided Tour** section:

```markdown
### Plan Your Visit
- Evergreen race-day guidance for first-time visitors: dress code by area, gates & arrival timing, and entry essentials
- Surfaces as a drawer tab; gate entries link to their map markers ("Show on map")
- Static per-track content — appears only for tracks that have it (Eagle Farm first)
```

- [ ] **Step 4: Full verification sweep**

Run: `npm run check && npm run lint && npm run build`
Expected: all three pass with no errors.

- [ ] **Step 5: Commit**

```bash
git add ROADMAP.md README.md
git commit -m "docs(visit): note Plan Your Visit tab and fact-check follow-up"
```

---

## Task 7: Fact-check and finalise the copy (launch gate)

This is a **content-verification** task, not a code task. It requires authoritative BRC information and should be done by a human (or a sourced research pass) — do not invent facts.

**Files:**
- Modify: `src/data/tracks/eagle-farm.ts` (the `raceDay` block)

- [ ] **Step 1: Gather current race-day facts from brc.com.au**

For Eagle Farm, confirm: dress standards per enclosure (General Admission vs Members/premium), which public/members gates exist and their names, typical gate-open / arrival guidance, bag & prohibited-items policy, ticket/enclosure types, and cash-vs-card. Capture the source URLs.

- [ ] **Step 2: Replace the DRAFT copy**

Update each field in the `raceDay` block to match the verified facts. Correct any gate `name`/`detail`, and ensure each gate `poiId` still matches a real POI id in the file (`gate-4`, `main-entrance`, `members-reserve-entry`, or another existing entry POI).

- [ ] **Step 3: Remove the DRAFT markers**

Delete the two `// DRAFT ...` comment lines above the block, and remove the `notes: 'DRAFT — ...'` line in `entry` (or replace it with a genuine note).

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: passes (the load-time validator confirms every gate `poiId` still resolves).
Then `npm run dev` and re-read the Plan Your Visit tab on `?track=eagle-farm` to confirm the copy reads well.

- [ ] **Step 5: Commit**

```bash
git add src/data/tracks/eagle-farm.ts
git commit -m "content(visit): finalise fact-checked Eagle Farm race-day copy"
```

---

## Self-review (author checklist — already run)

- **Spec coverage:** data model → T1; component → T2; content → T3 (+ fact-check T7); drawer wiring/tab-order/multi-track → T4; validator extension → T5; docs note → T6; verification (build/tsc/lint/manual) → throughout + T6. All spec sections mapped.
- **Placeholders:** none in the plan steps. The only "DRAFT" text is intentional product copy, clearly marked and gated by T7 — not a missing plan step.
- **Type consistency:** `TrackRaceDayInfo` fields (`intro`, `dressCode{summary,areas[{area,standard,notes}],tips}`, `arrival{summary,gates[{name,detail,poiId}],tips}`, `entry{ticketTypes,items,payment,notes}`) are used identically across T2 (render), T3 (content), and T5 (`gate.poiId`, `gate.name`). Component props (`raceDay`, `pois`, `onPOIClick`) match the `DrawerBody` call in T4.

---

## Out of scope (do not build here)

Event-specific dated meetings, race-day transport/closures (already in Getting Here), race-day map re-theming, a discovery-bar entry chip, and Doomben content. No new dependencies, no test framework.
