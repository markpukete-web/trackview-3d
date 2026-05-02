---
title: TrackView3D UI UX Implementation Plan
date: 2026-05-02
project: TrackView3D
type: implementation-plan
status: draft
source_review: "[[TrackView3D UI UX Review - 2026-05-02]]"
tags:
  - trackview3d
  - implementation-plan
  - ux-polish
  - accessibility
  - react
  - cesium
  - codex
---

# TrackView3D UI/UX Implementation Plan

Source review: [[TrackView3D UI UX Review - 2026-05-02]]

## Goal

Polish TrackView3D into a clearer, safer, more accessible map-first experience without changing the product scope or disturbing the existing CesiumJS integration.

The plan optimises for:

- A stronger 3D map-first hierarchy.
- Safer React and TypeScript implementation.
- Better keyboard, screen reader, and touch accessibility.
- Lighter UI animation and overlay cost around Cesium rendering.
- Preserving the current Google Photorealistic 3D Tiles, POI, route, tour, and camera behaviours.

## Non-Goals

- Do not add new product features.
- Do not add Resium.
- Do not suggest Resium.
- Do not replace Cesium.
- Do not redesign the whole app.
- Do not introduce a backend.
- Do not add a multi-track selector yet.
- Do not change Google 3D Tiles loading unless a verified bug requires it.
- Do not remove or hide Google/Cesium attribution.
- Do not hardcode Eagle Farm into shared UI components.
- Preserve config-driven multi-track design.
- Keep Australian English in user-facing copy.
- Do not turn the product toward betting, odds, wagering, or race-picking flows.

## Success Criteria

- On mobile, the 3D map is visibly dominant on first load and remains easy to manipulate.
- The context drawer supports keyboard navigation and exposes clear ARIA state.
- POI filtering is understandable, recoverable, and not colour-only.
- Selected POI state is clear across the list, detail view, map callout, and camera fly-to.
- Weather stays useful but secondary.
- Tour controls are real accessible controls, not nested pseudo-buttons.
- UI animation and blur feel restrained while Cesium tiles, camera, routes, and tours remain smooth.
- Existing behaviours still work: tile loading, attribution, reset view, category visibility, selected POI fly-to, map marker click, guided tour, route show/hide, and camera bounds.
- `npm run check` and `npm run lint` pass.

## Implementation Strategy

Work in small passes. Each pass should keep the app shippable.

Recommended order:

1. Phase 0: Pre-Flight.
2. Phase 1: Accessibility-Safe Layout Pass.
3. Phase 2: Explore and POI Discovery Pass.
4. Phase 3: Tour and Weather Control Pass.
5. Phase 4: Visual Hierarchy and Performance Pass.
6. Phase 5: Verification and QA.

Codex should not skip Phase 0 before implementation work. Pre-flight is where the agent confirms the current worktree state, re-reads the relevant files, and narrows the exact Phase 1 edit scope before touching source.

Avoid combining Cesium camera changes with drawer or accessibility changes in the same commit. The map integration is the riskiest part of the app, so UI-only changes should stay UI-only where possible.

## Phase 0: Pre-Flight

### Tasks

- Read the current UX review note.
- Inspect the current versions of:
  - `src/App.tsx`
  - `src/components/Map/TrackViewer.tsx`
  - `src/components/UI/ContextDrawer.tsx`
  - `src/components/UI/ExploreTab.tsx`
  - `src/components/UI/GettingHereTab.tsx`
  - `src/components/UI/TourBar.tsx`
  - `src/components/UI/TourCard.tsx`
  - `src/components/UI/TourWelcome.tsx`
  - `src/components/UI/TourButton.tsx`
  - `src/components/UI/TourCompletion.tsx`
  - `src/components/UI/WeatherBadge.tsx`
  - `src/components/UI/WeatherSection.tsx`
  - `src/hooks/useTour.ts`
  - `src/hooks/useRouteOverlay.ts`
  - `src/data/tracks/eagle-farm.ts`
- Run `git status --short` and note any unrelated work before editing.
- Confirm whether the local `.env` has `VITE_GOOGLE_MAPS_API_KEY` available for browser verification.

### Acceptance Criteria

