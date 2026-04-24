import { TrackConfig } from '../../types/track';
import { Tour } from '../../types/tour';

const eagleFarmFirstVisitTour: Tour = {
  id: 'first-visit',
  name: 'First Visit Guide',
  description: 'A 5-minute introduction to Eagle Farm Racecourse — perfect for first-time racegoers.',
  estimatedMinutes: 5,
  stops: [
    {
      id: 'overview',
      title: 'Welcome to Eagle Farm',
      narrative:
        "One of Australia's premier racecourses, Eagle Farm has been hosting thoroughbred racing since 1865. Take a look around — by the end you'll know where to enter, where to stand, and what makes this place special.",
      target: { longitude: 153.06535, latitude: -27.4300, height: 0 },
      // Camera south of track centre, looking NNW across the whole course
      camera: { longitude: 153.0660, latitude: -27.4325, height: 500, heading: 340, pitch: -40 },
      dwellTime: 10,
      orbit: { speed: 1.5 },
    },
    {
      id: 'character',
      title: 'A galloper’s track',
      narrative:
        "Eagle Farm is one of Australia's largest tracks at 2,027 metres around, with a 434-metre home straight that rises gently uphill to the line. It rewards stamina and class — there is nowhere to hide on a track this big. That is why race finishes here so often come down to the final 100 metres.",
      target: { longitude: 153.0648, latitude: -27.4293, height: 0 },
      // Camera NE of the winning post, three-quarter view SW across the home straight and grandstands
      camera: { longitude: 153.0705, latitude: -27.4275, height: 450, heading: 225, pitch: -28 },
      dwellTime: 12,
      orbit: { speed: 0.6 },
    },
    {
      id: 'gate-4',
      title: 'Gate 4 — Main Entry',
      narrative:
        "This is where most racegoers enter on race day. It's right off Racecourse Road, close to parking, rideshare drop-off, and the bus stop. Head through here and you're straight into the action.",
      calloutOffset: 85,
      // Camera south of Gate 4 (POI at -27.4311), looking NNW so Gate 4 is in frame
      camera: { longitude: 153.0660, latitude: -27.4330, height: 250, heading: 345, pitch: -42 },
      dwellTime: 8,
      poiId: 'gate-4',
    },
    {
      id: 'stradbroke-plaza',
      title: 'Stradbroke Plaza',
      narrative:
        "First thing you'll find inside the gates — food, drinks, and a buzzing atmosphere. Named after the famous Stradbroke Handicap, this is where the day starts for most punters.",
      calloutOffset: 138,
      // Camera south of Stradbroke Plaza (POI at -27.4300), looking NNW
      camera: { longitude: 153.0658, latitude: -27.4310, height: 190, heading: 340, pitch: -45 },
      dwellTime: 8,
      poiId: 'stradbroke-plaza',
    },
    {
      id: 'public-grandstand',
      title: 'Public Grandstand',
      narrative:
        "The main grandstand — multiple levels of seating with views across the entire course. The upper levels give you the best vantage point, especially on carnival days. Ground floor has accessible seating near the mounting yard.",
      calloutOffset: 138,
      // Camera south of Public Grandstand (POI at -27.4295), looking NNW
      camera: { longitude: 153.0654, latitude: -27.4314, height: 250, heading: 340, pitch: -42 },
      dwellTime: 8,
      poiId: 'public-grandstand',
    },
    {
      id: 'public-lawn',
      title: 'Public Lawn',
      narrative:
        "Prefer to be trackside? The Public Lawn puts you right next to the rail. Bring a picnic rug, grab a drink, and watch the horses thunder past just metres away. A favourite on sunny Brisbane race days.",
      // Camera south of Public Lawn (POI at -27.4293), looking NW
      camera: { longitude: 153.0658, latitude: -27.4312, height: 250, heading: 330, pitch: -42 },
      dwellTime: 8,
      poiId: 'public-lawn',
    },
    {
      id: 'mounting-yard',
      title: 'Mounting Yard',
      narrative:
        "Before each race, horses parade through the mounting yard so you can see them up close. Watch the jockeys mount up, check the horses' condition, and soak in the atmosphere. It's one of the best parts of the race-day experience.",
      // Camera south of Mounting Yard (POI at -27.4297), looking NNW
      camera: { longitude: 153.0648, latitude: -27.4316, height: 250, heading: 340, pitch: -45 },
      dwellTime: 10,
      poiId: 'mounting-yard',
    },
    {
      id: 'home-straight',
      title: 'The Home Straight',
      narrative:
        "This is where it all happens — 2,027 metres of world-class turf track. On race day, the roar of the crowd as the field charges down the straight is something you won't forget. You're ready for Eagle Farm.",
      target: { longitude: 153.0662, latitude: -27.4300, height: 0 },
      // Camera east of the straight, looking west down the track
      camera: { longitude: 153.0690, latitude: -27.4300, height: 350, heading: 270, pitch: -25 },
      dwellTime: 10,
      orbit: { speed: 0.5 },
    },
  ],
};

