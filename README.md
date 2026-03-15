# TrackView 3D

Interactive 3D maps of Australian racecourses. Built with Google Photorealistic 3D Tiles and CesiumJS, TrackView 3D lets users explore racecourse grounds in immersive 3D with informational overlays for facilities, amenities, and race-day points of interest.

**First track: Eagle Farm Racecourse, Brisbane.**

## Vision

Give first-time racegoers a way to virtually explore a racecourse before they visit — understand the layout, find key facilities, and arrive with confidence on race day. This is an educational and wayfinding tool, not a gambling product.

## Features (Planned)

### Phase 1 — 3D Foundation (Eagle Farm)
- [ ] Photorealistic 3D view of Eagle Farm Racecourse
- [ ] Camera positioned and bounded to the racecourse precinct
- [ ] Smooth orbit, zoom, and tilt controls
- [ ] Mobile-responsive with touch gestures

### Phase 2 — Points of Interest
- [ ] Clickable markers for key facilities (grandstands, mounting yard, parade ring, etc.)
- [ ] Info panels with descriptions, photos, and race-day tips
- [ ] Category filters (Food & Drink, Amenities, Viewing, Transport)
- [ ] Search/filter functionality

### Phase 3 — Race Day Context
- [ ] Live weather overlay (temperature, wind, conditions)
- [ ] Walking routes between key locations
- [ ] Event-day mode (carnival-specific info)
- [ ] Accessibility information for facilities

### Phase 4 — Multi-Track Expansion
- [ ] Doomben Racecourse
- [ ] Flemington Racecourse
- [ ] Template system for adding new tracks
- [ ] Track selector landing page

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS
- **3D Rendering**: CesiumJS (via `resium` React wrapper)
- **Map Data**: Google Photorealistic 3D Tiles (Map Tiles API)
- **Hosting**: Vercel
- **Source Control**: GitHub

## Prerequisites

- Node.js 18+
- Google Cloud Platform account with Map Tiles API enabled
- Google Maps API key with Map Tiles API permissions

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
│   ├── components/       # React components
│   │   ├── Map/          # CesiumJS map components
│   │   ├── UI/           # Interface elements (panels, filters, controls)
│   │   └── common/       # Shared/reusable components
│   ├── data/             # POI data, track configs, categories
│   │   └── tracks/       # Per-track data (eagle-farm.ts, doomben.ts, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Helper functions
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── assets/           # Static images, icons
├── .env.example
├── CLAUDE.md
├── README.md
├── ROADMAP.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
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
