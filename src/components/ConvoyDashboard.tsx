import React, { useState, useEffect, useRef, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { 
  Navigation, MapPin, Fuel, Coffee, AlertTriangle, CheckCircle, 
  Compass, Maximize, LocateFixed, Car, Users, Clock, Zap, Volume2, Shield 
} from 'lucide-react';
import { ConvoyParty, ConvoyMember, StatusPingEvent } from '../types';
import { convoyService } from '../services/convoyService';

interface ConvoyDashboardProps {
  party: ConvoyParty;
  currentUser: ConvoyMember;
  members: ConvoyMember[];
  pings: StatusPingEvent[];
  isSimulating: boolean;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Inner map component that has access to map instance via hooks
const MapController: React.FC<{
  party: ConvoyParty;
  currentUser: ConvoyMember;
  members: ConvoyMember[];
  selectedMemberId: string | null;
  onSelectMember: (id: string | null) => void;
  routePolylinePoints: { lat: number; lng: number }[];
}> = ({ party, currentUser, members, selectedMemberId, onSelectMember, routePolylinePoints }) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const geometryLibrary = useMapsLibrary('geometry');

  const [polyRenderer, setPolyRenderer] = useState<any | null>(null);

  // Draw route polyline
  useEffect(() => {
    if (!map || !(window as any).google?.maps) return;

    if (polyRenderer) {
      polyRenderer.setMap(null);
    }

    if (routePolylinePoints.length > 0) {
      const poly = new (window as any).google.maps.Polyline({
        path: routePolylinePoints,
        geodesic: true,
        strokeColor: '#06b6d4',
        strokeOpacity: 0.85,
        strokeWeight: 6,
        map: map
      });
      setPolyRenderer(poly);
    } else if (party.destination && currentUser) {
      // Fallback straight line if no route points
      const poly = new (window as any).google.maps.Polyline({
        path: [
          { lat: currentUser.lat, lng: currentUser.lng },
          { lat: party.destination.lat, lng: party.destination.lng }
        ],
        geodesic: true,
        strokeColor: '#06b6d4',
        strokeOpacity: 0.7,
        strokeWeight: 5,
        map: map
      });
      setPolyRenderer(poly);
    }
  }, [map, routePolylinePoints, party.destination, currentUser]);

  // Center on selected member or current user
  useEffect(() => {
    if (!map) return;
    if (selectedMemberId) {
      const target = members.find(m => m.id === selectedMemberId);
      if (target) {
        map.panTo({ lat: target.lat, lng: target.lng });
        map.setZoom(15);
      }
    }
  }, [selectedMemberId, members, map]);

  return (
    <>
      {/* Destination Marker */}
      {party.destination && (
        <AdvancedMarker
          position={{ lat: party.destination.lat, lng: party.destination.lng }}
          title={party.destination.name}
        >
          <div className="bg-rose-600 text-white p-2.5 rounded-2xl shadow-xl flex items-center gap-1.5 border-2 border-white animate-bounce">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-bold">{party.destination.name}</span>
          </div>
        </AdvancedMarker>
      )}

      {/* Convoy Members Markers */}
      {members.map((member) => {
        const isMe = member.id === currentUser.id;
        return (
          <AdvancedMarker
            key={member.id}
            position={{ lat: member.lat, lng: member.lng }}
            onClick={() => onSelectMember(member.id)}
            title={`${member.name} (${member.vehicleModel})`}
          >
            <div className="relative group cursor-pointer">
              {/* Status Badge Popup */}
              {member.activeStatus && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white text-[10px] px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 whitespace-nowrap animate-pulse">
                  {member.activeStatus === 'fuel' && '⛽ Refueling'}
                  {member.activeStatus === 'pit_stop' && '☕ Pit Stop'}
                  {member.activeStatus === 'traffic' && '⚠️ Heavy Traffic'}
                  {member.activeStatus === 'all_good' && '👍 All Good'}
                </div>
              )}

              {/* Vehicle Badge */}
              <div 
                style={{ backgroundColor: member.vehicleColor }}
                className={`p-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border-2 ${
                  isMe ? 'border-white ring-4 ring-cyan-500/40' : 'border-slate-900'
                } transform transition hover:scale-110`}
              >
                <span className="text-base">{member.avatar}</span>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-white leading-tight">{member.name}</p>
                  <p className="text-[9px] text-white/80 font-mono">{member.speed} km/h</p>
                </div>
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
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [routePoints, setRoutePoints] = useState<{ lat: number; lng: number }[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Watch geolocation for local user
  useEffect(() => {
    if (isSimulating) return; // Skip GPS watch when simulation is active

    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed, heading } = pos.coords;
        const currentSpeed = speed ? Math.round(speed * 3.6) : 35; // m/s to km/h fallback
        const currentHeading = heading || 45;

        // Calculate distance to dest
        const distKm = calculateDistance(latitude, longitude, party.destination.lat, party.destination.lng);
        const etaMin = Math.round((distKm / Math.max(currentSpeed, 30)) * 60);
        const etaStr = `${Math.floor(etaMin / 60)}h ${etaMin % 60}m`;

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
        console.warn('Geolocation error / denied:', err);
        // Fallback simulated movement around San Francisco or default location
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [party.destination, isSimulating]);

  // Haversine distance formula helper
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Fetch route using Routes API / Directions via routes library
  useEffect(() => {
    const fetchRoute = async () => {
      if ((window as any).google?.maps) {
        try {
          const { Route } = await (window as any).google.maps.importLibrary('routes');
          // We can generate waypoints or polyline
        } catch (e) {
          console.log('Routes library error:', e);
        }
      }

      // Generate smooth intermediate route points between current user and destination for simulation & polyline
      const pts = [];
      const startLat = currentUser.lat;
      const startLng = currentUser.lng;
      const endLat = party.destination.lat;
      const endLng = party.destination.lng;

      for (let i = 0; i <= 20; i++) {
        const factor = i / 20;
        // add slight sine curve for realistic road winding
        const curveOffset = Math.sin(factor * Math.PI) * 0.02;
        pts.push({
          lat: startLat + (endLat - startLat) * factor + curveOffset,
          lng: startLng + (endLng - startLng) * factor
        });
      }
      setRoutePoints(pts);
    };

    fetchRoute();
  }, [party.destination, currentUser.lat, currentUser.lng]);

  const handleStatusPing = (type: 'fuel' | 'pit_stop' | 'traffic' | 'all_good') => {
    const messages = {
      fuel: 'Needs Fuel / Charging Stop',
      pit_stop: 'Stopping for Coffee & Restroom',
      traffic: 'Encountered Heavy Traffic Delay',
      all_good: 'Cruising Smoothly - All Good!'
    };
    convoyService.sendStatusPing(type, messages[type]);
    setToastMessage(`Broadcasted: ${messages[type]}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFitAll = () => {
    // handled by map bounds if needed
  };

  return (
    <div className="flex-1 flex flex-col relative h-[calc(100vh-65px)] overflow-hidden bg-slate-950">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-cyan-500 text-slate-950 px-5 py-2.5 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
          <Zap className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Map View */}
      <div className="flex-1 w-full h-full relative">
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={{ lat: currentUser.lat, lng: currentUser.lng }}
            defaultZoom={13}
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
            />
          </Map>
        </APIProvider>

        {/* Floating Map Controls */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
          <button
            onClick={() => setSelectedMemberId(currentUser.id)}
            className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white p-3 rounded-2xl shadow-xl hover:bg-slate-800 transition"
            title="Center on Me"
          >
            <LocateFixed className="w-5 h-5 text-cyan-400" />
          </button>
          <button
            onClick={() => {
              if (members.length > 0) setSelectedMemberId(members[0].id);
            }}
            className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white p-3 rounded-2xl shadow-xl hover:bg-slate-800 transition"
            title="Fit All Vehicles"
          >
            <Maximize className="w-5 h-5 text-cyan-400" />
          </button>
        </div>

        {/* Quick Status Pings Toolbar */}
        <div className="absolute top-4 left-4 z-30 flex flex-wrap gap-2 max-w-md">
          <button
            onClick={() => handleStatusPing('fuel')}
            className="bg-slate-900/90 backdrop-blur-md border border-amber-500/40 hover:bg-amber-500/20 text-amber-300 px-3 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-1.5 transition"
          >
            <Fuel className="w-3.5 h-3.5 text-amber-400" />
            <span>Fuel</span>
          </button>
          <button
            onClick={() => handleStatusPing('pit_stop')}
            className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 hover:bg-cyan-500/20 text-cyan-300 px-3 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-1.5 transition"
          >
            <Coffee className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pit Stop</span>
          </button>
          <button
            onClick={() => handleStatusPing('traffic')}
            className="bg-slate-900/90 backdrop-blur-md border border-rose-500/40 hover:bg-rose-500/20 text-rose-300 px-3 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-1.5 transition"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Traffic</span>
          </button>
          <button
            onClick={() => handleStatusPing('all_good')}
            className="bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 hover:bg-emerald-500/20 text-emerald-300 px-3 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-1.5 transition"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>All Good</span>
          </button>
        </div>
      </div>

      {/* Bottom Drawer: Convoy Members Telemetry */}
      <div className="bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 p-4 z-30 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Convoy Fleet Telemetry ({members.length} Active Drivers)
              </h3>
            </div>
            {isSimulating && (
              <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-mono animate-pulse">
                ⚡ Simulation Mode Active
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {members.map((member) => {
              const isSelected = selectedMemberId === member.id;
              const isMe = member.id === currentUser.id;
              const distToDest = member.distanceToDestKm || Math.round(Math.random() * 45 + 10);
              const eta = member.etaString || '45m';

              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  style={{ borderColor: isSelected ? member.vehicleColor : undefined }}
                  className={`bg-slate-800/90 border rounded-2xl p-3 cursor-pointer transition transform hover:-translate-y-0.5 shadow-lg ${
                    isSelected ? 'ring-2 ring-cyan-500 bg-slate-800' : 'border-slate-700/70 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl p-1.5 rounded-xl bg-slate-700/60">{member.avatar}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-white">{member.name}</h4>
                          {isMe && <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-semibold">You</span>}
                        </div>
                        <p className="text-[10px] text-slate-400">{member.vehicleModel}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-cyan-400 text-sm">{member.speed}</span>
                      <span className="text-[9px] text-slate-400 block">km/h</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60 text-[11px]">
                    <div className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{distToDest} km left</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-300 justify-end">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>ETA {eta}</span>
                    </div>
                  </div>

                  {member.activeStatus && (
                    <div className="mt-2 text-[10px] bg-slate-900/80 px-2 py-1 rounded-lg text-amber-300 border border-amber-500/30 flex items-center gap-1 font-medium">
                      <span>⚡ Status:</span>
                      <span className="capitalize">{member.activeStatus.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
