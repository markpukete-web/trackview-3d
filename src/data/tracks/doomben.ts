import { TrackConfig } from '../../types/track';
import { Tour } from '../../types/tour';

const doombenFirstVisitTour: Tour = {
  id: 'first-visit-doomben',
  name: 'First Visit Guide',
  description: 'A quick 5-minute walking tour of Doomben Racecourse for first-time visitors.',
  estimatedMinutes: 5,
  version: 1,
  stops: [
    {
      id: 'overview',
      title: 'Welcome to Doomben',
      narrative: 'Welcome to Doomben Racecourse, a track known for its vibrant, compact atmosphere. Let\'s take a quick walk through the venue so you know exactly where to go on race day.',
      target: { longitude: 153.0741, latitude: -27.4281, height: 0 },
      camera: { longitude: 153.07406, latitude: -27.42965, height: 400, heading: 7.3, pitch: -45 },
      dwellTime: 10,
      orbit: { speed: 1.5 },
    },
    {
      id: 'main-entry',
      title: 'Gate 4 — Main Entry',
      narrative: 'Your day starts here at Gate 4 on Hampden Street. This is the main public entry where you will scan your tickets. It is a short 5-minute walk from the Doomben train station.',
      camera: { longitude: 153.0742, latitude: -27.4295, height: 180, heading: 0, pitch: -45 },
      dwellTime: 8,
      poiId: 'main-entry',
      calloutOffset: 120,
    },
    {
      id: 'raceday-office',
      title: 'Raceday Office',
      narrative: 'Just inside the gates is the Raceday Office. If you ever feel lost, need help with tickets, or are looking for lost property, the friendly staff here have you covered.',
      camera: { longitude: 153.0741, latitude: -27.4295, height: 160, heading: 0, pitch: -45 },
      dwellTime: 8,
      poiId: 'raceday-office',
    },
    {
      id: 'kirin-bar',
      title: 'KIRIN Bar',
      narrative: 'As you head towards the track, you will pass the KIRIN Bar on the ground floor of the Public Grandstand. It is a popular, lively spot for pre-race drinks and a natural meeting point if you are arriving with friends.',
      camera: { longitude: 153.0745, latitude: -27.4293, height: 160, heading: 0, pitch: -40 },
      dwellTime: 8,
      poiId: 'kirin-bar',
    },
    {
      id: 'mounting-yard',
      title: 'Mounting Yard',
      narrative: 'One of the best experiences on course! This is where horses parade before heading out to the track. You can get right up to the fence to see the jockeys and horses up close.',
      camera: { longitude: 153.0736, latitude: -27.4292, height: 160, heading: 0, pitch: -35 },
      dwellTime: 9,
      poiId: 'mounting-yard',
    },
    {
      id: 'public-grandstand',
      title: 'Public Grandstand',
      narrative: 'Your home base for the day. It features multiple levels of bars and dining, including Champions Bar on the ground floor. From here, you have easy access to the trackside Public Lawn.',
      camera: { longitude: 153.0747, latitude: -27.4292, height: 180, heading: 350, pitch: -40 },
      dwellTime: 10,
      poiId: 'public-grandstand',
    }
  ]
};

