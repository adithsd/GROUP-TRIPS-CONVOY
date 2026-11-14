import React, { useState } from 'react';
import { Compass, Navigation, Users, Zap, Play, CheckCircle, ArrowRight, ArrowLeft, X, Sparkles, MapPin } from 'lucide-react';
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
    title: "Welcome to ConvoyPulse",
    subtitle: "Your Ultimate Group Road Trip & Navigation Companion",
    description: "ConvoyPulse keeps your friends and family synchronized on every road trip. Never lose track of your travel squad again with real-time GPS tracking and live telemetry.",
    icon: Compass,
    color: "from-cyan-500 to-blue-600",
    badge: "Introduction"
  },
  {
    title: "1. Create or Join a Convoy",
    subtitle: "Instant 6-Character Party Codes",
    description: "Launch a convoy by setting a destination with Google Places Autocomplete. Share your unique 6-character code or link (?party=CODE) with friends to instantly link up.",
    icon: Navigation,
    color: "from-blue-600 to-indigo-600",
    badge: "Step 1"
  },
  {
    title: "2. Live GPS & Vehicle Telemetry",
    subtitle: "Custom Badges, Speed & Headings",
    description: "Every member's map marker features a color-coded vehicle badge that rotates based on movement bearing. The bottom drawer shows live distance remaining, ETA, and relative distances.",
    icon: Users,
    color: "from-indigo-600 to-purple-600",
    badge: "Step 2"
  },
  {
    title: "3. Quick Status Pings",
    subtitle: "Broadcast Fuel, Pit Stops & Traffic",
    description: "Tap ⛽ Fuel, ☕ Pit Stop, ⚠️ Traffic, or 👍 All Good to broadcast a status update. A temporary badge appears over your map marker and a toast alert notifies everyone in the convoy.",
    icon: Zap,
    color: "from-amber-500 to-orange-600",
    badge: "Step 3"
  },
  {
    title: "4. Built-In Convoy Simulator",
    subtitle: "Test Multi-Car Journeys from Your Desk",
    description: "Can't test with friends right now? Click 'Simulate Convoy' to spawn 3 virtual drivers (Sarah, Mike, Priya) cruising along your route at realistic speeds.",
    icon: Play,
    color: "from-emerald-500 to-teal-600",
    badge: "Step 4"
  }
];

export const PlaybookTour: React.FC<PlaybookTourProps> = ({ isOpen, onClose, onLaunchDemoSession }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const IconComponent = step.icon;

  const handleLaunchDemo = () => {
    // Create a pre-configured demo convoy heading to Yosemite National Park
    const demoDest = {
      name: 'Yosemite National Park',
      address: 'Yosemite Valley, CA 95389',
      lat: 37.8651,
      lng: -119.5383
    };

    const { party, user } = convoyService.createParty(
      {
        name: 'RoadTrip Host (You)',
        role: 'host',
        vehicleModel: 'Tesla Model Y Performance',
        vehicleColor: '#06b6d4',
        avatar: '🏎️',
        lat: 37.7749,
        lng: -122.4194,
        speed: 65,
        heading: 42,
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

    // Automatically start simulation so user sees demo convoy in action
    setTimeout(() => {
      simulationService.startSimulation(
        { lat: 37.7749, lng: -122.4194 },
        demoDest,
        party.routePoints || []
      );
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800/80 p-2 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {step.badge} ({currentStep + 1} of {TOUR_STEPS.length})
          </span>
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-6 bg-cyan-400' : 'w-1.5 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Icon & Title */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 bg-gradient-to-tr ${step.color} rounded-2xl flex items-center justify-center text-white shadow-xl`}>
            <IconComponent className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{step.title}</h2>
            <p className="text-xs sm:text-sm text-cyan-400 font-medium">{step.subtitle}</p>
          </div>
        </div>

        {/* Description Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 mb-8 text-slate-300 text-sm leading-relaxed">
          {step.description}
        </div>

        {/* Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
              currentStep === 0 
                ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLaunchDemo}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Live Demo</span>
            </button>

            {currentStep < TOUR_STEPS.length - 1 ? (
              <button
                onClick={() => setCurrentStep(prev => Math.min(TOUR_STEPS.length - 1, prev + 1))}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition shadow-lg shadow-cyan-500/25 flex items-center gap-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-600/25 flex items-center gap-2"
              >
                <span>Get Started</span>
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
