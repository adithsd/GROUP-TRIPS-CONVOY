import React, { useState, useEffect } from 'react';
import { Compass, Users, Sparkles, Navigation, ArrowRight, Radio, Shield, Gauge, Zap, MapPin, Play, Mountain } from 'lucide-react';
import { ConvoyParty, ConvoyMember, StatusPingEvent } from './types';
import { convoyService } from './services/convoyService';
import { simulationService } from './services/simulationService';
import { soundService } from './services/soundService';
import { QuotaBanner } from './components/QuotaBanner';
import { Navbar } from './components/Navbar';
import { CreateConvoyModal } from './components/CreateConvoyModal';
import { JoinConvoyModal } from './components/JoinConvoyModal';
import { ConvoyDashboard } from './components/ConvoyDashboard';
import { PlaybookTour } from './components/PlaybookTour';
import { VehicleIcon } from './components/VehicleIcon';
import { TrekTile } from './components/TrekTile';

export default function App() {
  const [party, setParty] = useState<ConvoyParty | null>(null);
  const [currentUser, setCurrentUser] = useState<ConvoyMember | null>(null);
  const [members, setMembers] = useState<ConvoyMember[]>([]);
  const [pings, setPings] = useState<StatusPingEvent[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [pendingJoinCode, setPendingJoinCode] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [initialActivity, setInitialActivity] = useState<'convoy' | 'trek'>('convoy');

  // Default starting location (San Francisco Bay area)
  const defaultLocation = { lat: 37.7749, lng: -122.4194 };

  // Check URL query parameters (?party=CODE)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const partyCode = params.get('party');
    if (partyCode) {
      setPendingJoinCode(partyCode.toUpperCase());
      setIsJoinOpen(true);
    }
  }, []);

  // Subscribe to real-time party state changes
  useEffect(() => {
    const unsubscribe = convoyService.subscribe((state) => {
      setParty(state.party);
      setMembers(state.members);
      setPings(state.pings);
      const user = convoyService.getCurrentUser();
      if (user) setCurrentUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleSimulation = () => {
    if (isSimulating) {
      simulationService.stopSimulation();
      setIsSimulating(false);
    } else {
      if (party && currentUser) {
        const isTrek = party.activityType === 'trek';
        simulationService.startSimulation(
          { lat: currentUser.lat, lng: currentUser.lng },
          party.destination,
          party.routePoints || [],
          isTrek
        );
        setIsSimulating(true);
        soundService.playRogerBeep();
      }
    }
  };

  const handleLeaveConvoy = () => {
    if (isSimulating) {
      simulationService.stopSimulation();
      setIsSimulating(false);
    }
    convoyService.leaveParty();
    setParty(null);
    setCurrentUser(null);
    setMembers([]);
    setPings([]);
  };

  // 1-Click Launch Yosemite Road Trip Convoy
  const handleQuickDemoLaunch = () => {
    const demoDest = {
      name: 'Yosemite National Park',
      address: 'Yosemite Valley, CA 95389',
      lat: 37.8651,
      lng: -119.5383
    };

    const { party: p, user: u } = convoyService.createParty(
      {
        name: 'Alex Vance (Lead)',
        role: 'host',
        vehicleModel: 'Rivian R1S Overland',
        vehicleType: 'suv',
        vehicleColor: '#ffaa00',
        avatar: '🏎️',
        lat: 37.7749,
        lng: -122.4194,
        speed: 68,
        heading: 52,
        batteryLevel: 92,
        lastUpdated: Date.now()
      },
      demoDest,
      [
        { lat: 37.7749, lng: -122.4194 },
        { lat: 37.8000, lng: -121.5000 },
        { lat: 37.8300, lng: -120.6000 },
        { lat: 37.8651, lng: -119.5383 }
      ]
    );

    p.activityType = 'convoy';
    setParty(p);
    setCurrentUser(u);
    setIsSimulating(true);

    setTimeout(() => {
      simulationService.startSimulation(
        { lat: 37.7749, lng: -122.4194 },
        demoDest,
        p.routePoints || [],
        false
      );
    }, 400);
  };

  // 1-Click Launch Backcountry Mountain Trek Demo (Half Dome Peak)
  const handleLaunchTrekDemo = () => {
    const trekDest = {
      name: 'Half Dome Summit Peak',
      address: 'John Muir Trail, Yosemite Valley, CA',
      lat: 37.7459,
      lng: -119.5332,
      altitudeMeters: 2694
    };

    const { party: p, user: u } = convoyService.createParty(
      {
        name: 'Jordan Lee (Pack Mid)',
        role: 'host',
        vehicleModel: 'Gregory Baltoro 70L',
        vehicleType: 'backpacker',
        vehicleColor: '#f59e0b',
        avatar: '🥾',
        lat: 37.7320,
        lng: -119.5580,
        speed: 4.2,
        heading: 42,
        elevationMeters: 2650,
        batteryLevel: 86,
        lastUpdated: Date.now()
      },
      trekDest,
      [
        { lat: 37.7320, lng: -119.5580 },
        { lat: 37.7360, lng: -119.5520 },
        { lat: 37.7410, lng: -119.5430 },
        { lat: 37.7459, lng: -119.5332 }
      ]
    );

    p.activityType = 'trek';
    p.radioChannel = 'CH-07 ALPINE PACK NET';

    setParty(p);
    setCurrentUser(u);
    setIsSimulating(true);

    setTimeout(() => {
      simulationService.startSimulation(
        { lat: 37.7320, lng: -119.5580 },
        trekDest,
        p.routePoints || [],
        true
      );
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#090c10] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Quota Banner */}
      <QuotaBanner />

      {/* Main Navbar */}
      <Navbar
        party={party}
        currentUser={currentUser}
        members={members}
        isSimulating={isSimulating}
        onToggleSimulation={handleToggleSimulation}
        onLeaveConvoy={handleLeaveConvoy}
        onOpenCreate={() => {
          setInitialActivity('convoy');
          setIsCreateOpen(true);
        }}
        onOpenJoin={() => setIsJoinOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
      />

      {/* Active Convoy Cockpit vs Standby Dispatch Landing */}
      {party && currentUser ? (
        <ConvoyDashboard
          party={party}
          currentUser={currentUser}
          members={members}
          pings={pings}
          isSimulating={isSimulating}
        />
      ) : (
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto py-10 perspective-container">
          {/* Tactical Status Pill with 3D Bezel */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full digital-recessed text-amber-300 font-mono text-xs font-semibold mb-6 shadow-xl border border-white/10">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
            <span className="tracking-wider uppercase font-extrabold text-white">SATELLITE 3D TELEMETRY ARMED</span>
            <span className="text-slate-600">//</span>
            <span className="text-amber-400 font-bold">CH-19 (146.520 MHz)</span>
          </div>

          {/* Clean Titanium & Gold Highway Heading (No AI Blue) */}
          <h2 className="text-3xl sm:text-6xl font-extrabold tracking-tight mb-4 text-white font-mono leading-tight">
            TACTICAL OVERLAND & <br />
            <span className="text-amber-400 drop-shadow-md">
              MOUNTAIN TREK TELEMETRY
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mb-8 leading-relaxed font-sans font-medium">
            Multi-vehicle road trips & wilderness hiking squad tracking. Live GPS, 3D formation spacing radar, tactical CB radio alerts, and elevation telemetry. Never lose your pack on the road or the trail.
          </p>

          {/* 3D Action Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <button
              onClick={() => {
                setInitialActivity('convoy');
                setIsCreateOpen(true);
              }}
              className="btn-amber-3d text-slate-950 font-mono font-extrabold px-8 py-4 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm uppercase tracking-wider"
            >
              <span>Dispatch Convoy</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            <button
              onClick={() => setIsJoinOpen(true)}
              className="btn-tactile text-slate-100 font-mono font-bold px-8 py-4 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm uppercase tracking-wider"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Join with 6-Digit Code</span>
            </button>

            <button
              onClick={handleQuickDemoLaunch}
              className="btn-tactile text-amber-300 hover:text-amber-200 border-amber-500/40 font-mono font-bold px-6 py-4 rounded-2xl flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wider"
              title="1-Click Launch Yosemite Road Trip Simulator"
            >
              <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>1-Click Road Demo</span>
            </button>
          </div>

          {/* Dedicated Wilderness Trekking Use Case Tile */}
          <TrekTile
            onLaunchTrekDemo={handleLaunchTrekDemo}
            onOpenCreateTrek={() => {
              setInitialActivity('trek');
              setIsCreateOpen(true);
            }}
          />

          {/* 3D Tilted Fleet Preview Card */}
          <div className="w-full cockpit-panel-3d card-3d-tilt rounded-3xl p-5 mb-10 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-400" />
                <span className="font-extrabold text-white uppercase tracking-wider">ROAD TRIP 3D FORMATION TELEMETRY</span>
              </div>
              <span className="text-slate-400 text-[11px] font-bold">4 VEHICLES LINKED // AVG 72 KM/H</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { name: 'Alex Vance (You)', role: 'Pacesetter', rig: 'Rivian R1S', color: '#ffaa00', speed: 74, dist: '85 km', type: 'suv' as const },
                { name: 'Sarah Jenkins', role: 'Formation Mid', rig: 'Taycan Cross', color: '#10b981', speed: 72, dist: '86 km', type: 'sport' as const },
                { name: 'Mike Ross', role: 'Heavy Rig', rig: 'F-150 Lightning', color: '#f59e0b', speed: 70, dist: '87 km', type: 'truck' as const },
                { name: 'Priya Patel', role: 'Sweep Guard', rig: 'Defender 110', color: '#ef4444', speed: 68, dist: '88 km', type: 'suv' as const }
              ].map((m, idx) => (
                <div key={idx} className="bg-gradient-to-b from-[#18202c] to-[#0c1017] border border-white/10 rounded-2xl p-3 flex items-center gap-3 shadow-lg hover:border-amber-400/50 transition">
                  <div className="p-1.5 rounded-xl bg-[#080b11] border border-white/10 shrink-0 shadow-inner">
                    <VehicleIcon type={m.type} color={m.color} heading={48} size={30} showHeadlights={false} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-white truncate font-mono">{m.name}</p>
                    <p className="text-[10px] text-amber-400 font-mono font-medium truncate">{m.rig} • {m.role}</p>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mt-1 pt-1 border-t border-white/10">
                      <span className="font-bold text-slate-200">{m.speed} KM/H</span>
                      <span className="text-slate-400">{m.dist} left</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Feature Pillars with 3D Depth */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left w-full">
            <div className="cockpit-panel-3d p-5 rounded-2xl hover:-translate-y-1 transition duration-200">
              <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400 mb-3 shadow-sm">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="font-mono font-bold text-sm text-white mb-1">Road & Trail Navigation</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Google Maps directions route calculation, custom rigs & hikers with true 360° heading rotation, and LatLngBounds automatic fit.
              </p>
            </div>

            <div className="cockpit-panel-3d p-5 rounded-2xl hover:-translate-y-1 transition duration-200">
              <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400 mb-3 shadow-sm">
                <Gauge className="w-5 h-5" />
              </div>
              <h3 className="font-mono font-bold text-sm text-white mb-1">Formation & Trail Spacing</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Monitor real-time headway gaps in meters between lead scout, mid hikers, and sweep guard so no squad member falls behind.
              </p>
            </div>

            <div className="cockpit-panel-3d p-5 rounded-2xl hover:-translate-y-1 transition duration-200">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 mb-3 shadow-sm">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="font-mono font-bold text-sm text-white mb-1">Tactical Radio & SOS Pings</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Broadcast instant status pings (💧 Water Spring, 🏕️ Campsite, 🥾 Steep Terrain, 🚨 SOS Beacon, 👍 All Clear) with acoustic Roger beeps.
              </p>
            </div>
          </div>
        </main>
      )}

      {/* Modals */}
      <CreateConvoyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(p, u) => {
          setParty(p);
          setCurrentUser(u);
        }}
        defaultLocation={defaultLocation}
        initialActivity={initialActivity}
      />

      <JoinConvoyModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onJoined={(p, u) => {
          setParty(p);
          setCurrentUser(u);
        }}
        defaultPartyCode={pendingJoinCode}
        defaultLocation={defaultLocation}
      />

      <PlaybookTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onLaunchDemoSession={(p, u) => {
          setParty(p);
          setCurrentUser(u);
          setIsSimulating(true);
        }}
      />
    </div>
  );
}