export const doomben: TrackConfig = {
  id: 'doomben',
  name: 'Doomben Racecourse',
  shortName: 'Doomben',
  location: 'Ascot, Brisbane QLD',
  operator: 'Brisbane Racing Club',
  coordinates: {
    longitude: 153.0741,
    latitude: -27.4281,
  },
  timezone: 'Australia/Brisbane',
  camera: {
    longitude: 153.07406,
    latitude: -27.42965,
    height: 335,
    heading: 7.3,
    pitch: -54.5,
  },
  mobileCamera: {
    longitude: 153.07406,
    latitude: -27.42965,
    height: 450, // Slightly higher for mobile portrait
    heading: 7.3,
    pitch: -54.5,
  },
  bounds: {
    maxAltitude: 800,
    minAltitude: 80,
    maxDistance: 700,
    maxLatitude: -27.4240,
  },
  nearbyTracks: ['eagle-farm'],
  brandColour: '#164e63',
  // TODO: produce /assets/doomben-blur.webp (blurred venue photo for loading screen)
  // and re-enable. Without it the loading screen has a plain dark backdrop.
  // placeholderImage: '/assets/doomben-blur.webp',
  pois: [
    {
      id: 'members-grandstand',
      name: "Members' Grandstand",
      category: 'grandstand',
      description: "The main members building at Doomben, housing multiple levels of bars, dining, and viewing areas. Smaller and more intimate than Eagle Farm's John Power Stand, reflecting Doomben's compact character.",
      position: { longitude: 153.0739, latitude: -27.4279 },
      tips: [
        "Members-only, but if you are a guest, the Bernborough Bar & Terrace on Level One has great views of the home straight.",
        "The 10,000 Room on Level Two is named after Doomben's signature race.",
      ],
    },
    {
      id: 'members-lawn',
      name: "Members' Lawn",
      category: 'viewing',
      description: "The grassed area between the Members' Grandstand and the trackside rail. Members gather here for a relaxed view of the races with easy access to the Members' Grandstand bars.",
      position: { longitude: 153.0738, latitude: -27.4278 },
      tips: ['As a general admission visitor, you cannot access this area, but you will see it as you walk past — the Public Lawn further east offers a similar experience.'],
    },
    {
      id: 'winning-enclosure',
      name: 'Winning Enclosure',
      category: 'operations',
      description: "Where winning horses are led after each race for the trophy presentation and official photos. Located between the Members' Grandstand and Public Grandstand.",
      position: { longitude: 153.0741, latitude: -27.4279 },
      tips: [
        'You can watch the presentations from nearby — it is a great spot to see jockeys and trainers up close after a race.',
        'Look for the weighing room nearby where jockeys weigh in post-race.',
      ],
    },
    {
      id: 'public-lawn',
      name: 'Public Lawn',
      category: 'viewing',
      description: 'The main open-air area for general admission visitors at Doomben. A large grassed area between the Public Grandstand and the trackside rail — perfect for spreading out a picnic rug and watching the action.',
      position: { longitude: 153.0751, latitude: -27.4279 },
      tips: [
        'Doomben\'s Public Lawn is more compact than Eagle Farm\'s, which actually makes it feel livelier on a big race day.',
        'Grab a spot near the rail for the best view of horses thundering past.'
      ]
    },
    {
      id: 'public-grandstand',
      name: 'Public Grandstand',
      category: 'grandstand',
      description: "Your home base as a general admission visitor at Doomben. A multi-level building with bars, dining options, and outdoor terraces. The TAB Champions Bar & Courtyard on the ground floor is the most accessible spot.",
      position: { longitude: 153.0747, latitude: -27.4282 },
      tips: [
        'Start at the TAB Champions Bar & Courtyard on the ground floor — casual, welcoming, and right in the middle of the action.',
        'Champions Takeaway, also on the ground floor, is handy for a quick bite between races.',
      ],
    },
    {
      id: 'st-leger-lawn',
      name: 'St Leger Lawn',
      category: 'viewing',
      description: "A quieter lawn area on the eastern end of the course. Named after one of racing's classic events, it offers a more relaxed alternative to the busier Public Lawn.",
      position: { longitude: 153.0757, latitude: -27.4281 },
      tips: [
        'If the Public Lawn is packed, St Leger Lawn is your escape.',
        'It is a bit further from the main action but far less crowded.',
      ],
    },
    {
      id: 'kirin-bar',
      name: 'KIRIN Bar',
      category: 'food-drink',
      description: 'A ground-level bar inside the Public Grandstand, popular for pre-race drinks and socialising as racegoers stream in from Gate 4.',
      position: { longitude: 153.0745, latitude: -27.4283 },
      tips: ['Good first stop after entering — easy to spot from the Main Entry walkway.'],
    },
    {
      id: 'connections-house',
      name: 'TAB Connections House',
      category: 'operations',
      description: 'Where horse owners and trainers gather on race day. Located near the mounting yard, it gives connections easy access between the saddling area and the viewing areas.',
      position: { longitude: 153.0741, latitude: -27.4285 },
      tips: ['You cannot get in here, but it is near the mounting yard — head this direction to watch horses being prepared.'],
    },
    {
      id: 'the-pavilion',
      name: 'The Pavilion',
      category: 'operations',
      description: 'A venue for horse connections on the western side of the course, near the mounting yard so connections can move quickly between the saddling area and viewing.',
      position: { longitude: 153.0733, latitude: -27.4281 },
    },
    {
      id: 'the-grove',
      name: 'The Grove',
      category: 'food-drink',
      description: 'A venue on the western side of the course, often used for corporate functions and special events during major race days.',
      position: { longitude: 153.0732, latitude: -27.4274 },
      tips: ["The Grove is usually a ticketed experience on big race days. Check BRC's website for packages."],
    },
    {
      id: 'merchandise',
      name: 'Merchandise Shop',
      category: 'amenities',
      description: "The on-course merchandise shop selling BRC branded gear, race day programs, and souvenirs. Located on the Members' Grandstand side of the course.",
      position: { longitude: 153.0739, latitude: -27.4281 },
      labelOffset: { x: 60, y: -50 },
      tips: ['Grab a race day program here if you want to follow the schedule and learn about the runners.'],
    },
    {
      id: 'raceday-office',
      name: 'Raceday Office',
      category: 'operations',
      description: 'Your first stop if you need help on race day. Handles ticket enquiries, lost property, and general information. The staff are experienced at helping first-time visitors.',
      position: { longitude: 153.0741, latitude: -27.4286 },
      labelOffset: { x: -60, y: -50 },
      tips: ['If you are feeling lost or overwhelmed on your first visit, the Raceday Office staff are genuinely helpful.']
    },
    {
      id: 'mounting-yard',
      name: 'Mounting Yard',
      category: 'operations',
      description: 'Where horses are paraded and saddled up before each race. One of the most exciting spots on course — you can get up close and see the horses and jockeys preparing for the race ahead.',
      position: { longitude: 153.0736, latitude: -27.4282 },
      tips: [
        'Do not miss the mounting yard parade before each race — it is free to watch and gives you a chance to see the horses up close.',
        'Look for how calm or agitated each horse appears to understand their temperament on the day.'
      ]
    },
    {
      id: 'main-entry',
      name: 'Main Entry (Gate 4)',
      category: 'transport',
      description: 'The main public entry from Hampden Street. This is where you will scan your tickets and enter the venue. General admission and pre-booked ticket holders all enter here.',
      position: { longitude: 153.0742, latitude: -27.4286 },
      labelOffset: { x: 70, y: -20 },
      tips: ['Arrive at least 30 minutes before the first race to avoid queues, especially on major race days.']
    },
    {
      id: 'members-carpark',
      name: 'Members Carpark',
      category: 'transport',
      description: 'Dedicated parking for BRC members, accessed via Gate 5 on Hampden Street at the eastern end of the course.',
      position: { longitude: 153.0754, latitude: -27.4286 }
    },
    {
      id: 'gate-5-entry',
      name: 'Gate 5 Entry',
      category: 'transport',
      description: 'Vehicle entry from Hampden Street for the Members Carpark at the eastern end of the course.',
      position: { longitude: 153.0752, latitude: -27.4287 }
    },
    {
      id: 'gate-2-entry',
      name: 'Gate 2 Entry',
      category: 'transport',
      description: 'Vehicle entry from Nudgee Road for infield parking. Used on major race days when main car parks fill up.',
      position: { longitude: 153.0725, latitude: -27.4274 }
    },
    {
      id: 'infield-carpark',
      name: 'Infield Car Park',
      category: 'transport',
      description: 'Public and overflow parking located in the track infield. Accessed via Gate 2 on Nudgee Road.',
      position: { longitude: 153.0754, latitude: -27.4269 },
      tips: [
        'Arrive early on major race days as this fills up fast.',
        'Follow the signs to safely cross from the infield to the main grandstand area.'
      ]
    }
  ],
  transport: {
    options: [
      {
        mode: 'train',
        name: 'Doomben Railway Station',
        description: 'The final stop on the Doomben line from Central Station. A direct and easy 5-minute walk up Hampden Street to the Main Entry.',
        tips: [
          'Trains run regularly on race days, but check TransLink for specific timetable changes.',
          'The walk from the station to Gate 4 is flat and clearly signposted.'
        ]
      },
      {
        mode: 'bus',
        name: 'Bus Route 301',
        description: 'Route 301 from Adelaide Street in the city stops near Doomben Racecourse.',
        tips: ['Check TransLink for the most up-to-date bus schedules and stops.']
      },
      {
        mode: 'car',
        name: 'Infield Car Park (Public)',
        description: 'Public and overflow parking located in the track infield, accessed via Gate 2 on Nudgee Road.',
        tips: [
          'Follow the signs to the pedestrian tunnel/crossing to get from the infield to the main grandstand area.',
          'Arrive early on major race days as this fills up fast.'
        ],
        poiId: 'infield-carpark'
      },
      {
        mode: 'car',
        name: 'Members Car Park',
        description: 'Dedicated parking for BRC members, accessed via Gate 5 on Hampden Street.',
        poiId: 'gate-5-entry'
      },
      {
        mode: 'rideshare',
        name: 'Rideshare Drop-off — Hampden Street',
        description: 'The main drop-off point for Uber, Didi, and Taxis is located along Hampden Street near the Gate 4 Main Entry.',
        tips: [
          'Pin your drop-off to "Doomben Racecourse Gate 4" for the easiest access.',
          'Expect surge pricing immediately after the final race.'
        ]
      }
    ],
    notes: 'On major carnival days like the Doomben 10,000, Hampden Street can experience heavy traffic. Public transport is highly recommended.',
  },
  accessibility: {
    summary: 'Doomben Racecourse is equipped with accessibility features to ensure all guests can enjoy race day. The compact nature of the track makes it relatively easy to navigate.',
    features: {
      wheelchairAccess: true,
      companionCard: false,
      hearingLoop: false,
      assistanceDogs: true,
    },
    mobilityDetails: [
      'All main entry gates (including Gate 4) provide clear, level access for wheelchairs and mobility aids.',
      "An elevator in the Public Grandstand provides access to upper dining and viewing levels.",
      "Accessible toilets are located on the ground floor of the Public Grandstand and on the Members' Grandstand side of the course.",
    ],
    assistanceDetails: [],
    notes: 'Contact BRC on (07) 3268 2171 for specific accessibility enquiries.',
  },
  tours: [doombenFirstVisitTour],
  routes: [],
};
