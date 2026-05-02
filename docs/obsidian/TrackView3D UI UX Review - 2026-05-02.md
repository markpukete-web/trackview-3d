---
title: TrackView3D UI UX Review
date: 2026-05-02
project: TrackView3D
type: ux-review
status: draft
tags:
  - trackview3d
  - ux-review
  - codex
  - react
  - cesium
---

# TrackView3D UI/UX Review

## Working Lenses

- **Senior React + TypeScript engineer**: Review state ownership, component boundaries, event handling, and implementation risk.
- **UI/UX product designer for map-first web apps**: Judge whether the 3D racecourse remains the primary surface and whether overlays support wayfinding without crowding the map.
- **Cesium/map integration engineer**: Protect the direct CesiumJS viewer setup, Google Photorealistic 3D Tiles loading, POI entity behaviour, camera controls, and attribution.
- **Accessibility reviewer**: Check keyboard paths, focus, semantics, labels, touch targets, contrast, and reduced-motion behaviour.
- **Frontend performance reviewer**: Look for overlay animation, backdrop blur, list, and camera interaction choices that could compete with Cesium rendering.

Related notes: [[TrackView3D]], [[Eagle Farm Racecourse]], [[First Furlong]], [[CesiumJS]], [[Google 3D Tiles]].

## Current State Summary

TrackView3D is already architected as a map-first, full-screen web app. `src/App.tsx` renders `TrackViewer` as the base layer, then layers loading/error UI, the weather badge, and `ContextDrawer` on top. Track identity, POIs, transport, accessibility, tour stops, walking routes, camera defaults, bounds, and brand colour are driven from `src/data/tracks/eagle-farm.ts`.

The Cesium implementation is intentionally direct. `src/components/Map/TrackViewer.tsx` creates a `Viewer` inside a React effect, hides the globe, enables `requestRenderMode`, loads Google Photorealistic 3D Tiles with a manual URL fallback, sets `showCreditsOnScreen = true`, adds POI billboards/labels as Cesium entities, and drives selected POI fly-to behaviour from React state.

The UI is split into two main drawer tabs:

- **Explore**: first-time tour prompt, guided tour button, search, category filters, POI list, and POI detail view.
- **Getting Here**: transport groups, walking routes, accessibility information, and collapsible weather.

Desktop uses a translucent right-side drawer. Mobile uses a fixed bottom sheet at either `38vh` or `85vh`, with a separate `TourBar` during active tours. The core experience is promising: it feels like a premium venue-navigation companion rather than a static directory. The main opportunity is to make the surrounding UI calmer, more semantic, more keyboard/touch reliable, and less visually competitive with the 3D map.

## Top 5 UX Problems

### 1. The mobile bottom sheet covers too much of the map by default

- **Problem**: The collapsed mobile sheet is fixed at `38vh`, and the expanded state reaches `85vh`. On small portrait screens, that leaves limited space for the 3D course and can make the map feel secondary.
- **Evidence from the codebase**: `ContextDrawer` animates mobile height between `38vh` and `85vh` in `src/components/UI/ContextDrawer.tsx:164-169`. `ResetViewButton` is manually positioned above the `38vh` sheet in `src/components/Map/TrackViewer.tsx:525-531`.
- **User impact**: First-time users may read the drawer before understanding the spatial context. Map gestures, selected POI callouts, and camera motion can feel cramped.
- **Severity**: High

### 2. Drawer and tour controls need stronger semantic accessibility

- **Problem**: Tabs are plain buttons without tab semantics, the mobile drawer header is a clickable `div`, the mobile tour quick action is a `span role="button"`, and several icon/visual controls rely on `title` or visible text only.
- **Evidence from the codebase**: `TabBar` renders buttons without `role="tablist"`/`aria-selected` in `src/components/UI/ContextDrawer.tsx:240-260`; compact `DrawerHeader` uses `onClick` on a `div` in `src/components/UI/ContextDrawer.tsx:211-221`; `TourBar` uses `<span role="button">` for a nested quick action in `src/components/UI/TourBar.tsx:88-107`; `WeatherBadge` has `title` but no `aria-label` in `src/components/UI/WeatherBadge.tsx:17-20`.
- **User impact**: Keyboard and assistive technology users get less predictable navigation. Nested interactive behaviour in `TourBar` can also be awkward for touch and keyboard.
- **Severity**: High

