export interface Hackathon {
  id: string;
  name: string;
  description: string;
  organizer: string;
  websiteUrl: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'active' | 'upcoming';
  type: 'virtual' | 'hybrid' | 'in-person';
  location: {
    lat: number;
    lng: number;
    city: string;
    country: string;
  };
  prizes: string;
  categories: string[];
}

export const hackathons: Hackathon[] = [
  {
    id: 'eth-brussels',
    name: 'ETHGlobal Brussels',
    description: 'Join the world\'s leading Ethereum builders to prototype decentralized solutions for governance, privacy, and scaling. Features hands-on mentorship and developer workshops.',
    organizer: 'ETHGlobal',
    websiteUrl: 'https://ethglobal.com',
    startDate: '2026-05-20',
    endDate: '2026-05-23',
    status: 'active',
    type: 'in-person',
    location: {
      lat: 50.8503,
      lng: 4.3517,
      city: 'Brussels',
      country: 'Belgium'
    },
    prizes: '$100,000 USD in crypto track prizes',
    categories: ['Web3', 'Ethereum', 'DAO', 'DeFi']
  },
  {
    id: 'ai-gen-hack',
    name: 'AI Frontiers Hackathon',
    description: 'A global virtual hackathon focused on building agentic AI workflows, fine-tuning open-source LLMs, and creating production-ready autonomous applications.',
    organizer: 'AI Community Hub',
    websiteUrl: 'https://devpost.com',
    startDate: '2026-05-18',
    endDate: '2026-05-25',
    status: 'active',
    type: 'virtual',
    location: {
      lat: 37.7749,
      lng: -122.4194, // Centered virtual hubs at SF coordinates
      city: 'Virtual (SF Hub)',
      country: 'Global'
    },
    prizes: '$50,000 USD + API credits',
    categories: ['Artificial Intelligence', 'Agents', 'LLMs', 'Open Source']
  },
  {
    id: 'mlh-spring',
    name: 'MLH Global Hack Week: Build',
    description: 'Major League Hacking\'s virtual hackathon week featuring developer mini-events, daily challenges, and collaboration tracks for student hackers worldwide.',
    organizer: 'Major League Hacking',
    websiteUrl: 'https://mlh.io',
    startDate: '2026-06-12',
    endDate: '2026-06-19',
    status: 'upcoming',
    type: 'virtual',
    location: {
      lat: 40.7128,
      lng: -74.0060, // NYC
      city: 'Virtual (NYC Hub)',
      country: 'Global'
    },
    prizes: 'Hardware prizes, badges, and sponsor awards',
    categories: ['Beginner-Friendly', 'General', 'Web Dev', 'Mobile']
  },
  {
    id: 'hack-mit',
    name: 'HackMIT 2026',
    description: 'MIT\'s flagship hackathon welcoming undergraduate students from around the globe for 36 hours of intense prototyping, hacking, and networking in Cambridge.',
    organizer: 'Massachusetts Institute of Technology',
    websiteUrl: 'https://hackmit.org',
    startDate: '2026-09-19',
    endDate: '2026-09-20',
    status: 'upcoming',
    type: 'in-person',
    location: {
      lat: 42.3601,
      lng: -71.0942,
      city: 'Cambridge, MA',
      country: 'United States'
    },
    prizes: '$25,000 USD total prize pool + internships',
    categories: ['Hardware', 'Software', 'AI', 'BioTech']
  },
  {
    id: 'singapore-innov',
    name: 'Singapore Innovation Hackathon',
    description: 'Co-organized by Singapore Tech Authority to develop smart city infrastructure solutions, public transportation utilities, and urban sustainability projects.',
    organizer: 'SG Tech Agency',
    websiteUrl: 'https://www.gov.sg',
    startDate: '2026-05-21',
    endDate: '2026-05-24',
    status: 'active',
    type: 'in-person',
    location: {
      lat: 1.3521,
      lng: 103.8198,
      city: 'Singapore',
      country: 'Singapore'
    },
    prizes: '$40,000 SGD + Venture Funding Opportunities',
    categories: ['Smart City', 'Sustainability', 'IoT', 'GovTech']
  },
  {
    id: 'latam-spark',
    name: 'LatAm Tech Spark 2026',
    description: 'Accelerating tech entrepreneurship in Latin America. We invite designers, developers, and product minds to build solutions tackling financial inclusion and local logistics.',
    organizer: 'LatAm Ventures',
    websiteUrl: 'https://taikai.network',
    startDate: '2026-07-05',
    endDate: '2026-07-08',
    status: 'upcoming',
    type: 'hybrid',
    location: {
      lat: 19.4326,
      lng: -99.1332,
      city: 'Mexico City',
      country: 'Mexico'
    },
    prizes: '$15,000 USD in equity-free cash prizes',
    categories: ['FinTech', 'Logistics', 'EdTech', 'Social Impact']
  },
  {
    id: 'climate-devpost',
    name: 'Global Climate Crisis Hackathon',
    description: 'An online global collaborative hackathon focused on developing software tools for tracking carbon footprint, optimize renewable energy grids, and educating consumers.',
    organizer: 'Devpost & Climate Action Coalition',
    websiteUrl: 'https://devpost.com',
    startDate: '2026-08-01',
    endDate: '2026-08-15',
    status: 'upcoming',
    type: 'virtual',
    location: {
      lat: 52.5200,
      lng: 13.4050, 
      city: 'Virtual (Berlin Hub)',
      country: 'Global'
    },
    prizes: '$60,000 USD total prize pool',
    categories: ['ClimateTech', 'Green Energy', 'Data Science', 'SaaS']
  },
  {
    id: 'tokyo-society',
    name: 'Tokyo Future Society Hack',
    description: 'Building tools for senior care, high-density residential community support, and next-generation urban farming in the heart of Tokyo.',
    organizer: 'Tokyo Metropolitan Government',
    websiteUrl: 'https://www.metro.tokyo.lg.jp',
    startDate: '2026-05-19',
    endDate: '2026-05-22',
    status: 'active',
    type: 'in-person',
    location: {
      lat: 35.6762,
      lng: 139.6503,
      city: 'Tokyo',
      country: 'Japan'
    },
    prizes: '¥3,000,000 JPY + Office Space Incubation',
    categories: ['CivicTech', 'HealthTech', 'Robotics', 'Community']
  },
  {
    id: 'nairobi-summit',
    name: 'Africa Web Summit Hackathon',
    description: 'Focusing on building mobile-first decentralized applications for mobile money transactions, offline education networks, and distributed healthcare records.',
    organizer: 'Africa Web Consortium',
    websiteUrl: 'https://africawebsummit.com',
    startDate: '2026-06-25',
    endDate: '2026-06-28',
    status: 'upcoming',
    type: 'hybrid',
    location: {
      lat: -1.2921,
      lng: 36.8219,
      city: 'Nairobi',
      country: 'Kenya'
    },
    prizes: '$20,000 USD + Mentorship program',
    categories: ['Mobile-first', 'FinTech', 'Health', 'Education']
  },
  {
    id: 'sydney-builders',
    name: 'Sydney Tech Builders Hack',
    description: 'Bring your laptops and join local engineers in Sydney for a fast-paced weekend focused on high-performance web applications, developer tooling, and API optimization.',
    organizer: 'Sydney Dev Community',
    websiteUrl: 'https://meetup.com',
    startDate: '2026-07-24',
    endDate: '2026-07-26',
    status: 'upcoming',
    type: 'in-person',
    location: {
      lat: -33.8688,
      lng: 151.2093,
      city: 'Sydney',
      country: 'Australia'
    },
    prizes: '$10,000 AUD in gadget vouchers',
    categories: ['Web Dev', 'Developer Tooling', 'APIs']
  }
];
