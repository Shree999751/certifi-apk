// src/components/initialIssues.ts

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface UserProfile {
  points: number;
  level: number;
  badges: string[];
  userId: string;
  votedIssues: string[];
  username: string;
  fullName: string;
  role: 'citizen' | 'admin';
  city?: string;
  avatar?: string;
  avatarTitle?: string;
}

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: 'Pothole' | 'Waste Management' | 'Damaged Streetlight' | 'Water Leakage' | 'Public Infrastructure' | 'Other';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  lat: number;
  lng: number;
  image?: string; // base64 string
  video?: string; // base64 string video complain
  status: 'Reported' | 'Under Review' | 'In Progress' | 'Resolved';
  upvotes: number;
  downvotes: number;
  votedBy: string[]; // List of user IDs that voted
  comments: Comment[];
  createdAt: string;
  actionPlan: string;
  city?: string; // e.g. "Bengaluru"
  address?: string;
  reporterName?: string;
}

export const initialIssues: CivicIssue[] = [
  // BENGALURU SEEDS
  {
    id: "mock-1",
    title: "Large Pothole near Bellandur Flyover",
    description: "Deep pothole on the service road leading to the flyover. Very dangerous for two-wheelers, especially during evening hours and when it rains. Several vehicles have sustained damage already.",
    category: "Pothole",
    severity: "Critical",
    lat: 12.9352,
    lng: 77.6782,
    image: "",
    status: "In Progress",
    upvotes: 42,
    downvotes: 1,
    votedBy: ["mock-user-1"],
    comments: [
      { id: "c-1", author: "Rohan K.", text: "Nearly fell off my scooter here yesterday! Extremely dangerous.", createdAt: "2026-06-23T10:00:00Z" },
      { id: "c-2", author: "Aisha M. (Mod)", text: "Report forwarded to NHAI maintenance department. Update received: Crew scheduled for patch works tomorrow.", createdAt: "2026-06-23T14:30:00Z" }
    ],
    createdAt: "2026-06-22T08:15:00Z",
    actionPlan: "Deploy immediate asphalt patching crew. Divert light traffic during repairs.",
    city: "Bengaluru",
    address: "Outer Ring Rd, near Bellandur Flyover, Bengaluru, Karnataka"
  },
  {
    id: "mock-2",
    title: "Burst Water Pipeline Leakage",
    description: "Freshwater line burst near 12th Main Road, Indiranagar. Hundreds of liters of clean drinking water are being wasted and flooding the road, causing local congestion.",
    category: "Water Leakage",
    severity: "High",
    lat: 12.9719,
    lng: 77.6412,
    image: "",
    status: "Reported",
    upvotes: 28,
    downvotes: 0,
    votedBy: [],
    comments: [
      { id: "c-3", author: "Vikram S.", text: "BWSSB needs to shut off the valve immediately. Wasting clean water is criminal.", createdAt: "2026-06-24T05:00:00Z" }
    ],
    createdAt: "2026-06-24T02:00:00Z",
    actionPlan: "Isolate pipeline segment valve. Dispatch technicians to repair joints.",
    city: "Bengaluru",
    address: "12th Main Road, Indiranagar, Bengaluru, Karnataka"
  },
  {
    id: "mock-3",
    title: "Uncollected Garbage Pile near Metro Station",
    description: "Large heap of commercial and residential waste dumped near the exit of MG Road Metro Station. Emitting foul smell and attracting stray animals.",
    category: "Waste Management",
    severity: "Medium",
    lat: 12.9756,
    lng: 77.6068,
    image: "",
    status: "Under Review",
    upvotes: 15,
    downvotes: 2,
    votedBy: [],
    comments: [],
    createdAt: "2026-06-23T11:40:00Z",
    actionPlan: "Schedule BBMP trash compactors for immediate clearing. Place CCTV warning signs.",
    city: "Bengaluru",
    address: "MG Road Metro Station Exit, Bengaluru, Karnataka"
  },
  {
    id: "mock-4",
    title: "Broken Streetlight on 80 Feet Road",
    description: "Entire pole's LED fixture is broken and hanging loose. Street is pitch black at night, making it unsafe for pedestrians and walkers.",
    category: "Damaged Streetlight",
    severity: "Medium",
    lat: 12.9348,
    lng: 77.6225,
    image: "",
    status: "Resolved",
    upvotes: 19,
    downvotes: 0,
    votedBy: [],
    comments: [
      { id: "c-4", author: "Anoop G.", text: "Thank you for fixing this. Walking home at night is much safer now.", createdAt: "2026-06-23T20:15:00Z" }
    ],
    createdAt: "2026-06-21T09:00:00Z",
    actionPlan: "Replace broken LED array. Inspect grounding cable lines.",
    city: "Bengaluru",
    address: "80 Feet Road, Koramangala, Bengaluru, Karnataka"
  },

  // MUMBAI SEEDS
  {
    id: "mock-m1",
    title: "Severe Water Logging at Hindmata Junction",
    description: "Monsoon water logging at the low-lying Hindmata Junction in Dadar. Water levels are up to 2 feet, stalling local bus transit and cars.",
    category: "Water Leakage",
    severity: "Critical",
    lat: 19.0195,
    lng: 72.8428,
    image: "",
    status: "In Progress",
    upvotes: 56,
    downvotes: 0,
    votedBy: [],
    comments: [
      { id: "c-m1", author: "Priya N.", text: "Avoid this route completely, traffic is diverted via Dadar TT flyover.", createdAt: "2026-06-24T09:00:00Z" }
    ],
    createdAt: "2026-06-24T06:30:00Z",
    actionPlan: "Activate high-capacity dewatering pumps. Clear catch pit silt.",
    city: "Mumbai",
    address: "Hindmata Junction, Dadar, Mumbai, Maharashtra"
  },
  {
    id: "mock-m2",
    title: "Deep Potholes on Western Express Highway",
    description: "Multiple craters opened up on the northbound lanes near Andheri East exit. Heavy vehicles are braking suddenly, causing 4km tailbacks.",
    category: "Pothole",
    severity: "High",
    lat: 19.1176,
    lng: 72.8550,
    image: "",
    status: "Reported",
    upvotes: 34,
    downvotes: 1,
    votedBy: [],
    comments: [],
    createdAt: "2026-06-24T22:00:00Z",
    actionPlan: "Execute micro-surfacing and rapid cold mix patching during the night shift.",
    city: "Mumbai",
    address: "Western Express Highway, Andheri East, Mumbai, Maharashtra"
  },

  // DELHI SEEDS
  {
    id: "mock-d1",
    title: "Commercial Waste Accumulation near Connaught Place Outer Circle",
    description: "Illegal commercial garbage dump building up near the metro exit. Smells foul and is clogging pedestrian paths.",
    category: "Waste Management",
    severity: "High",
    lat: 28.6304,
    lng: 77.2177,
    image: "",
    status: "Under Review",
    upvotes: 22,
    downvotes: 0,
    votedBy: [],
    comments: [],
    createdAt: "2026-06-24T14:00:00Z",
    actionPlan: "Dispatch NDMC cleanup squad. Setup concrete garbage bins.",
    city: "Delhi",
    address: "Outer Circle, Connaught Place, New Delhi, Delhi"
  },
  {
    id: "mock-d2",
    title: "Non-functional Streetlights on Ring Road, Lajpat Nagar",
    description: "Entire series of 8 streetlights are dark. Commuters face difficulty merging into lanes at night. Safety hazard.",
    category: "Damaged Streetlight",
    severity: "Medium",
    lat: 28.5684,
    lng: 77.2435,
    image: "",
    status: "Reported",
    upvotes: 18,
    downvotes: 0,
    votedBy: [],
    comments: [],
    createdAt: "2026-06-24T18:15:00Z",
    actionPlan: "Check phase lines and replace burnt solar batteries.",
    city: "Delhi",
    address: "Ring Road, Lajpat Nagar, New Delhi, Delhi"
  }
];
