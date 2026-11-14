import React, { useState, useEffect } from 'react';
import { Navigation, Users, Car, Shield, Zap, Compass, ArrowRight, Play, BookOpen, Sparkles } from 'lucide-react';
import { ConvoyParty, ConvoyMember, StatusPingEvent } from './types';
import { convoyService } from './services/convoyService';
import { simulationService } from './services/simulationService';
import { QuotaBanner } from './components/QuotaBanner';
import { Navbar } from './components/Navbar';
import { CreateConvoyModal } from './components/CreateConvoyModal';
import { JoinConvoyModal } from './components/JoinConvoyModal';
import { ConvoyDashboard } from './components/ConvoyDashboard';
import { PlaybookTour } from './components/PlaybookTour';

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

  // Default fallback starting location (San Francisco area)
  const defaultLocation = { lat: 37.7749, lng: -122.4194 };

  // Check URL parameters for ?party=CODE on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const partyCode = params.get('party');
    if (partyCode) {
      setPendingJoinCode(partyCode.toUpperCase());
      setIsJoinOpen(true);
    }
  }, []);

  // Subscribe to convoy state changes
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
        simulationService.startSimulation(
          { lat: currentUser.lat, lng: currentUser.lng },
          party.destination,
          party.routePoints || []
        );
        setIsSimulating(true);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Required Quota Warning Banner for Demo Key */}
      <QuotaBanner />

      {/* Navbar Header */}
      <Navbar
        party={party}
        currentUser={currentUser}
        members={members}
        isSimulating={isSimulating}
        onToggleSimulation={handleToggleSimulation}
        onLeaveConvoy={handleLeaveConvoy}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenJoin={() => setIsJoinOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
      />

      {/* Main Content Area */}
      {party && currentUser ? (
        <ConvoyDashboard
          party={party}
          currentUser={currentUser}
          members={members}
          pings={pings}
          isSimulating={isSimulating}
        />
      ) : (
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
          {/* Playbook Banner Pill */}
          <button
            onClick={() => setIsTourOpen(true)}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-lg hover:bg-slate-800 transition transform hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>New here? Take the 1-Minute Playbook Tour</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/30 mb-6 transform hover:scale-105 transition">
            <Car className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Group Road Trips, <br /> Perfectly Synchronized.
          </h2>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mb-8">
            Real-time GPS tracking, Google Maps route polylines, custom vehicle badges, distance telemetry, and instant status pings for your entire road trip convoy.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-8 py-4 rounded-2xl transition shadow-xl shadow-cyan-500/25 flex items-center gap-2 text-sm sm:text-base"
            >
              <span>Create Convoy</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsJoinOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold px-8 py-4 rounded-2xl transition flex items-center gap-2 text-sm sm:text-base shadow-lg"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Join via Code</span>
            </button>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-left w-full">
            <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 mb-3">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white mb-1">Live Map & Routes</h3>
              <p className="text-xs text-slate-400">Google Maps integration with custom vehicle markers, headings, speeds, and turn-by-turn route polylines.</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white mb-1">Real-Time Sync</h3>
              <p className="text-xs text-slate-400">Instant multi-tab and multi-device party synchronization via BroadcastChannel and LocalStorage.</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white mb-1">Convoy Simulator</h3>
              <p className="text-xs text-slate-400">Test multi-car road trips instantly by spawning virtual friends driving along your route at realistic speeds.</p>
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
