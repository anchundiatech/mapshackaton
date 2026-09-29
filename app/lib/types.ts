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
    lat: number | null;
    lng: number | null;
    city: string;
    country: string;
  };
  prizes: string;
  categories: string[];
}