export const eagleFarm: TrackConfig = {
  id: 'eagle-farm',
  name: 'Eagle Farm Racecourse',
  shortName: 'Eagle Farm',
  location: 'Ascot, Brisbane QLD',
  operator: 'Brisbane Racing Club',
  coordinates: {
    longitude: 153.0650,
    latitude: -27.4300,
  },
  timezone: 'Australia/Brisbane',
  camera: {
    longitude: 153.065569,
    latitude: -27.433143,
    height: 306.31,
    heading: 3.19,
    pitch: -36.5,
  },
  bounds: {
    maxAltitude: 800,
    minAltitude: 80,
    maxDistance: 700,
    maxLatitude: -27.4260,
  },
  nearbyTracks: ['doomben'],
  brandColour: '#164e63',
  placeholderImage: '/assets/eagle-farm-blur.webp',
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
        'Level One has The Society Rooftop Bar — drinks with elevated views over the track and Stradbroke Plaza.',
      ],
    },
    {
      id: 'st-leger-grandstand',
      name: 'St Leger Grandstand',
      category: 'grandstand',
      description:
        'A heritage-listed Federation-style grandstand built in 1913, with extensions added in 1938. Features distinctive face brick walls, cast iron columns, and decorative timber trusses. No longer used as a race-day grandstand; the ground floor now hosts the Legends Room as a private function space. View it from the adjacent St Leger Lawn.',
      position: {
        longitude: 153.0663,
        latitude: -27.4301,
      },
      tips: [
        'Not a race-day grandstand — you will see it from the outside unless you are at a private function (the Legends Room is on the ground floor).',
        'Listed on the Queensland Heritage Register since 2004 as part of the Eagle Farm Racecourse precinct.',
        'The adjacent St Leger Lawn is a quieter alternative to the main public lawn for watching the racing without the carnival atmosphere.',
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
        'Three-level members grandstand built in 1958, named after Dr John Power, QTC President 1947–1965. Houses the Champagne Bar, Vice Regal Dining Room, Ascot Dining Room, and private suites. The BRC master plan signals future redevelopment of this part of the members precinct — check back before a visit to see if anything has changed.',
      position: {
        longitude: 153.0641,
        latitude: -27.4291,
      },
      tips: [
        'BRC membership required. Ground level has the Betting Auditorium and Champagne Bar.',
        'Scheduled for redevelopment as part of the long-term BRC master plan — the specifics are in flux, so catch it while it is still here.',
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
        'Stand at the rail near the 200m mark for the most visceral race experience — you can hear hooves and jockeys as a full field thunders past at 60km/h.',
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
    {
      id: 'st-leger-lawn',
      name: 'St Leger Lawn',
      category: 'viewing',
      description:
        'Public lawn area east of Stradbroke Plaza, adjacent to the heritage St Leger Grandstand. Used for marquee events and casual trackside viewing on race days.',
      position: {
        longitude: 153.0665,
        latitude: -27.4297,
      },
      tips: [
        'A good alternative to the Public Lawn — often less crowded.',
        'Event marquees are set up here on major carnival days.',
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
        'The fig tree at the heart of the plaza is the best shade on hot days — it is strung with fairy lights once the sun drops, under the Buffering Bar deck.',
      ],
    },
    {
      id: 'the-society',
      name: 'The Society Rooftop Bar',
      category: 'food-drink',
      description:
        'Rooftop bar located on Level One of the Public Grandstand, offering drinks with elevated views over the track and Stradbroke Plaza.',
      position: {
        longitude: 153.0654,
        latitude: -27.4298,
      },
      tips: [
        'Rooftop bar mood — drinks, music, and panoramic views. Better suited to the social scene than concentrated race-watching.',
        'Access via escalators near Stradbroke Plaza — no lift access. Smart casual dress code.',
      ],
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
    // --- Heritage & Attractions ---
    {
      id: 'the-tote',
      name: 'The Tote',
      category: 'amenities',
      description:
        'Heritage-listed Totalisator Building dating from 1913, with extensions in 1917, 1923, and the 1950s. Now home to the Queensland Horse Racing Museum, housing the James McGill Library, Pascoe Family Pictorial Record, and Stanley Collection of trophies — over 150 years of Queensland racing history under one roof.',
      position: {
        longitude: 153.0660,
        latitude: -27.4303,
      },
      tips: [
        'Worth a visit for racing history — the museum collection covers over 150 years of Queensland racing.',
        'One of the heritage-listed buildings on the Queensland Heritage Register (listed 2004).',
      ],
    },
    // --- Operations ---
    {
      id: 'mounting-yard',
      name: 'Mounting Yard',
      category: 'viewing',
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
        'Watch for horses that appear stressed or are sweating heavily — this is called "washing out" in racing, and it is a useful cue when reading horse condition.',
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
      tips: [
        'The most popular entry on race day — closest to parking, the rideshare drop-off on Lancaster Road, and the bus stops on Racecourse Road.',
        'Gates typically open 1–2 hours before the first race.',
      ],
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
        'The pedestrian tunnel is a hidden shortcut — many first-timers miss it, but it cuts the walk to the main precinct dramatically.',
        'Arrive early on carnival days — the infield fills fast.',
        'Accessible parking also available at Gate 4 off Racecourse Road.',
        'A mobility buggy runs between the car park and the gates on race days — ask at the infield entrance or check the accessibility section for details.',
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
  transport: {
    options: [
      {
        mode: 'train',
        name: 'Ascot Railway Station',
        description:
          'Doomben line from Central or Roma Street. Extra services run on major race days — check TransLink for timetables.',
        tips: [
          'Trains depart Central Station every 15–30 minutes on race days.',
          'The walk from the platform to Gate 4 takes about 5 minutes.',
        ],
        warning:
          'The heritage railway bridge is now closed for pedestrian access. You MUST exit the station and walk to Gate 4 at the intersection of Racecourse Road and Lancaster Road (5–10 minute walk).',
        poiId: 'ascot-station',
      },
      {
        mode: 'bus',
        name: 'Bus Routes 300 & 301',
        description:
          'Routes 300 and 301 from Adelaide Street in the city. Stops near the racecourse on Racecourse Road.',
        tips: [
          'Check TransLink for timetable changes on race days.',
        ],
      },
      {
        mode: 'car',
        name: 'Infield Car Park (Free)',
        description:
          'Over 1,000 spaces accessed via Nudgee Road near Racecourse Village Shopping Centre. Free on most race days. Vehicle tunnel entry with accessible parking on-site.',
        tips: [
          'Arrive early on carnival days — the infield fills fast.',
          'Use the pedestrian tunnel to cross to the main precinct from the infield.',
          'Accessible parking also available at Gate 4 off Racecourse Road.',
        ],
        poiId: 'infield-carpark',
      },
      {
        mode: 'rideshare',
        name: 'Rideshare Drop-off — Lancaster Road',
        description:
          'Drop-off point on Lancaster Road near Gate 4. The closest spot for Uber, Didi, and other rideshare services.',
        tips: [
          'Expect surge pricing after the last race. Consider walking to Ascot station instead.',
          'Pin your drop-off to "Eagle Farm Racecourse Gate 4" for the best result.',
        ],
      },
      {
        mode: 'rideshare',
        name: 'Taxi Rank — McGill Avenue',
        description:
          'Dedicated taxi rank on McGill Avenue, a short walk from the members precinct exit.',
      },
    ],
    notes:
      'On major carnival days (Stradbroke Season, Winter Racing Carnival), road closures may affect Lancaster Road. Check BRC website for event-day transport updates.',
  },
  accessibility: {
    summary:
      'Eagle Farm Racecourse offers a range of accessibility features for guests with disabilities. All entry gates have clear, level access and staff are trained to assist on arrival.',
    features: {
      wheelchairAccess: true,
      companionCard: false,
      hearingLoop: false,
      assistanceDogs: true,
    },
    mobilityDetails: [
      'All entry gates offer clear, level access for wheelchairs and mobility aids.',
      'Wide, paved walkways connect all major facilities and support wheelchairs, walkers, and prams.',
      'Accessible toilets available throughout the venue.',
      'Accessible parking in the Infield Car Park and at Gate 4 off Racecourse Road.',
      'Mobility buggy available to assist patrons from parking areas to entry gates.',
      'Wheelchair-accessible tables and rest areas provided. Food, beverage, and betting facilities accommodate wheelchair users.',
      'Lift access varies by area due to the heritage layout — contact BRC in advance for specific needs.',
    ],
    assistanceDetails: [
      'Service animals welcome — facilities available upon request.',
      'Information available in alternative formats: large print, braille, and easy read.',
      'First aid station located near the Raceday Office.',
      'Parents room available (see racecourse map for location).',
      'Trained staff and security officers available throughout the venue for assistance.',
    ],
    notes:
      'For specific accessibility enquiries or to arrange assistance, contact BRC on (07) 3268 2171, email admin@brc.com.au, or visit the Raceday Office on arrival.',
  },
  tours: [eagleFarmFirstVisitTour],
  routes: [
    {
      id: 'ascot-to-gate4',
      name: 'Ascot Station to Gate 4',
      description: 'The quickest walking path from the train platform to the main entry gate.',
      estimatedMinutes: 5,
      fromPOI: 'ascot-station',
      toPOI: 'gate-4',
      waypoints: [
        [153.063362,-27.429701],[153.063568,-27.429968],[153.063605,-27.430038],[153.063597,-27.430066],[153.063605,-27.430073],[153.063756,-27.430209],[153.064509,-27.4308],[153.06459,-27.430864],[153.064643,-27.430905],[153.064643,-27.430931],[153.064643,-27.430942],[153.06464,-27.430955],[153.064637,-27.430971],[153.064636,-27.430978],[153.064628,-27.431041],[153.064841,-27.431069],[153.065425,-27.431144],[153.065475,-27.43115],[153.065609,-27.431167],[153.065621,-27.431105]
      ],
    },
  ],
};
