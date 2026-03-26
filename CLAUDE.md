# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TrackView 3D is a standalone interactive 3D map viewer for Australian racecourses, using Google Photorealistic 3D Tiles. Eagle Farm is the first track. The project is designed to support multiple tracks via a configuration-driven architecture. This is a learning project and potential companion to First Furlong (firstfurlong.app). It is an educational/wayfinding tool — not a gambling product.

## Commands

```bash
npm run dev            # Dev server on port 5173
npm run build          # Production build
npm run preview        # Preview production build locally
npm run check          # TypeScript type check
npm run lint           # ESLint
```

## Architecture

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS
- **3D Rendering**: CesiumJS via `resium` (React wrapper for CesiumJS)
- **Map Data**: Google Photorealistic 3D Tiles (Map Tiles API)
- **Hosting**: Vercel (auto-deploy from GitHub)
- **Env variable**: `VITE_GOOGLE_MAPS_API_KEY` — Google Maps API key (Map Tiles API enabled)
- **No backend**: Entirely client-side. Track configs and POI data are static TypeScript files
- **Multi-track design**: Each track has its own config file in `src/data/tracks/` defining coordinates, camera defaults, and POI data

### Key Libraries

| Package | Purpose |
|---|---|
| `cesium` | 3D globe rendering engine |
| `resium` | React components wrapping CesiumJS |
| `tailwindcss` | Utility-first CSS |
| `framer-motion` | UI animations (panels, transitions) |

### CesiumJS Specifics

- Cesium's static assets (workers, images, etc.) must be copied to `public/cesium/` or served via `vite-plugin-cesium` — Cesium cannot resolve assets from node_modules at runtime
- `CESIUM_BASE_URL` must be set (usually via Vite plugin or manual config)
- The Google 3D Tiles root tileset URL: `https://tile.googleapis.com/v1/3dtiles/root.json?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
- Globe should be hidden (`viewer.scene.globe.show = false`) when using Photorealistic 3D Tiles — they replace the globe entirely
- Always show Google copyright attribution (`showCreditsOnScreen: true`)

### Track Configuration

Each track is defined by a config object:

```typescript
interface TrackConfig {
  id: string;                    // e.g. 'eagle-farm'
  name: string;                  // e.g. 'Eagle Farm Racecourse'
  location: string;              // e.g. 'Ascot, Brisbane QLD'
  operator: string;              // e.g. 'Brisbane Racing Club'
  coordinates: {
    longitude: number;
    latitude: number;
  };
  camera: {
    heading: number;             // degrees
    pitch: number;               // degrees (negative = looking down)
    range: number;               // metres from target
  };
  bounds: {
    maxAltitude: number;         // metres
    minAltitude: number;         // metres
    maxDistance: number;          // metres from centre
  };
  pois: PointOfInterest[];
}
```

### Camera Defaults by Track

| Track | Longitude | Latitude | Heading | Pitch | Range |
|---|---|---|---|---|---|
| Eagle Farm | 153.0632 | -27.4345 | 315° | -45° | 800m |
| Doomben | 153.0555 | -27.4280 | TBD | TBD | TBD |

## Development Rules

- **Australian English**: colour, centre, favourite, licence — throughout all user-facing text
- **Additive development**: Build incrementally. Get 3D tiles rendering first, then add overlays
- **Educational framing**: All content is wayfinding/educational. No gambling facilitation
- **Mobile-first**: Touch gestures (pinch-to-zoom, two-finger rotate) must work well
- **Performance**: CesiumJS is heavy. Lazy-load where possible. Monitor bundle size
- **Multi-track mindset**: Don't hardcode Eagle Farm specifics into shared components. Use the track config system
- **API key security**: NEVER commit API keys. Use `.env` + `.gitignore`. Vite exposes `VITE_` prefixed vars to the client — this is expected for Google Maps (key is restricted by domain in Google Cloud Console)

## POI Data Structure

Points of Interest are stored per track in `src/data/tracks/`. Each POI has:

```typescript
interface PointOfInterest {
  id: string;
  name: string;
  category: POICategory;
  description: string;
  position: {
    longitude: number;
    latitude: number;
    height?: number;        // metres above ground
  };
  tips?: string[];           // race-day insider tips
  accessibility?: string;
  imageUrl?: string;
}

type POICategory =
  | 'grandstand'
  | 'food-drink'
  | 'amenities'
  | 'viewing'
  | 'transport'
  | 'entertainment'
  | 'operations';
```

## Known Gotchas

- **CesiumJS bundle size**: Cesium is ~40MB uncompressed. Use `vite-plugin-cesium` to handle asset copying and tree-shaking. Do NOT try to import Cesium assets manually
- **Google 3D Tiles attribution**: Google requires visible copyright attribution. CesiumJS handles this with `showCreditsOnScreen: true` — do NOT hide or remove it
- **Touch controls**: CesiumJS default touch behaviour can conflict with mobile browser gestures. May need to prevent default on the container element
- **Height references**: CesiumJS uses WGS84 ellipsoid heights, not sea-level heights. Ground-level markers may need `heightReference: Cesium.HeightReference.CLAMP_TO_GROUND`
- **React StrictMode + CesiumJS**: CesiumJS viewer does not handle double-mounting well. May need to disable StrictMode or use refs carefully to prevent duplicate initialisation
- **Vercel deployment**: Cesium static assets in `public/` will be served correctly by Vercel. No special config needed beyond the standard Vite setup

## File Locations

- Track configs & POI data: `src/data/tracks/`
- Shared types: `src/types/`
- Map components: `src/components/Map/`
- UI panels/overlays: `src/components/UI/`
- Custom hooks: `src/hooks/`
- **Obsidian notes**: Project notes live in an Obsidian vault. Check Claude Code memory for the full path (`reference_obsidian_vault.md`)

## Links

- **Live site**: TBD (Vercel deployment URL)
- **GitHub**: https://github.com/markpukete-web/trackview-3d
- **Related**: [First Furlong](https://firstfurlong.app) — horse racing education platform
- **Google 3D Tiles docs**: https://developers.google.com/maps/documentation/tile/3d-tiles
- **CesiumJS docs**: https://cesium.com/learn/cesiumjs-learn/
- **Resium docs**: https://resium.reearth.io/
