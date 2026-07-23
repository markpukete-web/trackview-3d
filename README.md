# TrackView 3D

Interactive 3D maps of Australian racecourses. Built with Google Photorealistic 3D Tiles and CesiumJS, TrackView 3D lets users explore racecourse grounds in immersive 3D with informational overlays for facilities, amenities, and race-day points of interest.

**Tracks available: Eagle Farm Racecourse and Doomben Racecourse, Brisbane.**

**Live site: [trackview-3d.vercel.app](https://trackview-3d.vercel.app)**

## Vision

Give first-time racegoers a way to virtually explore a racecourse before they visit — understand the layout, find key facilities, and arrive with confidence on race day. This is an educational and wayfinding tool, not a gambling product.

## Features

### 3D Foundation
- Photorealistic 3D view of Eagle Farm and Doomben racecourses
- Camera positioned and bounded to each racecourse precinct
- Smooth orbit, zoom, and tilt controls
- Mobile-responsive with touch gestures
- Reset View button to return to default camera view

### Multi-Track Support
- Full-screen track landing screen for venue selection
- In-map track switcher to easily navigate between racecourses
- URL routing via `?track=eagle-farm` and `?track=doomben` query parameters
- Last-visited track session persistence

### Points of Interest
- Custom circle markers with category colours and scale-by-distance
- Fact-checked POIs across 6 categories: Grandstands, Viewing, Food & Drink, Amenities, Operations, Transport
- Click-to-fly camera animation (looks down at selected POI)

### Map Discovery
- Floating discovery layer above the map: search, visitor-intent chips (Where to watch · Food & drink · Info & amenities), Entry & transport, and Take the tour
- Search and intent are mutually exclusive; both filter map markers and drawer results from a single shared visibility set
- Drawer opens reactively as a result/detail surface — it is no longer the first required discovery step

### Guided Tour
- Narrated flyover introducing new racegoers to each course
- Auto-play with per-stop dwell timers and gentle camera orbits
- Manual next/prev navigation via TourBar overlay
- Welcome card with estimated tour duration
- Linked POI details at each stop ("Learn more" expansion)
- Respects `prefers-reduced-motion`

### Plan Your Visit
- Evergreen race-day guidance for first-time visitors: dress code by area, gates & arrival timing, and entry essentials
- Surfaces as a drawer tab; gate entries link to their map markers ("Show on map")
- Static per-track content — appears for supported tracks (Eagle Farm first)

### Weather
- Live weather badge on the map (current temperature and condition)
- Detailed weather section in the context drawer (wind, humidity, forecast)
- Data from Open-Meteo API, auto-refreshes every 15 minutes
- Timezone-aware using the track's configured timezone

### Context Drawer
- Unified tabbed drawer: Explore, Getting Here, and Plan Your Visit (Plan Your Visit appears for tracks with race-day guidance)
- **Explore** — filterable POI list with detail view (description, race-day tips)
- **Getting Here** — transport options grouped by mode (train, bus, parking, rideshare, taxi) with warning callouts, interactive walking routes between POIs (OSRM-routed paths drawn on the 3D tiles), an Accessibility section (feature badges, mobility details, assistance services), and a collapsible race-day weather panel
- **Plan Your Visit** — evergreen race-day guidance: dress code, gates & arrival, and entry essentials
- Desktop: right-side drawer (360px) · Mobile: bottom sheet

### Planned
- Event-day mode (gate times, dress codes, road closures, special transport)
- Track condition indicator (Firm → Heavy)
- Further track expansion (Flemington)

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS
- **3D Rendering**: CesiumJS (direct API usage, no wrapper library)
- **Map Data**: Google Photorealistic 3D Tiles (Map Tiles API)
- **Hosting**: Vercel (auto-deploy from GitHub)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/markpukete-web/trackview-3d.git
cd trackview-3d

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Google Maps API key to .env

# Start development server
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key with Map Tiles API enabled |

## Project Structure

```
trackview-3d/
├── src/
│   ├── components/
│   │   ├── Map/              # CesiumJS viewer, markers, camera
│   │   └── UI/               # Discovery controls, drawer + tabs, tour, weather
│   ├── constants/            # Discovery intent config, etc.
│   ├── data/
│   │   └── tracks/           # Per-track config & POI data (eagle-farm.ts, etc.)
│   ├── hooks/                # useTour, useWeather, useRouteOverlay, useDevWaypointCapture
│   ├── types/                # TypeScript type definitions (track, tour, weather, discovery)
│   ├── utils/                # Weather helpers, icon mappings
│   ├── App.tsx
│   └── main.tsx
├── public/                   # Static assets + Cesium workers
├── CLAUDE.md
└── README.md
```

## Related Projects

- **First Furlong** — Horse racing education platform ([firstfurlong.app](https://firstfurlong.app))
  - Track profile pages will link to TrackView 3D for the full 3D experience

## Acknowledgements

- 3D imagery powered by [Google Photorealistic 3D Tiles](https://developers.google.com/maps/documentation/tile/3d-tiles)
- 3D rendering by [CesiumJS](https://cesium.com/cesiumjs/)
- Eagle Farm & Doomben racecourses operated by [Brisbane Racing Club](https://www.brc.com.au/)

## Licence

MIT