- The intended edit scope is clear before code changes begin.
- Any dirty worktree changes are identified and preserved.
- No source file is touched during pre-flight except if explicitly starting Phase 1.

## Phase 1: Accessibility-Safe Layout Pass

Purpose: Improve semantics and reduce the mobile sheet footprint without changing business logic.

### Phase 1 Scope Clarifications

- Phase 1 should focus on low-risk layout and accessibility changes only.
- Treat the mobile sheet height as a layout constant, not a scattered magic number.
- Prefer `min(34vh, 18rem)` for the collapsed mobile sheet starting point.
- If that still feels too dominant on small devices, test `30vh` or `28vh`.
- If reset button positioning changes, avoid duplicating the same sheet-height value across multiple components where practical.
- Add `aria-pressed` to category chips in Phase 1 only if the change is isolated and low-risk.
- Do not implement result count, Show all/Clear filters, selected POI row redesign, TourBar refactor, weather section redesign, or wider visual system changes in Phase 1.
- Defer those to later phases.

### 1.1 Context drawer tabs

Files:

- `src/components/UI/ContextDrawer.tsx`

Tasks:

- Do not add `role="tablist"`, `role="tab"`, or `role="tabpanel"` in Phase 1 unless full arrow-key tab behaviour is implemented in the same pass.
- For Phase 1, prefer native buttons with clear active state, visible focus styles, and either `aria-pressed` or another appropriate accessible active-state indicator.
- Keep the two top-level drawer views simple and predictable.
- Full ARIA tab semantics plus arrow-key navigation can be considered later if the drawer grows beyond two top-level views.

Acceptance criteria:

- Keyboard users can tab to each tab and activate it.
- Screen readers can identify active drawer-view state without overclaiming ARIA tab behaviour.
- No change to active tab state management in `App.tsx`.

### 1.2 Mobile sheet semantics and height

Files:

- `src/components/UI/ContextDrawer.tsx`
- `src/components/Map/TrackViewer.tsx` only if reset positioning must be adjusted.

Tasks:

- Reduce collapsed mobile sheet height from `38vh` to a map-friendlier value.
- Preferred first value: `min(34vh, 18rem)`.
- If that still feels too dominant on small devices, test `30vh` or `28vh`.
- Keep expanded state at `85vh` for now unless testing shows it feels too tall.
- Convert compact `DrawerHeader` from clickable `div` to a real `button`.
- Add `aria-expanded` and `aria-controls` to the sheet toggle.
- Give the sheet content a stable ID.
- Ensure the drag handle remains visual only, or label the toggle clearly through the header button.
- Adjust the reset view button offset if needed after reducing the mobile sheet height.
- Avoid simply replacing one duplicated magic number with another.
- Prefer a named layout constant or CSS custom property where practical.
- If a shared value is not practical in this pass, leave a short code comment explaining the relationship between sheet height and reset button offset.

Acceptance criteria:

- On mobile, the first visible state leaves clearly more map visible than before.
- The sheet can still expand and collapse by tap and drag.
- Reset view remains visible and tappable in collapsed sheet state.
- No regression in map pan, pinch-to-zoom, or rotate gestures.

### 1.3 Icon and compact controls

Files:

- `src/components/UI/WeatherBadge.tsx`
- `src/components/Map/TrackViewer.tsx`

Tasks:

- Add explicit `aria-label` to `WeatherBadge`, such as `View race day weather`.
- Add explicit `aria-label` to `ResetViewButton`, such as `Reset map view`.
- Keep `title` if useful, but do not rely on it as the only accessible name.
- Add `focus-visible` styles to both controls if missing.
- Optionally add `aria-pressed` to category chips in this phase only if the edit is isolated, low-risk, and does not pull result counts or filter-reset behaviour into Phase 1.

Acceptance criteria:

- Icon-style controls have accessible names.
- Focus state is visible against the map.

## Phase 2: Explore and POI Discovery Pass

Purpose: Make POI search, filter, and selection easier to understand and recover from.

### Phase 2 Product Decision: Filter Behaviour

- For beginner-friendly map behaviour, "all category filters off" should be treated as "show all POIs", not "show none".
- Search should still narrow results.
- If search returns no results, the recovery action should be "Clear search".
- Result count should reflect the current visible/search-filtered POIs.
- Do not implement this in Phase 1.

