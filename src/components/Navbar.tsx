import React, { useState } from 'react';
import { Navigation, Users, Share2, Play, Square, Copy, Check, Car, BookOpen } from 'lucide-react';
import { ConvoyParty, ConvoyMember } from '../types';

interface NavbarProps {
  party: ConvoyParty | null;
  currentUser: ConvoyMember | null;
  members: ConvoyMember[];
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onLeaveConvoy: () => void;
  onOpenCreate: () => void;
  onOpenJoin: () => void;
  onOpenTour: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  party,
  currentUser,
  members,
  isSimulating,
  onToggleSimulation,
  onLeaveConvoy,
  onOpenCreate,
  onOpenJoin,
  onOpenTour
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (!party) return;
    const url = `${window.location.origin}?party=${party.partyId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-base sm:text-lg bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              ConvoyPulse
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">Live Group Road Trip & Navigation</p>
          </div>
        </div>

        {/* Center: Party Info & Code */}
        {party ? (
          <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-slate-400 font-medium">Party Code:</span>
              <span className="font-mono font-bold text-cyan-400 tracking-wider text-sm">{party.partyId}</span>
            </div>
            
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-2.5 py-1 rounded-lg transition"
              title="Copy shareable link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span className="hidden md:inline">{copied ? 'Copied!' : 'Share'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-300 pl-2 border-l border-slate-700">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{members.length} Active</span>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-800">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>Create or join a convoy to start live tracking</span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTour}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm"
            title="Road Trip Playbook & Tour"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Playbook Tour</span>
          </button>

          {party ? (
            <>
              <button
                onClick={onToggleSimulation}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition shadow-sm ${
                  isSimulating 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' 
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                }`}
              >
                {isSimulating ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isSimulating ? 'Stop Sim' : 'Simulate Convoy'}</span>
              </button>

              <button
                onClick={onLeaveConvoy}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-xl text-xs font-medium transition"
              >
                Leave
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenJoin}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-medium transition"
              >
                Join Convoy
              </button>
              <button
                onClick={onOpenCreate}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium px-4 py-1.5 rounded-xl text-xs transition shadow-lg shadow-cyan-500/25"
              >
                Create Convoy
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
