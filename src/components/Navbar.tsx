import React, { useState } from 'react';
import { Compass, Users, Share2, Play, Square, Check, Radio, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { ConvoyParty, ConvoyMember } from '../types';
import { soundService } from '../services/soundService';

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
  const [isAudioMuted, setIsAudioMuted] = useState(soundService.getIsMuted());

  const handleShare = () => {
    if (!party) return;
    const url = `${window.location.origin}?party=${party.partyId}`;
    navigator.clipboard.writeText(url);
    soundService.playRogerBeep();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleAudio = () => {
    const muted = soundService.toggleMute();
    setIsAudioMuted(muted);
  };

  return (
    <header className="bg-[#0b0e14]/95 backdrop-blur-xl border-b border-white/10 text-slate-100 px-4 py-2.5 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo with 3D Bezel */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#2a3442] to-[#121720] border border-white/20 flex items-center justify-center shadow-lg shadow-black/60 relative">
            <div className="absolute inset-0 rounded-xl bg-amber-500/10 pointer-events-none" />
            <Compass className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold tracking-tight text-base sm:text-lg text-white font-mono">
                CONVOY<span className="text-amber-400">PULSE</span>
              </h1>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase font-bold tracking-wider">
                3D HUD
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">Overland Convoy Protocol & Telemetry</p>
          </div>
        </div>

        {/* Center: Party Info & Live Formation Code */}
        {party ? (
          <div className="flex items-center gap-2.5 digital-recessed px-3 py-1.5 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">CODE:</span>
              <span className="font-mono font-extrabold text-amber-400 tracking-wider text-sm">{party.partyId}</span>
            </div>
            
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 btn-tactile text-slate-200 text-xs px-2.5 py-1 rounded-lg font-mono text-[11px]"
              title="Copy shareable link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-400" />}
              <span className="hidden md:inline">{copied ? 'Copied' : 'Share'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 pl-2.5 border-l border-white/10 font-mono">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-white">{members.length}</span>
              <span className="text-slate-400 text-[10px]">RIGS</span>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 digital-recessed px-3 py-1.5 rounded-xl font-mono">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>STANDBY // Awaiting Convoy Dispatch or Frequency Join</span>
          </div>
        )}

        {/* Right Actions with 3D tactile buttons */}
        <div className="flex items-center gap-2">
          {/* CB Audio Toggle */}
          <button
            onClick={handleToggleAudio}
            className="p-2 rounded-xl btn-tactile text-slate-300"
            title={isAudioMuted ? 'Unmute CB Audio' : 'Mute CB Audio'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Playbook Tour */}
          <button
            onClick={onOpenTour}
            className="flex items-center gap-1.5 btn-tactile text-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono font-medium"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Playbook</span>
          </button>

          {party ? (
            <>
              <button
                onClick={onToggleSimulation}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition shadow-sm ${
                  isSimulating 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' 
                    : 'btn-tactile text-amber-300'
                }`}
              >
                {isSimulating ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                <span>{isSimulating ? 'Stop Sim' : 'Simulate Convoy'}</span>
              </button>

              <button
                onClick={onLeaveConvoy}
                className="btn-tactile text-rose-300 px-3 py-1.5 rounded-xl text-xs font-mono font-medium hover:border-rose-500/40"
              >
                Leave
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenJoin}
                className="btn-tactile text-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold"
              >
                Join Convoy
              </button>
              <button
                onClick={onOpenCreate}
                className="btn-amber-3d text-slate-950 font-mono font-extrabold px-4 py-1.5 rounded-xl text-xs uppercase tracking-wider"
              >
                Dispatch Convoy
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