### 3. Visual hierarchy inside the drawer is useful but busy

- **Problem**: Search, tour prompt, category chips, POI rows, transport groups, route cards, accessibility badges, and weather all use similar small-scale card/chip treatments. The hierarchy works, but the UI feels denser than the map-first mission needs.
- **Evidence from the codebase**: Explore stacks the welcome card, tour button, sticky search, category pills, and POI list in `src/components/UI/ExploreTab.tsx:93-198`. Getting Here stacks transport, routes, accessibility, and weather with similar borders and small headings in `src/components/UI/GettingHereTab.tsx:35-238`.
- **User impact**: Users may struggle to distinguish primary actions from supporting information, especially on mobile. The most important path should be: orient on map, find a POI, fly to it, understand what to do there.
- **Severity**: Medium

### 4. POI filter state lacks clear affordances and recovery

- **Problem**: Category filters can all be toggled off, but there is no clear "all/none" state, result count, or reset affordance. Active chips rely mainly on background colour.
- **Evidence from the codebase**: Category buttons toggle raw `Set<POICategory>` state in `src/App.tsx:42-52`; Explore renders category chips without pressed state or count in `src/components/UI/ExploreTab.tsx:141-161`; empty results are only a text message in `src/components/UI/ExploreTab.tsx:190-196`.
- **User impact**: Users can accidentally hide all POIs and think the map/list is broken. Colour-dependent active state is also weaker for colour-blind users.
- **Severity**: Medium

### 5. Decorative motion and blur could compete with Cesium rendering

- **Problem**: The app uses multiple backdrop blurs, spring height animation, large loading blur transitions, hover transforms, route pulsing, and camera fly-to/orbit behaviours. Individually reasonable, but together they could become expensive on mid-range mobile devices.
- **Evidence from the codebase**: Desktop and mobile drawers use `backdrop-blur-2xl` in `src/components/UI/ContextDrawer.tsx:91-93` and `src/components/UI/ContextDrawer.tsx:164-169`; the loading overlay uses a `1500ms` blur/opacity transition in `src/components/Map/TrackViewer.tsx:489-510`; POI rows animate transform/shadow in `src/components/UI/ExploreTab.tsx:168-176`; route overlay uses a pulsing `CallbackProperty` in `src/hooks/useRouteOverlay.ts`.
- **User impact**: The interface may feel less stable while Cesium is loading tiles, animating camera moves, or responding to touch gestures.
- **Severity**: Medium

## Top 5 Quick Wins

### 1. Make mobile sheet less dominant by default

- **Recommendation**: Reduce the collapsed sheet height to a smaller peek state, such as `28vh` or content-based `min(34vh, 18rem)`, and keep the expanded state available for browsing.
- **Why it matters**: The racecourse should be immediately visible and touchable. The sheet should invite exploration, not occupy the first impression.
- **Effort**: Small
- **Risk**: Low

### 2. Add proper ARIA and keyboard semantics to tabs, sheet, and icon buttons

