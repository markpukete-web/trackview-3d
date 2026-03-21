import { TrackConfig } from '../../types/track';

export const eagleFarm: TrackConfig = {
  id: 'eagle-farm',
  name: 'Eagle Farm Racecourse',
  location: 'Ascot, Brisbane QLD',
  operator: 'Brisbane Racing Club',
  coordinates: {
    longitude: 153.0650,
    latitude: -27.4300,
  },
  camera: {
    longitude: 153.0665,
    latitude: -27.4317,
    height: 264,
    heading: 333,
    pitch: -39,
  },
  bounds: {
    maxAltitude: 1200,
    minAltitude: 80,
    maxDistance: 700,
  },
  nearbyTracks: ['doomben'],
  pois: [
    {
      id: 'main-grandstand',
      name: 'Main Grandstand',
      category: 'grandstand',
      description:
        'The main grandstand complex at Eagle Farm, offering multiple levels of seating and hospitality with views across the entire course.',
      position: {
        longitude: 153.0650,
        latitude: -27.4295,
      },
      tips: [
        'Arrive early on carnival days to secure a spot on the upper levels for the best views.',
        'The ground floor has accessible seating areas near the mounting yard.',
      ],
    },
    {
      id: 'mounting-yard',
      name: 'Mounting Yard & Parade Ring',
      category: 'operations',
      description:
        'The combined mounting yard and parade ring at Eagle Farm, where horses are walked and jockeys mount before each race. A great spot to see the runners up close and assess their condition.',
      position: {
        longitude: 153.0645,
        latitude: -27.4298,
      },
      tips: [
        'Head here 10–15 minutes before each race to watch the horses parade.',
        'Look for signs of a calm, settled horse — a good indicator of readiness.',
        'Stand trackside for an unobstructed view of the horses as they walk past.',
      ],
    },
    {
      id: 'gate-4',
      name: 'Gate 4 (Main Entry)',
      category: 'transport',
      description:
        'The main public entrance at Gate 4 on Lancaster Road. Ticket scanning, bag checks, and guest services are located here.',
      position: {
        longitude: 153.0655,
        latitude: -27.4306,
      },
      tips: [
        'Gates typically open 1–2 hours before the first race.',
        'Use the Ascot train station nearby for easy public transport access.',
      ],
    },
  ],
};
