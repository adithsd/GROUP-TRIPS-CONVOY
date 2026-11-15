import React, { useState } from 'react';
import { Compass, Navigation, Users, Play, CheckCircle, ArrowRight, ArrowLeft, X, Sparkles, Radio } from 'lucide-react';
import { convoyService } from '../services/convoyService';
import { simulationService } from '../services/simulationService';
import { ConvoyParty, ConvoyMember } from '../types';

interface PlaybookTourProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchDemoSession: (party: ConvoyParty, user: ConvoyMember) => void;
}

const TOUR_STEPS = [
  {
    title: "Overland Convoy Protocol",
    subtitle: "Tactical Fleet Telemetry & Highway Navigation",
    description: "ConvoyPulse coordinates road trips, rally runs, and overland expeditions. Stream real-time GPS coordinates, vehicle headings, headway gaps, and radio status across all devices with zero server setup.",
    icon: Compass,
    color: "from-[#d97706] to-[#b45309]",
    badge: "PROTOCOL 01"
  },
  {
    title: "1. Mission Dispatch & Party Codes",
    subtitle: "Instant 6-Character Sync Network",
    description: "Designate a destination with Google Places Autocomplete or select curated scenic routes. Your unique 6-character party code connects friends instantly with no account required.",
    icon: Navigation,
    color: "from-[#334155] to-[#1e293b]",
    badge: "PROTOCOL 02"
  },
  {
    title: "2. 3D Formation Spacing Radar",
    subtitle: "Anti-Separation Headway Monitoring",
    description: "Keep the pack tight. The Formation Radar tracks lead, mid-pack, and sweep vehicles with real-time distance separation in meters and kilometers, alerting if spacing stretches dangerously.",
    icon: Users,
    color: "from-[#475569] to-[#334155]",
    badge: "PROTOCOL 03"
  },
  {
    title: "3. Tactical CB Radio Pings",
    subtitle: "Instant Fleet Telemetry Broadcasts",
    description: "Transmit immediate status updates: ⛽ Refuel / Supercharge, ☕ Pit Stop, ⚠️ Traffic Slowdown, 🚨 Road Hazard, or 👍 All Clear with authentic synthesized Roger beeps.",
    icon: Radio,
    color: "from-[#f59e0b] to-[#d97706]",
    badge: "PROTOCOL 04"
  },
  {
    title: "4. Multi-Car Convoy Simulator",
    subtitle: "Full Road Trip Testing From Your Desk",
    description: "Need to test multi-vehicle dynamics right now? Toggle 'Simulate Convoy' to spawn Sarah, Mike, and Priya driving along your route at realistic highway speeds.",
    icon: Play,
    color: "from-[#059669] to-[#047857]",
    badge: "PROTOCOL 05"
  }
];

export const PlaybookTour: React.FC<PlaybookTourProps> = ({ isOpen, onClose, onLaunchDemoSession }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const IconComponent = step.icon;

  const handleLaunchDemo = () => {
    const demoDest = {
      name: 'Yosemite National Park',
      address: 'Yosemite Valley, CA 95389',
      lat: 37.8651,
      lng: -119.5383
    };

    const { party, user } = convoyService.createParty(
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
        batteryLevel: 94,
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

    onLaunchDemoSession(party, user);
    onClose();

    setTimeout(() => {
      simulationService.startSimulation(
        { lat: 37.7749, lng: -122.4194 },
        demoDest,
        party.routePoints || []
      );
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06080d]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="cockpit-panel-3d rounded-3xl max-w-xl w-full p-6 sm:p-8 text-white shadow-2xl relative font-sans">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 btn-tactile text-slate-400 hover:text-white p-2 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            {step.badge} // {currentStep + 1} OF {TOUR_STEPS.length}
          </span>
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-6 bg-amber-400' : 'w-1.5 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Icon & Title */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 bg-gradient-to-tr ${step.color} rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0 border border-white/20`}>
            <IconComponent className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-mono text-white">{step.title}</h2>
            <p className="text-xs sm:text-sm text-amber-400 font-mono font-bold">{step.subtitle}</p>
          </div>
        </div>

        {/* Description with recessed 3D styling */}
        <div className="digital-recessed rounded-2xl p-5 mb-8 text-slate-300 text-sm leading-relaxed font-sans">
          {step.description}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition ${
              currentStep === 0 
                ? 'opacity-30 cursor-not-allowed bg-slate-900 text-slate-600' 
                : 'btn-tactile text-slate-300'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLaunchDemo}
              className="btn-tactile text-amber-300 border-amber-500/40 font-mono font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Launch Live Yosemite Demo</span>
            </button>

            {currentStep < TOUR_STEPS.length - 1 ? (
              <button
                onClick={() => setCurrentStep(prev => Math.min(TOUR_STEPS.length - 1, prev + 1))}
                className="btn-amber-3d text-slate-950 font-mono font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-600/20 flex items-center gap-2"
              >
                <span>Acknowledge Protocol</span>
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
