# TrackView 3D

Interactive 3D maps of Australian racecourses. Built with Google Photorealistic 3D Tiles and CesiumJS, TrackView 3D lets users explore racecourse grounds in immersive 3D with informational overlays for facilities, amenities, and race-day points of interest.

**First track: Eagle Farm Racecourse, Brisbane.**

**Live site: [trackview-3d.vercel.app](https://trackview-3d.vercel.app)**

## Vision

Give first-time racegoers a way to virtually explore a racecourse before they visit — understand the layout, find key facilities, and arrive with confidence on race day. This is an educational and wayfinding tool, not a gambling product.

## Features

### 3D Foundation
- Photorealistic 3D view of Eagle Farm Racecourse
- Camera positioned and bounded to the racecourse precinct
- Smooth orbit, zoom, and tilt controls
- Mobile-responsive with touch gestures
- Reset View button to return to default camera

### Points of Interest (18 locations)
- Custom circle markers with category colours and scale-by-distance
- 18 POIs across 5 categories: Grandstands, Viewing, Food & Drink, Operations, Transport
- Category filter pills to toggle marker visibility
- Click-to-fly camera animation (looks down at selected POI)

### Context Drawer
- Unified tabbed drawer: Explore, Getting Here, Accessibility
- **Explore** — filterable POI list with detail view (description, race-day tips)
- **Getting Here** — transport options grouped by mode (train, parking, rideshare) with warning callouts
- **Accessibility** — feature badges, mobility details, assistance services
- Desktop: right-side drawer (360px) · Mobile: bottom sheet

### Planned
- Weather overlay, walking routes, event-day mode (Phase 3b)
- Multi-track expansion: Doomben, Flemington, track selector (Phase 4)

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS
- **3D Rendering**: CesiumJS (via `resium` React wrapper)
- **Map Data**: Google Photorealistic 3D Tiles (Map Tiles API)
- **Animations**: Framer Motion
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
│   │   └── UI/               # Context drawer, tabs, filters
│   ├── data/
│   │   └── tracks/           # Per-track config (eagle-farm.ts, etc.)
│   ├── types/                # TypeScript type definitions
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