- **Recommendation**: Add `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, and labelled panels; convert the compact drawer header and TourBar quick action to real buttons; add `aria-label` to weather and reset view.
- **Why it matters**: This improves accessibility without changing core behaviour or visual design.
- **Effort**: Small
- **Risk**: Low

### 3. Add a visible POI result count and filter reset

- **Recommendation**: Show a compact count like "12 places" near filters and provide a "Show all" action when categories/search remove results.
- **Why it matters**: Users need confidence that filtering is working and an easy path back to the full course.
- **Effort**: Small
- **Risk**: Low

### 4. Strengthen selected POI continuity between list and map

- **Recommendation**: Keep the selected POI row visually highlighted when returning from detail, and make the selected state clearer in the list and map callout. Consider a non-colour indicator, such as a left border or check/target icon.
- **Why it matters**: The fly-to interaction is central. Users should always know which list item corresponds to the camera focus.
- **Effort**: Medium
- **Risk**: Low

### 5. Tone down heavy blur and transform effects around active map interaction

- **Recommendation**: Use lighter blur on the drawer, avoid hover translate on dense rows, and prefer opacity/colour changes for cheap interaction feedback. Preserve Cesium camera animation, but keep surrounding UI animations restrained.
- **Why it matters**: The 3D map should feel smooth and stable, especially on mobile.
- **Effort**: Small
- **Risk**: Low

## Map-First Layout Assessment

The app is structurally map-first: `TrackViewer` fills the viewport and the UI overlays sit above it. The loading experience also treats Eagle Farm as the hero, using the track short name and a placeholder image while tiles load.

The strongest map-first choices are:

- Direct full-screen Cesium surface in `src/components/Map/TrackViewer.tsx`.
- Camera defaults and mobile camera config in track data, not hardcoded in shared UI.
- POI entity presentation that changes for compact viewports and selected/tour states.
- Drawer/tab UI that supports the map rather than replacing it.
- Walking route overlay and selected POI fly-to interactions that connect content to place.

The main weakness is mobile viewport allocation. The bottom sheet's default `38vh` height makes the app feel more like a directory with a map behind it than a 3D map with contextual support. The reset button position is coupled to that sheet height, which is a small sign that layout constants are starting to leak across components.

Recommended direction: keep the 3D surface as the first-read object. The drawer should behave like a calm companion layer: peek, reveal, and get out of the way.

## Context Drawer / Bottom Sheet Assessment

Desktop drawer:

- Good: Right-side placement is familiar for maps and keeps most of the course visible.
- Good: `pointer-events-none` on the outer wrapper and `pointer-events-auto` on the drawer avoids blocking the map outside the panel.
- Issue: The drawer uses a large translucent card with strong blur/shadow. It looks premium, but may visually compete with detailed photorealistic tiles.
- Issue: Width is fixed at `360px`, and the weather badge/right reset button are manually offset against that width.

Mobile bottom sheet:

- Good: The sheet pattern fits map-first mobile use.
- Good: Drag-to-expand and a handle are intuitive.
- Issue: The collapsed state is too tall for initial orientation.
- Issue: The sheet does not expose ARIA expanded/collapsed state.
- Issue: The compact header is a clickable `div`, not a button.
- Issue: `pb-safe` is used as a Tailwind class, but confirm Tailwind config supports it. The TourBar uses direct `env(safe-area-inset-bottom)` styling, which may be more reliable unless a custom utility exists.

Information architecture:

- Explore and Getting Here are the right top-level tabs for this product stage.
- Weather belongs under Getting Here and should stay secondary.
- Accessibility information is valuable, but it currently sits below walking routes. For a wayfinding companion, consider giving accessibility a scannable summary closer to transport when future polish happens.

## POI Discovery Assessment

POI discovery has a good foundation:

- Search filters by name and description.
- Categories are generated from available track POIs.
- POI list selection sets the active tab, clears the route, and triggers camera fly-to.
- Map marker click also selects the POI.
- Detail view moves focus to the back button, and returning restores focus to the previous list button.

Recommended improvements:

- Add `aria-pressed` to category buttons.
- Add visible selected state to POI rows, not only the detail replacement view.
- Add a result count and "Show all" / "Clear filters" state.
- Avoid relying only on category colour. Pair colour with icons, labels, or shape.
- Consider grouping POIs by practical visitor intent later: "Arrive", "Watch", "Eat & Drink", "Facilities", "Heritage". Do this through config/category mapping, not Eagle Farm-specific branching.
- Keep the fly-to effect, but avoid adding extra camera behaviours until the current list/map interaction is polished.

## Guided Tour Assessment

The guided tour is a strong product idea because it teaches users how to read a racecourse before they arrive. It fits the educational, beginner-friendly positioning.

Strengths:

- First-visit prompt is stored per track via `localStorage`.
- Tour content lives in track config, preserving multi-track design.
- Mobile uses a compact `TourBar` instead of forcing the full bottom sheet during tour mode.
- `useTour` checks `prefers-reduced-motion` before starting orbit behaviour.
- Tour completion pivots naturally to "Plan your arrival" or "Explore the map".

Concerns:

- "Auto-play" may feel like media playback while the underlying behaviour is camera movement plus dwell timing. The label is understandable, but it needs accessible state (`aria-pressed`) and reduced-motion clarity.
- Tour controls should be real buttons throughout. The collapsed mobile quick action is currently a `span role="button"`.
- The tour welcome card is useful, but it visually competes with search and filters. It may work better as a compact, dismissible first item with a stronger primary button and a quieter dismiss control.
- Tour copy contains racing context and some betting-adjacent vocabulary like "punters" and horse-condition cues. It is educational, but keep future copy clearly wayfinding/learning oriented rather than wagering oriented.

## Weather UI Assessment

Weather is useful but appropriately secondary overall.

Strengths:

- The weather badge is small and placed on the map surface.
- Weather details are in Getting Here, not a top-level tab.
- The weather section is collapsed by default.
- The Racing Queensland link and steward disclaimer prevent overclaiming about official track condition.

Concerns:

- The badge position is manually offset for desktop drawer width. If the drawer changes width, the badge must be adjusted too.
- The badge should have an `aria-label`, not just `title`.
- The weather badge may be visually loud on top of the map. It can remain useful with a slightly quieter treatment.
- Weather should not become a forecasting dashboard. Keep it focused on arrival comfort, rain, wind, and official-condition caveat.

## Accessibility Assessment

Keyboard and focus:

- Good: POI detail sends focus to the back button and restores focus to the previous POI row when closing detail.
- Needs work: Tabs need semantic roles and selected state.
- Needs work: Compact drawer toggle needs to be a button with `aria-expanded`.
- Needs work: TourBar nested quick action should be a real button, not a span.
- Needs work: Reset view and weather should have explicit accessible names.

Focus states:

- Several controls use focus rings, especially search, POI rows, and back buttons.
- Some controls rely on hover/active styles only. Add consistent `focus-visible` styles to tabs, category chips, weather badge, route buttons, tour controls, drawer toggle, and reset view.

Contrast:

- Most body text looks acceptable against white/translucent panels.
- Watch low-contrast text such as `text-stone-400` on white/blurred backgrounds, especially for important actions like "End tour", "Dismiss", or weather metadata.
- Active category chip colours should be checked for white text contrast, especially orange, green, purple, pink, and teal.

ARIA labels and semantics:

- Add `aria-pressed` to filter chips and auto-play toggle.
- Add `aria-expanded` to collapsible weather and mobile sheet toggle.
- Add `aria-controls` where tab panels and collapsible sections are controlled by buttons.
- Add `aria-live="polite"` for result count and empty-search feedback if updates are significant.
- Use accessible labels for icon-only buttons and SVG icons where needed.

Touch targets:

- Many controls are visually compact (`py-1`, `py-1.5`, text-xs). On mobile, ensure interactive controls meet roughly 44px touch target height through padding or hit-area wrappers.
- The category chips and tour navigation controls are the most likely to feel small.

Reduced motion:

- Good: Tour orbit checks `prefers-reduced-motion`.
- Add CSS-level reduced-motion handling for Framer Motion sheet animation, loading transitions, hover transforms, progress bar animations, and route pulsing.
- Avoid large sheet spring animations while Cesium camera flights are active.

## Performance Considerations

Cesium is the performance centre of gravity. The UI should avoid causing layout, paint, or compositing spikes during tile loading and camera interaction.

Current positives:

- `requestRenderMode: true` and `maximumRenderTimeChange: Number.POSITIVE_INFINITY` are good defaults for controlling render work.
- Entity presentation updates request renders explicitly.
- POI hover state is held in a ref to avoid React re-renders on every mouse move.
- Google tiles are loaded once in the viewer effect and cleaned up on unmount.

Areas to watch:

- Heavy `backdrop-blur-2xl` panels can be costly over a moving WebGL canvas.
- Animating sheet `height` can trigger layout; consider `transform`-based movement for mobile sheet states later.
- Large loading overlay blur and image scale transitions run during the heaviest loading phase.
- Route pulsing via `CallbackProperty` can force visual updates while active. This is acceptable for a route, but should stay scoped and disabled when not visible.
- Console logging in `App` and `useRouteOverlay` should be removed or development-gated before production polish.

Recommended performance stance: make the map feel expensive and the UI feel light. Use animation to clarify state changes, not to decorate every control.

## Recommended Design Direction

Target experience: **a premium venue-navigation companion for Australian racecourses**.

Principles:

- **Map-first**: The 3D track is the product's hero. UI panels should reveal context without owning the viewport.
- **Educational and beginner-friendly**: Explain what things are, where they are, and how a first-time visitor should move through the venue.
- **Australian racing context**: Keep venue-specific language, race-day etiquette, heritage notes, transport details, and accessibility guidance.
- **Not gambling-focused**: Avoid odds, betting prompts, wagering CTAs, or race-picking flows. If horse/race knowledge appears, frame it as orientation and understanding.
- **Config-driven**: New tracks should slot into `TrackConfig`, POI data, routes, and tours without shared components learning Eagle Farm-specific rules.
- **Calm premium UI**: Lean on spatial clarity, restrained typography, precise controls, and excellent map-content linking.

## Staged Implementation Plan

### 1. Safe first pass

- Reduce default mobile sheet height and decouple reset/weather positioning constants where practical.
- Add accessible labels to weather and reset view.
- Convert compact drawer header to a real button.
- Convert TourBar quick action to a real button.
- Add `aria-pressed` to category filters and auto-play.
- Add `aria-expanded` to mobile sheet and weather toggle.
- Keep all Cesium viewer setup, Google tiles loading, POI entity creation, route overlay, and camera behaviour intact.

### 2. Component polish

- Add result count and "Show all" / "Clear filters" affordance in Explore.
- Add visible selected POI styling in the list.
- Make category chip active state less colour-dependent.
- Standardise button heights and focus-visible rings across drawer controls.
- Lighten or reduce drawer blur/shadow so the map remains visually dominant.

### 3. Mobile refinement

- Tune the bottom sheet peek height and expanded max height against real mobile viewports.
- Review touch target sizes for tabs, category chips, route buttons, tour controls, dismiss controls, and reset view.
- Ensure selected POI callout does not collide with the sheet, weather badge, or reset button.
- Verify gestures: map pan/zoom/rotate, sheet drag, tour controls, route show/hide, and selected POI fly-to.

### 4. Accessibility and performance pass

- Add tablist/tab/panel semantics.
- Add reduced-motion handling for sheet animation, loading transitions, progress animation, hover transforms, route pulse, and tour camera motion.
- Audit colour contrast for chips, low-emphasis text, warning panels, and disabled states.
- Remove or gate development console logs.
- Run `npm run check`, `npm run lint`, and browser verification on desktop and mobile sizes.

### 5. Future enhancements

- Add optional intent-based POI grouping through config, not hardcoded component branches.
- Add per-track "arrival summary" content for first-time visitors.
- Add route accessibility alternatives using the existing `accessibleAlternative` field.
- Add richer POI media only if it helps wayfinding and does not obscure the map.
- Add multi-track selector only after the current Eagle Farm experience feels stable.

## Files Likely to Change

- `src/components/UI/ContextDrawer.tsx`: mobile sheet height, sheet semantics, tab semantics, drawer header button, visual hierarchy.
- `src/components/UI/ExploreTab.tsx`: result count, filter reset, chip semantics, selected row styling, touch target polish.
- `src/components/UI/GettingHereTab.tsx`: weather toggle semantics, route button accessibility, accessibility summary hierarchy, touch targets.
- `src/components/UI/TourBar.tsx`: replace nested `span role="button"`, add accessible expanded state, polish compact controls.
- `src/components/UI/TourCard.tsx`: add `aria-pressed`, improve focus states, align control styles with TourBar.
- `src/components/UI/TourWelcome.tsx`: calmer prompt styling, button hierarchy, accessible dismiss.
- `src/components/UI/TourButton.tsx`: focus/touch improvements and possible icon replacement with lucide.
- `src/components/UI/TourCompletion.tsx`: chip semantics, focus states, touch target polish.
- `src/components/UI/WeatherBadge.tsx`: `aria-label`, quieter visual treatment, positioning decoupling.
- `src/components/UI/WeatherSection.tsx`: reduced emphasis, contrast/focus pass for external link.
- `src/components/Map/TrackViewer.tsx`: reset button accessible name, reduced-motion-aware loading transition, selected callout positioning, minimal positioning constants.
- `src/hooks/useTour.ts`: preserve reduced-motion guard; possibly expose reduced-motion state to UI labels or skip durations.
- `src/hooks/useRouteOverlay.ts`: gate console logs and consider reduced-motion route pulse handling.
- `src/data/tracks/eagle-farm.ts`: only if copy needs educational tone polish or route accessibility alternatives. Avoid shared-component hardcoding.

## Risks / Guardrails

- Do not add Resium.
- Do not replace Cesium.
- Do not change Google 3D Tiles loading unless necessary.
- Do not remove Google/Cesium attribution.
- Do not hide or style away required attribution.
- Do not hardcode Eagle Farm into shared components.
- Preserve config-driven multi-track design.
- Preserve direct Cesium `Viewer` lifecycle and cleanup.
- Preserve `viewer.scene.globe.show = false` for Google Photorealistic 3D Tiles.
- Preserve `showCreditsOnScreen: true`.
- Preserve POI click, selected POI fly-to, tour fly-to/orbit, route show/hide, and camera bounds.
- Avoid introducing backend dependencies.
- Keep Australian English in user-facing text.
- Keep the product educational and wayfinding-focused, not gambling-focused.
- Make changes in small passes and verify after each pass because Cesium/UI interactions are easy to disturb.

## Suggested Implementation Prompt for Later

```markdown
Implement the first safe UI/UX polish pass for TrackView3D based on `docs/obsidian/TrackView3D UI UX Review - 2026-05-02.md`.

