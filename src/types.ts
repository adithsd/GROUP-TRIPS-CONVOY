export interface ConvoyMember {
  id: string;
  name: string;
  role: 'host' | 'member';
  vehicleModel: string;
  vehicleColor: string; // e.g. '#3b82f6'
  avatar: string; // emoji or url
  lat: number;
  lng: number;
  speed: number; // km/h
  heading: number; // degrees 0-360
  lastUpdated: number;
  activeStatus?: 'fuel' | 'pit_stop' | 'traffic' | 'all_good' | null;
  statusTime?: number;
  distanceToDestKm?: number;
  etaString?: string;
  relativeDistText?: string;
  isSimulated?: boolean;
}

export interface Destination {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface ConvoyParty {
  partyId: string;
  hostId: string;
  destination: Destination;
  routePolyline?: string; // encoded polyline or array of points
  routePoints?: { lat: number; lng: number }[];
  createdAt: number;
  isActive: boolean;
}

export interface StatusPingEvent {
  id: string;
  memberId: string;
  memberName: string;
  type: 'fuel' | 'pit_stop' | 'traffic' | 'all_good';
  message: string;
  timestamp: number;
}
