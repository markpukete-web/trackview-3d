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
    // --- Grandstands ---
    {
      id: 'public-grandstand',
      name: 'Public Grandstand',
      category: 'grandstand',
      description:
        'The main public grandstand at Eagle Farm, offering multiple levels of seating and hospitality with views across the entire course.',
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
      id: 'st-leger-grandstand',
      name: 'St Leger Grandstand',
      category: 'grandstand',
      description:
        'The eastern grandstand complex with multiple levels of seating, bars, and hospitality areas overlooking the straight.',
      position: {
        longitude: 153.0663,
        latitude: -27.4301,
      },
      tips: [
        'Great vantage point for watching the finish — the straight runs right past.',
        'Several bars and food outlets inside across multiple levels.',
      ],
    },
    {
      id: 'members-grandstand',
      name: "Member's Grandstand",
      category: 'grandstand',
      description:
        'Reserved grandstand seating for BRC members with premium views of the track and mounting yard.',
      position: {
        longitude: 153.0644,
        latitude: -27.4293,
      },
      tips: [
        'BRC membership required for access on race days.',
        'Located between the mounting yard and public lawn — central position.',
      ],
    },
    {
      id: 'john-power-stand',
      name: 'John Power Stand',
      category: 'grandstand',
      description:
        'Heritage-listed grandstand named after prominent racing figure John Power. Part of the members precinct.',
      position: {
        longitude: 153.0641,
        latitude: -27.4291,
      },
      tips: [
        'One of the older structures at Eagle Farm — worth a look for racing history fans.',
      ],
    },
    // --- Viewing Areas ---
    {
      id: 'public-lawn',
      name: 'Public Lawn',
      category: 'viewing',
      description:
        'Open grassed area between the grandstands with trackside views. Popular spot for families and picnic setups on race day.',
      position: {
        longitude: 153.0652,
        latitude: -27.4293,
      },
      tips: [
        'Bring a picnic rug and arrive early to claim a good trackside position.',
        'Food and drink outlets are nearby at Stradbroke Plaza.',
      ],
    },
    {
      id: 'members-lawn',
      name: "Member's Lawn",
      category: 'viewing',
      description:
        'Exclusive lawn area for BRC members, situated between the Member\'s Grandstand and the track.',
      position: {
        longitude: 153.0642,
        latitude: -27.4289,
      },
      tips: [
        'BRC membership required. One of the best trackside viewing spots.',
      ],
    },
    {
      id: 'squires-perch',
      name: "Squire's Perch",
      category: 'viewing',
      description:
        'Elevated viewing and hospitality area in the members precinct, offering panoramic views of the track.',
      position: {
        longitude: 153.0639,
        latitude: -27.4287,
      },
      tips: [
        'Check BRC website for event-day hospitality packages that include access.',
      ],
    },
    // --- Food & Drink ---
    {
      id: 'stradbroke-plaza',
      name: 'Stradbroke Plaza',
      category: 'food-drink',
      description:
        'Central food and beverage hub with multiple outlets. Named after the famous Stradbroke Handicap race held at Eagle Farm.',
      position: {
        longitude: 153.0652,
        latitude: -27.4300,
      },
      tips: [
        'Grab food here between races — central location with good variety.',
        'Can get busy around lunchtime on carnival days. Visit early or between races.',
      ],
    },
    {
      id: 'the-society',
      name: 'The Society',
      category: 'food-drink',
      description:
        'Bar and hospitality venue within the precinct, offering drinks and light bites on race days.',
      position: {
        longitude: 153.0654,
        latitude: -27.4298,
      },
    },
    {
      id: 'owners-trainers-bar',
      name: "Owner's & Trainer's Bar",
      category: 'food-drink',
      description:
        'Bar reserved for horse owners, trainers, and their guests. Located near the mounting yard.',
      position: {
        longitude: 153.0641,
        latitude: -27.4297,
      },
      tips: [
        'Access restricted to owners, trainers, and invited guests.',
      ],
    },
    // --- Operations ---
    {
      id: 'mounting-yard',
      name: 'Mounting Yard & Parade Ring',
      category: 'operations',
      description:
        'The combined mounting yard and parade ring at Eagle Farm, where horses are walked and jockeys mount before each race. A great spot to see the runners up close and assess their condition.',
      position: {
        longitude: 153.0645,
        latitude: -27.4297,
      },
      tips: [
        'Head here 10–15 minutes before each race to watch the horses parade.',
        'Look for signs of a calm, settled horse — a good indicator of readiness.',
        'Stand trackside for an unobstructed view of the horses as they walk past.',
      ],
    },
    {
      id: 'raceday-office',
      name: 'Raceday Office',
      category: 'operations',
      description:
        'Administrative office for race-day operations. Enquiries, lost property, and general assistance.',
      position: {
        longitude: 153.0652,
        latitude: -27.4298,
      },
    },
    // --- Transport ---
    {
      id: 'main-entrance',
      name: 'Main Entrance',
      category: 'transport',
      description:
        'The main public entrance on Lancaster Road. Ticket scanning, bag checks, and guest services are located here.',
      position: {
        longitude: 153.0655,
        latitude: -27.4306,
      },
      tips: [
        'Gates typically open 1–2 hours before the first race.',
        'Use the Ascot train station nearby for easy public transport access.',
      ],
    },
    {
      id: 'gate-4',
      name: 'Gate 4',
      category: 'transport',
      description:
        'Entry gate on Lancaster Road near the Gate 4 car park.',
      position: {
        longitude: 153.0656,
        latitude: -27.4311,
      },
    },
    {
      id: 'members-reserve-entry',
      name: "Member's Reserve Entry",
      category: 'transport',
      description:
        'Dedicated entrance for BRC members accessing the members precinct.',
      position: {
        longitude: 153.0648,
        latitude: -27.4297,
      },
    },
    {
      id: 'infield-carpark',
      name: 'Infield Car Park',
      category: 'transport',
      description:
        'Over 1,000 parking spaces accessed via Nudgee Road near Racecourse Village Shopping Centre. Primary parking for members and the public, with vehicle tunnel entry and disabled parking on-site.',
      position: {
        longitude: 153.0673,
        latitude: -27.4287,
      },
      tips: [
        'Use the pedestrian tunnel to cross to the main precinct from the infield.',
      ],
    },
    {
      id: 'ascot-station',
      name: 'Ascot Railway Station',
      category: 'transport',
      description:
        'The nearest train station to Eagle Farm Racecourse, on the Doomben line. A short walk to the main entrance via Lancaster Road.',
      position: {
        longitude: 153.0634,
        latitude: -27.4297,
      },
      tips: [
        'Extra services run on major race days — check TransLink for timetables.',
        'The walk from the platform to Gate 4 takes about 5 minutes.',
      ],
    },
  ],
};
