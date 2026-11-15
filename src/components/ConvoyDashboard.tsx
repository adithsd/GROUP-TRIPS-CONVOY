import React, { useState, useEffect, useRef, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { 
  MapPin, Fuel, Coffee, AlertTriangle, CheckCircle, 
  Maximize, LocateFixed, Users, Clock, Radio, ShieldAlert,
  Volume2, VolumeX, Compass, Navigation, Mountain, Droplets, Tent, Footprints, 
  TrendingUp, BatteryCharging, Trophy, Sliders, CloudSun, Download, ShieldCheck,
  AlertCircle, Sparkles
} from 'lucide-react';
import { ConvoyParty, ConvoyMember, StatusPingEvent } from '../types';
import { convoyService } from '../services/convoyService';
import { soundService } from '../services/soundService';
import { VehicleIcon } from './VehicleIcon';
import { FormationRadar } from './FormationRadar';
import { VoiceWalkieTalkie } from './VoiceWalkieTalkie';
import { WeatherHUD } from './WeatherHUD';
import { RegroupModal } from './RegroupModal';
import { ExpeditionDebriefModal } from './ExpeditionDebriefModal';

interface ConvoyDashboardProps {
  party: ConvoyParty;
  currentUser: ConvoyMember;
  members: ConvoyMember[];
  pings: StatusPingEvent[];
  isSimulating: boolean;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Automotive Night-Rally Map Styling (Stealth Dark Palette)
const TACTICAL_MAP_STYLES: any[] = [
  { elementType: 'geometry', stylers: [{ color: '#0f141c' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b0e14' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8899a6' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#16202e' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#273549' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#192231' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1b2431' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#090d14' }]
  }
];

// Inner controller that handles Google Maps API instances
const MapController: React.FC<{
  party: ConvoyParty;
  currentUser: ConvoyMember;
  members: ConvoyMember[];
  selectedMemberId: string | null;
  onSelectMember: (id: string | null) => void;
  routePolylinePoints: { lat: number; lng: number }[];
  fitAllCounter: number;
}> = ({ party, currentUser, members, selectedMemberId, onSelectMember, routePolylinePoints, fitAllCounter }) => {
  const map = useMap();
  const [polyRenderer, setPolyRenderer] = useState<any | null>(null);

  // Fit All bounds
  const fitAllBounds = useCallback(() => {
    if (!map || !(window as any).google?.maps) return;
    try {
      const bounds = new (window as any).google.maps.LatLngBounds();
      bounds.extend({ lat: currentUser.lat, lng: currentUser.lng });
      members.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
      if (party.destination) {
        bounds.extend({ lat: party.destination.lat, lng: party.destination.lng });
      }
      if (party.activeRegroupPoint) {
        bounds.extend({ lat: party.activeRegroupPoint.lat, lng: party.activeRegroupPoint.lng });
      }
      map.fitBounds(bounds, { top: 80, right: 80, bottom: 150, left: 80 });
    } catch (e) {
      console.warn('fitBounds error:', e);
    }
  }, [map, currentUser, members, party.destination, party.activeRegroupPoint]);

  // Trigger fit bounds on counter change
  useEffect(() => {
    if (fitAllCounter > 0) {
      fitAllBounds();
    }
  }, [fitAllCounter, fitAllBounds]);

  // Initial fit
  useEffect(() => {
    if (map && members.length > 0) {
      const timer = setTimeout(() => {
        fitAllBounds();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [map]);

  // Draw 3D-styled Highway Route Polyline
  useEffect(() => {
    if (!map || !(window as any).google?.maps) return;

    if (polyRenderer) {
      polyRenderer.setMap(null);
    }

    if (routePolylinePoints.length > 0) {
      const poly = new (window as any).google.maps.Polyline({
        path: routePolylinePoints,
        geodesic: true,
        strokeColor: '#f59e0b', // Safety Highway Amber
        strokeOpacity: 0.95,
        strokeWeight: 5,
        map: map
      });
      setPolyRenderer(poly);
    } else if (party.destination && currentUser) {
      const poly = new (window as any).google.maps.Polyline({
        path: [
          { lat: currentUser.lat, lng: currentUser.lng },
          { lat: party.destination.lat, lng: party.destination.lng }
        ],
        geodesic: true,
        strokeColor: '#f59e0b',
        strokeOpacity: 0.85,
        strokeWeight: 5,
        map: map
      });
      setPolyRenderer(poly);
    }
  }, [map, routePolylinePoints, party.destination, currentUser]);

  // Center on selected member
  useEffect(() => {
    if (!map) return;
    if (selectedMemberId) {
      const target = members.find(m => m.id === selectedMemberId);
      if (target) {
        map.panTo({ lat: target.lat, lng: target.lng });
        map.setZoom(16);
      }
    }
  }, [selectedMemberId, members, map]);

  const isTrek = party.activityType === 'trek';

  return (
    <>
      {/* 3D Destination Beacon Marker */}
      {party.destination && (
        <AdvancedMarker
          position={{ lat: party.destination.lat, lng: party.destination.lng }}
          title={party.destination.name}
        >
          <div className="relative group cursor-pointer marker-pin-3d">
            <div className="absolute -inset-2 bg-rose-500/40 rounded-full animate-ping pointer-events-none" />
            <div className="relative bg-gradient-to-b from-rose-600 to-amber-600 text-white px-3 py-1.5 rounded-xl shadow-2xl flex items-center gap-2 border border-white/40 font-mono">
              {isTrek ? <Mountain className="w-4 h-4 text-white" /> : <MapPin className="w-4 h-4 fill-white" />}
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider text-rose-200 block font-extrabold leading-none">
                  {isTrek ? 'SUMMIT TARGET' : 'TARGET'}
                </span>
                <span className="text-xs font-bold leading-tight truncate max-w-[150px] block">{party.destination.name}</span>
              </div>
            </div>
          </div>
        </AdvancedMarker>
      )}

      {/* 3D Designated Regroup Waypoint Marker */}
      {party.activeRegroupPoint && (
        <AdvancedMarker
          position={{ lat: party.activeRegroupPoint.lat, lng: party.activeRegroupPoint.lng }}
          title={`Convoy Regroup: ${party.activeRegroupPoint.name}`}
        >
          <div className="relative group cursor-pointer marker-pin-3d">
            <div className="absolute -inset-2 bg-amber-400/50 rounded-full animate-ping pointer-events-none" />
            <div className="relative bg-gradient-to-b from-amber-500 to-amber-700 text-slate-950 px-3 py-1.5 rounded-xl shadow-2xl flex items-center gap-2 border-2 border-amber-300 font-mono">
              <Compass className="w-4 h-4 text-slate-950 animate-spin" />
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider text-amber-950 block font-black leading-none">
                  REGROUP LOCK
                </span>
                <span className="text-xs font-black leading-tight truncate max-w-[150px] block">
                  {party.activeRegroupPoint.name}
                </span>
              </div>
            </div>
          </div>
        </AdvancedMarker>
      )}

      {/* 3D Convoy / Trek Members Live Custom Overlays */}
      {members.map((member) => {
        const isMe = member.id === currentUser.id;
        const isSelected = selectedMemberId === member.id;

        return (
          <AdvancedMarker
            key={member.id}
            position={{ lat: member.lat, lng: member.lng }}
            onClick={() => onSelectMember(member.id)}
            title={`${member.name} - ${member.vehicleModel}`}
          >
            <div className="relative flex flex-col items-center cursor-pointer group marker-pin-3d">
              {/* Active Status Ping Notification Bubble */}
              {member.activeStatus && (
                <div className="absolute -top-11 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wide shadow-2xl flex items-center gap-1.5 border animate-bounce bg-[#0f141f] border-amber-500/60 text-amber-300">
                  {member.activeStatus === 'fuel' && '⛽ REFUELING STOP'}
                  {member.activeStatus === 'pit_stop' && '☕ PIT STOP'}
                  {member.activeStatus === 'water' && '💧 WATER SPRING'}
                  {member.activeStatus === 'camp' && '🏕️ CAMPSITE REST'}
                  {member.activeStatus === 'traffic' && '⚠️ HEAVY TRAFFIC'}
                  {member.activeStatus === 'hazard' && (isTrek ? '🥾 STEEP SCRAMBLE' : '🚨 ROAD HAZARD')}
                  {member.activeStatus === 'all_good' && (isTrek ? '👍 ON TRAIL' : '👍 ALL CLEAR')}
                  {member.activeStatus === 'regroup' && '📡 REGROUP CALL'}
                </div>
              )}

              {/* Dead Reckoning Indicator badge if off-grid */}
              {member.isDeadReckoning && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap px-2 py-0.5 rounded-full text-[8px] font-mono font-bold tracking-wide shadow-md bg-amber-950/90 border border-amber-400 text-amber-300 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-amber-400" />
                  <span>DEAD RECKONING</span>
                </div>
              )}

              {/* 3D Elevated Vehicle/Hiker Plinth */}
              <div className="relative">
                {isSelected && (
                  <div 
                    className="absolute -inset-3 rounded-full animate-pulse border-2"
                    style={{ borderColor: member.vehicleColor }}
                  />
                )}

                <div 
                  className={`relative p-2.5 rounded-2xl transition-all duration-300 ${
                    isMe 
                      ? 'bg-gradient-to-b from-[#1c2433] to-[#0c1017] border-2 border-amber-400 ring-4 ring-amber-400/25 shadow-2xl shadow-amber-500/20' 
                      : 'bg-gradient-to-b from-[#18202c] to-[#0c1017] border border-white/20 shadow-xl'
                  } group-hover:scale-110 group-hover:-translate-y-1`}
                  style={{
                    boxShadow: isMe 
                      ? '0 12px 24px -4px rgba(0,0,0,0.8), 0 0 15px rgba(245, 158, 11, 0.3)' 
                      : '0 10px 20px -4px rgba(0,0,0,0.7)'
                  }}
                >
                  <VehicleIcon
                    type={member.vehicleType || (isTrek ? 'hiker' : 'suv')}
                    color={member.vehicleColor}
                    heading={member.heading}
                    size={36}
                    showHeadlights={!isTrek}
                  />

                  {/* Speed / Pacing Pill underneath */}
                  <div className="mt-1.5 flex items-center justify-between gap-1 px-1 text-[9px] font-mono digital-recessed rounded-md py-0.5">
                    <span className="font-bold text-white">
                      {member.speed} <span className="text-[7px] text-slate-400">KM/H</span>
                    </span>
                    {member.elevationMeters ? (
                      <span className="text-amber-400 font-bold text-[8px]">{member.elevationMeters}m</span>
                    ) : (
                      <span className="text-amber-400 font-bold">{Math.round(member.heading)}°</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Driver / Hiker Callout Tag */}
              <div className="mt-1 px-2.5 py-0.5 rounded-md bg-[#080b11]/95 border border-white/15 text-[10px] font-mono font-bold text-white tracking-wider flex items-center gap-1 shadow-lg">
                <span>{member.name.split(' ')[0]}</span>
                {isMe && <span className="text-amber-400 font-extrabold text-[9px]">(YOU)</span>}
              </div>
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
};

export const ConvoyDashboard: React.FC<ConvoyDashboardProps> = ({
  party,
  currentUser,
  members,
  pings,
  isSimulating
}) => {
  const isTrek = party.activityType === 'trek';
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [routePoints, setRoutePoints] = useState<{ lat: number; lng: number }[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [fitAllCounter, setFitAllCounter] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(soundService.getIsMuted());
  const [showRadarFormation, setShowRadarFormation] = useState(true);

  // New Modals and HUD panels
  const [showWalkieTalkie, setShowWalkieTalkie] = useState(false);
  const [showRegroupModal, setShowRegroupModal] = useState(false);
  const [showDebriefModal, setShowDebriefModal] = useState(false);

  // Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // GPS geolocation tracking
  useEffect(() => {
    if (isSimulating) return;

    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed, heading } = pos.coords;
        const currentSpeed = speed !== null && speed >= 0 ? Number((speed * 3.6).toFixed(1)) : (isTrek ? 4.2 : 48);
        const currentHeading = heading !== null && heading >= 0 ? Math.round(heading) : 45;
        const distKm = calculateDistance(latitude, longitude, party.destination.lat, party.destination.lng);
        const speedDenominator = isTrek ? Math.max(currentSpeed, 3.5) : Math.max(currentSpeed, 35);
        const etaMin = Math.round((distKm / speedDenominator) * 60);
        const etaStr = etaMin > 60 ? `${Math.floor(etaMin / 60)}h ${etaMin % 60}m` : `${etaMin}m`;

        convoyService.updateLocation(
          latitude,
          longitude,
          currentSpeed,
          currentHeading,
          Number(distKm.toFixed(1)),
          etaStr,
          'You'
        );
      },
      (err) => {
        console.warn('Geolocation watch error / simulated fallback:', err);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [party.destination, isSimulating, isTrek]);

  // Google Maps Directions Route calculation
  useEffect(() => {
    const fetchDirections = async () => {
      if ((window as any).google?.maps && (window as any).google.maps.DirectionsService && !isTrek) {
        try {
          const directionsService = new (window as any).google.maps.DirectionsService();
          directionsService.route(
            {
              origin: { lat: currentUser.lat, lng: currentUser.lng },
              destination: { lat: party.destination.lat, lng: party.destination.lng },
              travelMode: (window as any).google.maps.TravelMode.DRIVING
            },
            (result: any, status: any) => {
              if (status === 'OK' && result.routes?.[0]?.overview_path) {
                const path = result.routes[0].overview_path.map((pt: any) => ({
                  lat: pt.lat(),
                  lng: pt.lng()
                }));
                setRoutePoints(path);
                convoyService.updateRoutePoints(path);
                return;
              }
            }
          );
        } catch (e) {
          console.warn('Google Maps Directions fallback:', e);
        }
      }

      // Fallback route interpolation
      const pts = [];
      const startLat = currentUser.lat;
      const startLng = currentUser.lng;
      const endLat = party.destination.lat;
      const endLng = party.destination.lng;

      for (let i = 0; i <= 24; i++) {
        const factor = i / 24;
        const curveOffset = Math.sin(factor * Math.PI) * (isTrek ? 0.008 : 0.025);
        pts.push({
          lat: startLat + (endLat - startLat) * factor + curveOffset,
          lng: startLng + (endLng - startLng) * factor
        });
      }
      setRoutePoints(pts);
      convoyService.updateRoutePoints(pts);
    };

    fetchDirections();
  }, [party.destination, currentUser.lat, currentUser.lng, isTrek]);

  // Compute Maximum Headway Gap between any 2 members
  let maxSeparationKm = 0;
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const d = calculateDistance(members[i].lat, members[i].lng, members[j].lat, members[j].lng);
      if (d > maxSeparationKm) maxSeparationKm = d;
    }
  }
  const thresholdKm = party.regroupThresholdKm || (isTrek ? 1.0 : 2.5);
  const isGapExceeded = maxSeparationKm > thresholdKm;

  // Compute EV Range Bottleneck across members
  const lowestRangeMember = members.length > 0
    ? [...members].sort((a, b) => (a.fuelRangeKm ?? 999) - (b.fuelRangeKm ?? 999))[0]
    : null;

  const handleStatusPing = (type: 'fuel' | 'pit_stop' | 'traffic' | 'hazard' | 'all_good' | 'regroup' | 'water' | 'camp') => {
    const messages = {
      fuel: isTrek ? 'Calorie & Snack Refuel Stop' : 'Needs Fuel / Charging Stop',
      pit_stop: isTrek ? '5-Min Pack Adjustment Break' : 'Stopping for Rest & Coffee',
      traffic: isTrek ? 'Crowded Trail Switchback' : 'Encountered Heavy Traffic Slowdown',
      hazard: isTrek ? 'Warning: Steep Technical Scramble / Loose Rock' : 'Warning: Road Hazard / Obstruction Ahead',
      all_good: isTrek ? 'On Trail Pace - Holding Formation' : 'In Formation - All Systems Nominal',
      regroup: isTrek ? 'Trail Squad Regroup - Wait at Marker' : 'Convoy Regroup Request - Slow Pacing',
      water: 'Fresh Mountain Water Spring Verified',
      camp: 'Designated Basecamp / Rest Overlook'
    };
    convoyService.sendStatusPing(type, messages[type]);
    setToastMessage(`BROADCAST [${party.radioChannel || 'CH-19'}]: ${messages[type]}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleAudio = () => {
    const isMuted = soundService.toggleMute();
    setIsAudioMuted(isMuted);
  };

  const handleEndTrip = () => {
    convoyService.leaveParty();
    setShowDebriefModal(false);
  };

  return (
    <div className="flex-1 flex flex-col relative h-[calc(100vh-57px)] overflow-hidden bg-[#090c10]">
      {/* 3D Toast Alert Banner */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 cockpit-panel-3d border border-amber-400 text-amber-300 px-5 py-2.5 rounded-2xl shadow-2xl font-mono text-xs flex items-center gap-2.5 animate-bounce">
          <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Convoy Regroup Gap Warning Banner when threshold exceeded */}
      {isGapExceeded && !party.activeRegroupPoint && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 cockpit-panel-3d border-2 border-amber-400 text-slate-100 px-4 py-2 rounded-2xl shadow-2xl font-mono text-xs flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-amber-400 font-extrabold uppercase">
              {isTrek ? 'TRAIL GAP ALERT:' : 'CONVOY GAP WARNING:'}
            </strong> Headway gap is {maxSeparationKm.toFixed(1)} km (Threshold: {thresholdKm.toFixed(1)} km).
          </span>
          <button
            onClick={() => setShowRegroupModal(true)}
            className="px-2.5 py-1 rounded-lg btn-amber-3d text-slate-950 font-black text-[10px] ml-1 shrink-0"
          >
            Auto-Find Regroup
          </button>
        </div>
      )}

      {/* Main Map Viewport with 3D Perspective */}
      <div className="flex-1 w-full h-full relative">
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={{ lat: currentUser.lat, lng: currentUser.lng }}
            defaultZoom={isTrek ? 14 : 13}
            mapId="DEMO_MAP_ID"
            disableDefaultUI={false}
            gestureHandling={'greedy'}
            className="w-full h-full"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            <MapController
              party={party}
              currentUser={currentUser}
              members={members}
              selectedMemberId={selectedMemberId}
              onSelectMember={setSelectedMemberId}
              routePolylinePoints={routePoints}
              fitAllCounter={fitAllCounter}
            />
          </Map>
        </APIProvider>

        {/* Top-Left: Tactical Telemetry HUD & Push-To-Ping Actions */}
        <div className="absolute top-4 left-4 z-30 flex flex-col gap-2 max-w-sm sm:max-w-md pointer-events-auto">
          {/* CB Radio / Alpine Pack Radio Status Box */}
          <div className="cockpit-panel-3d rounded-2xl p-2.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
              <div className="leading-tight">
                <span className="text-[10px] text-slate-400 font-mono block">
                  {isTrek ? 'ALPINE PACK RADIO NET' : 'TACTICAL CB RADIO'}
                </span>
                <span className="font-mono font-extrabold text-white">
                  {party.radioChannel || (isTrek ? 'CH-07 ALPINE PACK (146.520 MHz)' : 'CH-19 (146.520 MHz)')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleAudio}
                className="p-1.5 rounded-lg btn-tactile text-slate-300"
                title={isAudioMuted ? 'Unmute CB Audio' : 'Mute CB Audio'}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>
              <button
                type="button"
                onClick={() => setShowRadarFormation(!showRadarFormation)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition border ${
                  showRadarFormation 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm' 
                    : 'btn-tactile text-slate-400'
                }`}
              >
                {isTrek ? 'TRAIL HUD' : 'RADAR HUD'}
              </button>
            </div>
          </div>

          {/* Quick Push-To-Ping 3D Actions */}
          <div className="cockpit-panel-3d rounded-2xl p-2 flex flex-wrap items-center gap-1.5 shadow-2xl">
            <button
              onClick={() => handleStatusPing('all_good')}
              className="px-2.5 py-1.5 rounded-xl btn-tactile text-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isTrek ? 'On Trail' : 'All Clear'}</span>
            </button>

            {isTrek ? (
              <>
                <button
                  onClick={() => handleStatusPing('water')}
                  className="px-2.5 py-1.5 rounded-xl btn-tactile text-blue-300 font-mono text-[11px] font-bold flex items-center gap-1.5"
                >
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  <span>Water Spring</span>
                </button>
                <button
                  onClick={() => handleStatusPing('camp')}
                  className="px-2.5 py-1.5 rounded-xl btn-tactile text-amber-300 font-mono text-[11px] font-bold flex items-center gap-1.5"
                >
                  <Tent className="w-3.5 h-3.5 text-amber-400" />
                  <span>Camp / Rest</span>
                </button>
                <button
                  onClick={() => handleStatusPing('hazard')}
                  className="px-2.5 py-1.5 rounded-xl btn-tactile text-rose-300 font-mono text-[11px] font-bold flex items-center gap-1.5"
                >
                  <Footprints className="w-3.5 h-3.5 text-rose-400" />
                  <span>Scramble / SOS</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleStatusPing('fuel')}
                  className="px-2.5 py-1.5 rounded-xl btn-tactile text-amber-300 font-mono text-[11px] font-bold flex items-center gap-1.5"
                >
                  <Fuel className="w-3.5 h-3.5 text-amber-400" />
                  <span>Refuel</span>
                </button>
                <button
                  onClick={() => handleStatusPing('pit_stop')}
                  className="px-2.5 py-1.5 rounded-xl btn-tactile text-slate-200 font-mono text-[11px] font-bold flex items-center gap-1.5"
                >
                  <Coffee className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pit Stop</span>
                </button>
                <button
                  onClick={() => handleStatusPing('hazard')}
                  className="px-2.5 py-1.5 rounded-xl btn-tactile text-rose-300 font-mono text-[11px] font-bold flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Hazard</span>
                </button>
              </>
            )}
          </div>

          {/* Formation Radar Overlay */}
          {showRadarFormation && (
            <FormationRadar
              members={members}
              currentUserId={currentUser.id}
              onSelectMember={setSelectedMemberId}
              selectedMemberId={selectedMemberId}
            />
          )}

          {/* Pass & Corridor Weather HUD */}
          <WeatherHUD
            lat={currentUser.lat}
            lng={currentUser.lng}
            isTrek={isTrek}
          />
        </div>

        {/* Top-Right: 3D Tactical Action Dock */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 pointer-events-auto">
          {/* Push-to-Talk Walkie Talkie Opener */}
          <button
            onClick={() => setShowWalkieTalkie(!showWalkieTalkie)}
            className={`p-3 rounded-2xl shadow-2xl transition border ${
              showWalkieTalkie 
                ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold' 
                : 'btn-tactile text-white'
            }`}
            title="Open CB Radio Walkie-Talkie"
          >
            <Radio className={`w-5 h-5 ${showWalkieTalkie ? 'text-slate-950' : 'text-amber-400'}`} />
          </button>

          {/* Regroup Auto-Finder & Separation Settings */}
          <button
            onClick={() => setShowRegroupModal(true)}
            className="btn-tactile text-white p-3 rounded-2xl shadow-2xl"
            title="Configure Regroup Threshold & POIs"
          >
            <Compass className="w-5 h-5 text-amber-400" />
          </button>

          {/* Expedition Debrief & GPX/KML Export */}
          <button
            onClick={() => setShowDebriefModal(true)}
            className="btn-tactile text-white p-3 rounded-2xl shadow-2xl"
            title="Expedition Debrief & GPX Export"
          >
            <Trophy className="w-5 h-5 text-amber-400" />
          </button>

          {/* Center on Me */}
          <button
            onClick={() => setSelectedMemberId(currentUser.id)}
            className="btn-tactile text-white p-3 rounded-2xl shadow-2xl"
            title="Center on Me"
          >
            <LocateFixed className="w-5 h-5 text-amber-400" />
          </button>

          {/* Fit All Squad Members & Peak */}
          <button
            onClick={() => setFitAllCounter(c => c + 1)}
            className="btn-tactile text-white p-3 rounded-2xl shadow-2xl"
            title="Fit All Squad Members & Target"
          >
            <Maximize className="w-5 h-5 text-amber-400" />
          </button>
        </div>

        {/* Floating Push-To-Talk Walkie Talkie Pane */}
        {showWalkieTalkie && (
          <div className="absolute top-20 right-4 z-40 pointer-events-auto animate-fadeIn">
            <VoiceWalkieTalkie
              currentUser={currentUser}
              channelName={party.radioChannel || (isTrek ? 'CH-07 ALPINE PACK' : 'CH-19')}
              isTrek={isTrek}
              onClose={() => setShowWalkieTalkie(false)}
            />
          </div>
        )}
      </div>

      {/* Bottom Drawer: Convoy / Trek Fleet Telemetry with Range Bottleneck & 3D Elevation */}
      <div className="bg-[#0b0e14]/95 backdrop-blur-xl border-t border-white/10 p-3.5 z-30 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-400/50" />
              <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                {isTrek ? <Mountain className="w-3.5 h-3.5 text-amber-400" /> : null}
                <span>{isTrek ? 'TRAIL PACK SQUAD TELEMETRY' : 'ACTIVE RIG TELEMETRY'} ({members.length} {isTrek ? 'HIKERS' : 'DRIVERS'})</span>
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Range Bottleneck Badge */}
              {lowestRangeMember && lowestRangeMember.fuelRangeKm && !isTrek && (
                <div className="px-2.5 py-0.5 rounded-full digital-recessed border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1.5">
                  <Fuel className="w-3 h-3 text-amber-400" />
                  <span>RANGE BOTTLENECK: {lowestRangeMember.name} ({lowestRangeMember.fuelRangeKm} km)</span>
                </div>
              )}

              {isSimulating && (
                <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold animate-pulse">
                  ⚡ {isTrek ? 'TRAIL PACING ENGINE ACTIVE' : '3D SIMULATOR ACTIVE (45–80 KM/H)'}
                </span>
              )}

              <button
                onClick={() => setShowDebriefModal(true)}
                className="px-2.5 py-0.5 rounded-full btn-tactile text-slate-300 hover:text-white text-[10px] font-mono font-bold flex items-center gap-1"
              >
                <Download className="w-3 h-3 text-amber-400" />
                <span>EXPORT GPX</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {members.map((member) => {
              const isSelected = selectedMemberId === member.id;
              const isMe = member.id === currentUser.id;
              const distToDest = member.distanceToDestKm || Math.round(calculateDistance(member.lat, member.lng, party.destination.lat, party.destination.lng));
              const speedDenominator = isTrek ? 4.2 : 65;
              const eta = member.etaString || `${Math.round(distToDest / speedDenominator * 60)}m`;

              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  style={{ borderColor: isSelected ? member.vehicleColor : undefined }}
                  className={`cockpit-panel-3d rounded-2xl p-3 cursor-pointer transition transform hover:-translate-y-1 shadow-xl ${
                    isSelected ? 'ring-2 ring-amber-400 bg-slate-900/90' : 'hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div 
                        style={{ borderColor: member.vehicleColor }}
                        className="p-1.5 rounded-xl bg-[#080b11] border shadow-inner"
                      >
                        <VehicleIcon
                          type={member.vehicleType || (isTrek ? 'hiker' : 'suv')}
                          color={member.vehicleColor}
                          heading={member.heading}
                          size={28}
                          showHeadlights={false}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-white leading-tight font-mono">{member.name}</h4>
                          {isMe && <span className="text-[9px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.5 rounded font-extrabold">YOU</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">{member.vehicleModel}</p>
                      </div>
                    </div>

                    <div className="text-right digital-recessed px-2 py-0.5 rounded-lg">
                      <span className="font-mono font-extrabold text-white text-base">{member.speed}</span>
                      <span className="text-[8px] text-amber-400 block font-mono font-bold leading-none">KM/H</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[11px] font-mono">
                    <div className="flex items-center gap-1 text-slate-300">
                      {isTrek ? <Mountain className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      <span>{distToDest} km to {isTrek ? 'peak' : 'dest'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-300 justify-end">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>ETA {eta}</span>
                    </div>
                  </div>

                  {/* Fuel / Battery Range */}
                  {!isTrek && member.fuelRangeKm !== undefined && (
                    <div className="mt-2 text-[10px] digital-recessed px-2 py-1 rounded-lg text-slate-300 border border-white/5 flex items-center justify-between font-mono font-bold">
                      <span className="flex items-center gap-1 text-slate-400">
                        {member.fuelType === 'gas' ? <Fuel className="w-3 h-3 text-amber-400" /> : <BatteryCharging className="w-3 h-3 text-emerald-400" />}
                        <span>RANGE:</span>
                      </span>
                      <span className={member.fuelRangeKm < 100 ? 'text-rose-400' : 'text-amber-300'}>
                        {member.batteryLevel ? `${member.batteryLevel}% • ` : ''}{member.fuelRangeKm} km
                      </span>
                    </div>
                  )}

                  {/* Elevation */}
                  {member.elevationMeters ? (
                    <div className="mt-1.5 text-[10px] digital-recessed px-2 py-1 rounded-lg text-emerald-300 border border-emerald-500/30 flex items-center justify-between font-mono font-bold">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                        <span>ALTITUDE:</span>
                      </span>
                      <span>{member.elevationMeters}m</span>
                    </div>
                  ) : null}

                  {/* Active Ping */}
                  {member.activeStatus && (
                    <div className="mt-1.5 text-[10px] digital-recessed px-2 py-1 rounded-lg text-amber-300 border border-amber-500/30 flex items-center gap-1 font-mono font-bold">
                      <span>⚡ BROADCAST:</span>
                      <span className="capitalize">{member.activeStatus.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Regroup Configuration & POI Modal */}
      {showRegroupModal && (
        <RegroupModal
          party={party}
          currentUser={currentUser}
          onClose={() => setShowRegroupModal(false)}
        />
      )}

      {/* Expedition Debrief & GPX/KML Export Modal */}
      {showDebriefModal && (
        <ExpeditionDebriefModal
          party={party}
          members={members}
          routePoints={routePoints}
          onClose={() => setShowDebriefModal(false)}
          onEndTrip={handleEndTrip}
        />
      )}
    </div>
  );
};
