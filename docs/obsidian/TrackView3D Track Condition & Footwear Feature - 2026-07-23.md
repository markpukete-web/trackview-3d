---
title: TrackView3D Track Condition & Footwear Feature
date: 2026-07-23
project: TrackView3D
type: feature-documentation
status: implemented
tags:
  - trackview3d
  - track-condition
  - weather
  - ui-ux
  - react
  - cesium
---

# TrackView3D Track Condition & Footwear Feature

## Overview

Added an automated, rainfall-driven **Track Condition & Footwear Guide** to TrackView 3D for Australian racecourses. The feature provides first-time racegoers with estimated turf ratings (Good 3/4, Soft 6, Heavy 8, Firm 2) and practical footwear advice for outdoor lawns, while clearly distinguishing estimated ratings from official steward declarations.

## Key Features

1. **Map Surface Weather & Track Badge (`WeatherBadge.tsx`)**
   - Displays a combined live weather and track rating badge on the 3D surface: `☀️ 14° · 🟢 Good 4 Est.`
   - Dark glassmorphism styling (`backdrop-blur-md bg-stone-900/75 border border-white/10`).
   - Accessible ARIA labels distinguishing rainfall estimates from official steward reports.

2. **Track Condition & Footwear Card (`WeatherSection.tsx` & `GettingHereTab.tsx`)**
   - Located inside the *Getting Here* tab (expanded by default).
   - Displays:
     - Color-coded rating badge with an explicit `RAINFALL ESTIMATE (NOT OFFICIAL)` or `OFFICIAL STEWARD` tag.
     - Rating description & rail position (e.g. *True position* or *Out 2.5m entire circuit*).
     - Penetrometer reading.
     - **👟 Racegoer Footwear Tip:** Practical advice tailored for lawn conditions (e.g. recommending block heels/wedges over thin stilettos when lawns are moist).

3. **Rainfall Estimation Engine (`src/utils/trackCondition.ts`)**
   - Aggregates Open-Meteo's 7-day precipitation data for track coordinates.
   - Scale thresholds:
     - `0.0 – 2.9 mm` 7-day rainfall $\rightarrow$ **Good 3**
     - `3.0 – 11.9 mm` 7-day rainfall $\rightarrow$ **Good 4**
     - `12.0 – 29.9 mm` 7-day rainfall $\rightarrow$ **Soft 6**
     - `≥ 30.0 mm` 7-day rainfall $\rightarrow$ **Heavy 8**
   - Allows explicit `trackCondition` overrides in `TrackConfig` for official steward reports.

4. **Turf Engineering & Spatial Context**
   - Documents real-world turf differences between adjacent tracks (e.g. Eagle Farm's high-drainage sand profile vs Doomben's moisture-retaining soil/clay base).

## Technical Implementation

- `src/types/trackCondition.ts`: Interfaces for `TrackConditionInfo` and categories.
- `src/utils/trackCondition.ts`: Calculation logic (`calculateTrackCondition`) and badge styling (`getCategoryBadgeStyle`).
- `src/hooks/useWeather.ts`: Integrated track condition calculation into the weather pipeline.
- `src/components/UI/WeatherBadge.tsx`: Enhanced map surface badge.
- `src/components/UI/WeatherSection.tsx`: Rendered track condition card.
- `src/components/UI/GettingHereTab.tsx`: Expanded race day weather section by default.

## Verification

- Static Type Check (`npm run check`): Passed (0 errors).
- ESLint (`npm run lint`): Passed (0 errors).
- Production Build (`npm run build`): Passed (0 errors).
- Playwright Visual Inspection: Screenshots captured and verified for desktop and mobile viewports.