### 2.1 Category filter semantics

Files:

- `src/components/UI/ExploreTab.tsx`
- Optional: `src/components/UI/CategoryFilter.tsx` if the duplicate category-chip pattern is consolidated.

Tasks:

- Add `aria-pressed={isActive}` to each category chip.
- Note: this small attribute-only change may be done in Phase 1 if it is isolated and low-risk. Keep the rest of category filter work in Phase 2.
- Add a non-colour selected affordance, such as:
  - Check icon.
  - Stronger border.
  - `selected` text for screen readers.
- Avoid relying on white text over category colour alone if contrast is weak.
- Ensure chips have mobile-friendly hit areas.

Acceptance criteria:

- Filter state is understandable without relying only on colour.
- Touch targets feel usable on a phone.
- Existing `Set<POICategory>` state remains unchanged.

### 2.2 Result count and reset affordance

Files:

- `src/components/UI/ExploreTab.tsx`

Tasks:

- Add a compact result count near the filter area:
  - Example: `12 places`
  - Example with search: `3 places matching "gate"`
- Add a `Show all` or `Clear filters` control when:
  - No categories are active.
  - Search has no results.
  - Search or category filters have narrowed the list.
- The reset action should:
  - Clear search.
  - Re-enable all available categories.
- If `ExploreTab` does not currently have an `onShowAll` callback, add one carefully through `ContextDrawer` to `App`.

Implementation option:

- Add an `onShowAllCategories` callback in `App.tsx` that sets active categories to all available categories.
- Pass it through `ContextDrawer` to `ExploreTab`.
- Keep this generic and driven by `availableCategories`.

Acceptance criteria:

- Users can recover from hiding all POIs.
- Result count updates as search/category filters change.
- Empty result state has an immediate recovery path.

### 2.3 Selected POI continuity

Files:

- `src/components/UI/ExploreTab.tsx`
- `src/components/Map/TrackViewer.tsx` only if map callout collision needs minor polish.

Tasks:

- Keep or restore a visible selected state on the relevant POI row.
- Consider adding a selected indicator:
  - Left border.
  - Target icon.
  - `Viewing` label.
- Preserve current detail behaviour where selected POI opens `POIDetail`.
- Preserve focus restoration when returning from detail.
- Confirm selected POI still triggers `flyToPOI`.

Acceptance criteria:

- A user can tell which POI is active before and after opening detail.
- Clicking a POI still flies the camera to that location.
- Closing detail still returns focus to the originating POI row.

## Phase 3: Tour and Weather Control Pass

Purpose: Keep guided tour and weather useful while improving semantics and touch reliability.

### 3.1 TourBar nested quick action

Files:

- `src/components/UI/TourBar.tsx`

Tasks:

- Replace the collapsed quick action `span role="button"` with a real `button`.
- Avoid invalid nested interactive controls. Options:
  - Make the collapsed bar a non-button container with separate expand and quick-action buttons.
  - Or keep one button for expand and move the quick action outside it as a sibling.
- Add explicit labels for expand/collapse state.
- Add `aria-expanded` and `aria-controls` for the expanded tour panel.

Acceptance criteria:

- No nested button or pseudo-button pattern remains in `TourBar`.
- Keyboard users can separately expand the tour panel and activate Next/Finish/Plan your arrival.
- Existing tour navigation still works.

### 3.2 TourCard and TourBar control state

Files:

- `src/components/UI/TourCard.tsx`
- `src/components/UI/TourBar.tsx`
- Optional: `src/hooks/useTour.ts` only if UI needs reduced-motion state.

Tasks:

- Add `aria-pressed` to auto-play toggle.
- Add visible focus states to Prev, Next, Auto-play, Finish, End tour, Learn more, and completion actions.
- Consider changing `Prev` to `Previous` if space allows, especially for screen reader clarity.
- Ensure disabled previous control has clear disabled semantics and adequate contrast.
- Do not change tour timing or camera motion unless a bug appears during testing.

Acceptance criteria:

- Auto-play state is clear visually and semantically.
- Tour control keyboard flow is predictable.
- Tour still starts, advances, ends, and completes as before.

