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
        longitude: 153.0625,
        latitude: -27.4340,
      },
      tips: [
        'Arrive early on carnival days to secure a spot on the upper levels for the best views.',
        'The ground floor has accessible seating areas near the mounting yard.',
      ],
    },
    {
      id: 'mounting-yard',
      name: 'Mounting Yard',
      category: 'operations',
      description:
        'Where jockeys mount their horses before each race. A great spot to see the runners up close and assess their condition.',
      position: {
        longitude: 153.0628,
        latitude: -27.4343,
      },
      tips: [
        'Head here 10–15 minutes before each race to watch the horses parade.',
        'Look for signs of a calm, settled horse — a good indicator of readiness.',
      ],
    },
    {
      id: 'parade-ring',
      name: 'Parade Ring',
      category: 'operations',
      description:
        'The parade ring where horses are walked before heading to the mounting yard. Ideal for studying form and temperament.',
      position: {
        longitude: 153.0630,
        latitude: -27.4347,
      },
      tips: [
        'Stand trackside for an unobstructed view of the horses as they walk past.',
        'Trainers and strappers often chat here — listen for insights.',
      ],
    },
    {
      id: 'gate-4',
      name: 'Gate 4 (Main Entry)',
      category: 'transport',
      description:
        'The main public entrance at Gate 4 on Lancaster Road. Ticket scanning, bag checks, and guest services are located here.',
      position: {
        longitude: 153.0618,
        latitude: -27.4335,
      },
      tips: [
        'Gates typically open 1–2 hours before the first race.',
        'Use the Ascot train station nearby for easy public transport access.',
      ],
    },
    {
      id: 'the-birdcage',
      name: 'The Birdcage',
      category: 'entertainment',
      description:
        'The premium function and entertainment precinct at Eagle Farm, featuring marquees, bars, and live music on major race days.',
      position: {
        longitude: 153.0638,
        latitude: -27.4350,
      },
      tips: [
        'The Birdcage is ticketed separately on carnival days — book in advance.',
        'Dress code is strictly enforced; check the BRC website for guidelines.',
      ],
    },
  ],
};
