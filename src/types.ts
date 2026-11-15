export type VehicleType = 'suv' | 'sedan' | 'truck' | 'sport' | 'van' | 'hiker' | 'backpacker';

export interface ConvoyMember {
  id: string;
  name: string;
  role: 'host' | 'member';
  vehicleModel: string;
  vehicleType?: VehicleType;
  vehicleColor: string; // hex
  avatar: string; // custom emblem / callsign
  lat: number;
  lng: number;
  speed: number; // km/h or walking pacing
  heading: number; // degrees 0-360
  elevationMeters?: number; // mountain altitude
  lastUpdated: number;
  activeStatus?: 'fuel' | 'pit_stop' | 'traffic' | 'hazard' | 'all_good' | 'regroup' | 'water' | 'camp' | null;
  statusTime?: number;
  distanceToDestKm?: number;
  etaString?: string;
  relativeDistText?: string;
  isSimulated?: boolean;
  batteryLevel?: number; // 0 - 100%
  fuelRangeKm?: number; // Remaining range in km
  fuelType?: 'ev' | 'gas';
  isDeadReckoning?: boolean; // Signal lost, position extrapolated
  orderIndex?: number;
}

export interface Destination {
  name: string;
  address: string;
  lat: number;
  lng: number;
  altitudeMeters?: number;
}

export interface RegroupPoint {
  id: string;
  name: string;
  type: 'supercharger' | 'gas_station' | 'vista_overlook' | 'coffee_rest' | 'trailhead';
  lat: number;
  lng: number;
  distanceAheadKm: number;
  designatedBy: string;
  timestamp: number;
}

export interface VoiceMessage {
  id: string;
  senderId: string;
  senderName: string;
  audioDataUrl: string; // base64 recorded audio
  durationMs: number;
  timestamp: number;
}

export interface WeatherCondition {
  tempCelsius: number;
  condition: 'Clear' | 'Partly Cloudy' | 'Rain' | 'High Winds' | 'Mountain Fog' | 'Snow Squall';
  windSpeedKmh: number;
  windDirection: string;
  visibilityKm: number;
  alert?: string;
}

export interface ConvoyParty {
  partyId: string;
  hostId: string;
  destination: Destination;
  activityType?: 'convoy' | 'trek';
  routePolyline?: string;
  routePoints?: { lat: number; lng: number }[];
  radioChannel?: string;
  regroupThresholdKm?: number; // Customizable separation threshold (e.g. 1.0, 2.5, 5.0)
  activeRegroupPoint?: RegroupPoint | null;
  createdAt: number;
  isActive: boolean;
}

export interface StatusPingEvent {
  id: string;
  memberId: string;
  memberName: string;
  type: 'fuel' | 'pit_stop' | 'traffic' | 'hazard' | 'all_good' | 'regroup' | 'water' | 'camp';
  message: string;
  timestamp: number;
}

export interface TripStats {
  totalDistanceKm: number;
  maxSpeedKmh: number;
  averageSpeedKmh: number;
  elevationGainedMeters: number;
  stopsCount: number;
  durationMinutes: number;
  startTime: number;
}