### 3.3 Weather badge and weather section

Files:

- `src/components/UI/WeatherBadge.tsx`
- `src/components/UI/GettingHereTab.tsx`
- `src/components/UI/WeatherSection.tsx`

Tasks:

- Add `aria-expanded` and `aria-controls` to the weather toggle in Getting Here.
- Keep weather collapsed by default.
- Keep the weather badge compact and secondary.
- Consider quieter badge styling if it visually competes with map content.
- Keep the official track-condition caveat and Racing Queensland link.
- Ensure the external link has a clear accessible label if needed.

Acceptance criteria:

- Weather remains secondary to transport and wayfinding.
- Weather controls are accessible.
- Weather failure still fails silently or gracefully as currently intended.

## Phase 4: Visual Hierarchy and Performance Pass

Purpose: Make the UI feel calmer and lighter while preserving the premium direction.

Phase 4 may be too broad for one implementation pass. Prefer splitting it into:

- **Phase 4A: Drawer Visual Hierarchy**
- **Phase 4B: Reduced Motion and Performance**
- **Phase 4C: Console and Production Cleanup**, if useful

These should usually be separate commits or separate Codex sessions. Do not combine route pulse changes, loading overlay changes, drawer visual changes, and reduced-motion work in one risky commit unless the edits are very small.

### 4.1 Drawer visual tuning

Files:

- `src/components/UI/ContextDrawer.tsx`
- Related tab components as needed.

Tasks:

- Reduce heavy blur from `backdrop-blur-2xl` to a lighter value if browser testing shows the panel still reads well.
- Slightly reduce shadow intensity if it competes with the map.
- Keep the right-side desktop drawer legible over photorealistic tiles.
- Avoid adding nested cards.
- Keep radius restrained and consistent with the existing design system.

Acceptance criteria:

- The map remains the hero.
- The drawer is readable but not visually louder than the 3D scene.
- Desktop and mobile still feel like the same product.

### 4.2 Reduce unnecessary motion around map interaction

Files:

- `src/components/UI/ExploreTab.tsx`
- `src/components/UI/ContextDrawer.tsx`
- `src/components/Map/TrackViewer.tsx`
- `src/hooks/useRouteOverlay.ts`

Tasks:

- Remove or reduce hover translate on POI rows.
- Prefer colour, outline, or background changes over layout-affecting motion.
- Add reduced-motion variants for:
  - Bottom sheet animation.
  - Loading overlay transition.
  - Progress bar transitions.
  - Route pulsing.
- Keep Cesium camera flights intact unless reduced-motion support already exists for that behaviour.

Acceptance criteria:

- UI feels stable during tile loading and camera motion.
- Reduced-motion users get materially less UI animation.
- Route overlay still reads clearly when active.

### 4.3 Console log cleanup

Files:

- `src/App.tsx`
- `src/hooks/useRouteOverlay.ts`
- Any related files found by `rg "console\\." src`.

Tasks:

- Remove production-noisy logs or gate them behind `import.meta.env.DEV`.
- Keep useful development diagnostics only if they are explicitly dev-gated.

Acceptance criteria:

- Production console is clean for normal app use.
- Dev-only diagnostics remain available if useful.

## Phase 5: Verification and QA

### Static checks

Commands:

```bash
npm run check
npm run lint
```

Acceptance criteria:

- Both commands pass.
- No new TypeScript `any` workarounds are introduced unless already present and justified around Cesium entity metadata.

### Browser verification

Run the dev server:

```bash
npm run dev
```

Desktop viewport checks:

- Initial load shows Eagle Farm and the map is full-screen.
- Google attribution remains visible.
- Drawer appears on right.
- Explore tab search and filters work.
- POI click from list flies camera to selected POI.
- POI click from map opens details.
- Reset view works.
- Weather badge opens Getting Here.
- Route show/hide works.
- Tour starts, advances, ends, and completion actions work.

Mobile viewport checks:

- Initial collapsed sheet leaves the map clearly visible.
- Sheet tap and drag expand/collapse.
- Map pan, pinch-to-zoom, and rotate remain usable.
- Selected POI callout does not collide badly with sheet or badge.
- Category chips are tappable.
- TourBar collapsed and expanded states work.
- TourBar quick action is independently tappable.
- Reset view remains reachable.