Use these lenses: senior React + TypeScript engineer, map-first UI/UX designer, Cesium/map integration engineer, accessibility reviewer, and frontend performance reviewer.

Do not add new product features. Optimise for clearer visual hierarchy, safer implementation, accessibility, mobile map-first behaviour, and preserving existing Cesium functionality.

Scope:
- Reduce the default mobile bottom sheet footprint so the 3D map remains the hero.
- Improve accessibility semantics for the context drawer tabs, mobile sheet toggle, weather toggle, category filters, weather badge, reset view, TourBar quick action, and tour auto-play control.
- Add a small POI result count and a clear filter/reset affordance in Explore.
- Add clearer selected POI state in the list without changing the existing selected POI fly-to behaviour.
- Lighten expensive or visually dominant overlay treatments where safe.
- Gate or remove development console logs that should not ship.

Guardrails:
- Do not add Resium.
- Do not replace Cesium.
- Do not change Google 3D Tiles loading unless necessary.
- Do not remove attribution or hide Google credits.
- Do not hardcode Eagle Farm into shared components.
- Preserve config-driven multi-track design.
- Preserve POI markers, selected POI fly-to, tour controls, route overlays, mobile touch map controls, and camera bounds.

Before editing, inspect the relevant files and make a short implementation plan. After editing, run `npm run check` and `npm run lint`. Start the dev server and verify the main map UI on desktop and mobile viewport sizes if the API key/environment allows.
```