Accessibility checks:

- Keyboard tab order is sensible.
- Focus rings are visible on map overlay controls and drawer controls.
- Tabs announce selected state.
- Category chips announce pressed state.
- Weather announces expanded/collapsed state.
- Tour auto-play announces pressed state.
- No obvious colour-only state remains for critical interactions.
- Reduced-motion setting reduces UI motion.

Performance checks:

- Drawer animation does not visibly stutter over the Cesium canvas.
- Loading overlay does not feel heavy during tile loading.
- Route pulse does not continue after route is hidden.
- No unnecessary repeated React re-renders are introduced in map hover or post-render paths.

## Suggested Commit Breakdown

### Commit 1: Accessibility shell

Scope:

- Context drawer tab semantics.
- Mobile sheet toggle button.
- Weather/reset accessible names.
- Basic focus-visible additions.

Suggested message:

```text
fix(a11y): improve drawer and map control semantics
```

### Commit 2: POI discovery polish

Scope:

- Category chip `aria-pressed`.
- Result count.
- Clear/show-all filters.
- Selected POI row state.

Suggested message:

```text
feat(ui): clarify POI filtering and selection
```

### Commit 3: Tour and weather semantics

Scope:

- TourBar real quick-action button.
- Auto-play pressed state.
- Weather toggle expanded state.
- Tour control focus polish.

Suggested message:

```text
fix(a11y): polish tour and weather controls
```

### Commit 4: Visual and performance polish

Scope:

- Lighter blur/shadow.
- Reduced hover movement.
- Reduced-motion handling.
- Dev log cleanup.

Suggested message:

```text
perf(ui): lighten overlays around Cesium map
```

## File-by-File Work Plan

### `src/App.tsx`

Likely changes:

- Add a callback to restore all available POI categories if `ExploreTab` needs a show-all/reset action.
- Gate or remove app-level console logging.

Avoid:

- Changing `track = getTrack(DEFAULT_TRACK_ID)!` in this pass.
- Adding multi-track state.
- Changing tour start/end logic unless required by UI callbacks.

### `src/components/Map/TrackViewer.tsx`

Likely changes:

- Add `aria-label` to reset view button.
- Add stronger focus-visible style to reset view.
- Adjust reset button position if mobile sheet height changes.
- Optionally add reduced-motion handling to loading overlay transition.

Avoid:

- Changing Cesium viewer construction.
- Changing tile loading URL/fallback.
- Changing `showCreditsOnScreen`.
- Changing marker creation, entity metadata, or camera bounds unless required by a verified bug.

### `src/components/UI/ContextDrawer.tsx`

Likely changes:

- Tab semantics.
- Mobile sheet toggle semantics.
- Collapsed mobile height adjustment.
- Drawer blur/shadow tuning.
- Stable IDs for tab panels and sheet content.

Avoid:

- Moving core state out of `App.tsx`.
- Changing tab model beyond `Explore` and `Getting Here`.
- Adding new tab types.

### `src/components/UI/ExploreTab.tsx`

Likely changes:

- Result count.
- Filter reset/show-all.
- `aria-pressed` category chips.
- Selected POI list styling.
- Better empty state.
- Touch target improvements.

Avoid:

- Hardcoding Eagle Farm POI grouping.
- Changing search to a new data model.
- Adding fuzzy search or external dependencies.

### `src/components/UI/GettingHereTab.tsx`

Likely changes:

- Weather toggle ARIA.
- Route button focus/touch polish.
- Accessibility section hierarchy refinements.

Avoid:

- Changing transport data shape unless needed by config-driven improvements.
- Moving weather into a top-level tab.

### `src/components/UI/TourBar.tsx`

Likely changes:

- Replace pseudo-button quick action with real button.
- Add expand/collapse semantics.
- Improve focus-visible states.
- Preserve completion auto-expand behaviour.

Avoid:

- Changing stop timing.
- Changing camera movement.
- Changing completion logic.

### `src/components/UI/TourCard.tsx`

Likely changes:

- Add `aria-pressed` to auto-play.
- Improve focus and disabled states.
- Align control semantics with `TourBar`.

Avoid:

- Changing linked POI detail behaviour.
- Changing tour content.

### `src/components/UI/TourWelcome.tsx`

Likely changes:

- Calmer visual hierarchy.
- Better focus states.
- Ensure dismiss remains accessible and clear.

Avoid:

- Changing localStorage key semantics.

### `src/components/UI/TourButton.tsx`

Likely changes:

- Better focus state.
- Touch target polish.
- Optional lucide icon if consistent with local icon usage.

Avoid:

- Changing completion detection.

### `src/components/UI/TourCompletion.tsx`

Likely changes:

- Better focus states.
- Possible `aria-pressed` or clearer feedback for confidence chips.

Avoid:

- Adding analytics or network calls.

### `src/components/UI/WeatherBadge.tsx`

Likely changes:

- Add `aria-label`.
- Improve focus-visible state.
- Possibly quiet visual style.

Avoid:

- Making weather more prominent.

### `src/components/UI/WeatherSection.tsx`

Likely changes:

- External link accessibility/focus polish.
- Minor contrast improvements.

Avoid:

- Expanding weather into a complex forecast product.

### `src/hooks/useTour.ts`

Likely changes:

- None for the first pass.
- Only touch if reduced-motion state needs to be exposed or if verification reveals a bug.

Avoid:

- Refactoring tour timing.
- Changing orbit logic unless bug-driven.

### `src/hooks/useRouteOverlay.ts`

Likely changes:

- Gate console logs.
- Consider reduced-motion handling for pulse.

Avoid:

- Changing route geometry.
- Changing camera fit unless verified as problematic.

### `src/data/tracks/eagle-farm.ts`

Likely changes:

- None for initial UI implementation.
- Later copy polish only if needed to keep educational tone.
- Potential future use of `accessibleAlternative` for walking routes.

Avoid:

- Moving shared UI decisions into Eagle Farm data.

## Detailed Acceptance Checklist

### Map and Cesium

- [ ] Google 3D tiles load.
- [ ] Globe remains hidden.
- [ ] Google/Cesium attribution remains visible.
- [ ] POI markers render.
- [ ] Category filtering hides/shows map markers.
- [ ] Selected POI fly-to works.
- [ ] Selected POI mobile callout works.
- [ ] Reset view works.
- [ ] Camera bounds still prevent drifting too far.
- [ ] Route overlay appears and disappears.
- [ ] Tour camera movement still works.

### Desktop UI

- [ ] Right drawer remains readable and visually secondary to map.
- [ ] Tabs are keyboard reachable.
- [ ] Active tab state is visible and announced.
- [ ] Explore search works.
- [ ] Category filters are clear and recoverable.
- [ ] POI detail view and back behaviour work.
- [ ] Getting Here content scrolls correctly.
- [ ] Weather remains collapsed by default.

### Mobile UI

- [ ] Collapsed sheet leaves map clearly visible.
- [ ] Expanded sheet remains usable.
- [ ] Sheet toggle is a real accessible button.
- [ ] Sheet drag still works.
- [ ] Map gestures still work.
- [ ] Reset view is not hidden by the sheet.
- [ ] TourBar collapsed and expanded states are usable.
- [ ] Touch targets feel large enough.

### Accessibility

- [ ] No pseudo-buttons remain for critical actions.
- [ ] Icon-only buttons have accessible names.
- [ ] Filter chips use `aria-pressed`.
- [ ] Auto-play uses `aria-pressed`.
- [ ] Expandable sections use `aria-expanded`.
- [ ] Focus-visible styles are clear.
- [ ] Important states are not colour-only.
- [ ] Reduced-motion users get less non-essential motion.

### Performance

- [ ] No obvious stutter from drawer animation.
- [ ] No excessive blur over active map.
- [ ] No production console noise.
- [ ] Route pulse is scoped to active route.
- [ ] No new repeated React state churn on map hover or post-render updates.

## Risk Register

### Risk: Mobile sheet changes hide or collide with map controls

Mitigation:

- Test multiple mobile heights.
- Keep reset button offset tied to a named shared layout constant if possible.
- Check selected POI callout placement after changing sheet height.

### Risk: Tab semantics cause unexpected keyboard behaviour

Mitigation:

- Start with native buttons plus ARIA.
- Avoid custom arrow-key handling unless needed.
- Verify with keyboard before adding complexity.

### Risk: Filter reset requires prop drilling

Mitigation:

- Add the smallest generic callback from `App` to `ExploreTab`.
- Keep state source in `App`.
- Do not introduce global state.

### Risk: TourBar refactor breaks quick action

Mitigation:

- Keep existing callback logic unchanged.
- Change only the HTML structure and semantics.
- Test collapsed Next, Finish, Plan your arrival, expand, collapse, and End tour.

### Risk: Reduced-motion handling changes tour behaviour

Mitigation:

- Do not change `useTour` unless necessary.
- Apply reduced-motion first to UI transitions.
- Preserve existing orbit guard in `useTour`.

### Risk: Visual polish removes too much contrast

Mitigation:

- Check drawer over photorealistic tiles.
- Keep text contrast high.
- Use opacity and blur reductions carefully.

## Previously Identified Small Items

- **Fake drag handle pill**: Optional Phase 1 only if it remains visual-only and does not harm sheet affordance.
- **Redundant "Powered by Google 3D Tiles" label**: May be removed only if it is not required attribution; never remove Google/Cesium required credits.
- **Unused `activeClass` in `CATEGORY_CONFIG`**: Safe cleanup if confirmed unused.
- **Retry button**: Defer to a later error/loading-state pass unless currently broken.
- **Reset View tooltip/accessible name**: Phase 1-aligned; keep `title` if useful but add `aria-label`.
- **`ROADMAP.md` cleanup**: Documentation hygiene only. Do it in a separate docs branch/commit, not inside Phase 1 UI implementation.

## Implementation Prompt for Codex

```markdown
Implement Phase 1 only from:
docs/obsidian/TrackView3D UI UX Implementation Plan - 2026-05-02.md

Also apply these clarifications:
- Treat mobile sheet height as a layout constant, not a scattered magic number.
- Use min(34vh, 18rem) as the preferred mobile collapsed sheet starting point.
- If that still feels too dominant on small devices, test 30vh or 28vh.
- If reset button positioning changes, avoid duplicating the same height value in multiple components where practical.
- Do not add ARIA tab roles unless also implementing arrow-key navigation.
- Prefer native button active-state semantics for the two drawer views in Phase 1.
- Add aria-pressed to category chips only if the change is isolated and low-risk.
- Do not implement Phase 2 filter behaviour changes yet.
- Do not include ROADMAP.md cleanup in Phase 1.
- Do not implement result count, Show all/Clear filters, selected POI row redesign, TourBar refactor, weather section redesign, or visual system changes in this pass.

Scope:
- Context drawer native button active-state semantics.
- Mobile sheet toggle semantics.
- Mobile collapsed sheet height reduction.
- Weather badge aria-label.
- Reset view aria-label.
- Focus-visible polish for map overlay controls where safe.
- Optional low-risk category chip aria-pressed.
- No Cesium lifecycle changes.

Guardrails:
- Do not add Resium.
- Do not replace Cesium.
- Do not change Google 3D Tiles loading.
- Do not remove or hide Google/Cesium attribution.
- Do not hardcode Eagle Farm into shared components.
- Preserve POI markers, selected POI fly-to, route overlays, tour behaviour, mobile gestures, weather, and camera bounds.

Before editing:
- Run git status --short.
- Inspect relevant files.
- Summarise the exact Phase 1 changes you will make.

After editing:
- Run npm run check.
- Run npm run lint.
- Run npm run build if practical.
- Summarise changed files, validation results, and anything deferred to Phase 2.
```

## Notes for Future Passes

- Intent-based POI grouping should be config-driven, not Eagle Farm-specific.
- Route accessibility alternatives can use the existing `accessibleAlternative` field later.
- Multi-track selection should wait until the Eagle Farm experience feels polished.
- Weather should stay a compact arrival aid, not a full forecast feature.
- The long-term product direction remains: premium venue navigation, Australian racing education, beginner-friendly wayfinding, map-first, not gambling-focused.
