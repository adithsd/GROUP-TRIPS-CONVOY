import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Radio, Volume2, VolumeX, Send, Sparkles, X, Activity } from 'lucide-react';
import { ConvoyMember } from '../types';
import { voiceService } from '../services/voiceService';
import { soundService } from '../services/soundService';
import { convoyService } from '../services/convoyService';

interface VoiceWalkieTalkieProps {
  currentUser: ConvoyMember;
  channelName: string;
  isTrek?: boolean;
  onClose?: () => void;
}

export const VoiceWalkieTalkie: React.FC<VoiceWalkieTalkieProps> = ({
  currentUser,
  channelName,
  isTrek = false,
  onClose
}) => {
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmissionStatus, setTransmissionStatus] = useState<'idle' | 'transmitting' | 'receiving'>('idle');
  const [lastTransmission, setLastTransmission] = useState<string | null>(null);
  const [simulatedPrompt, setSimulatedPrompt] = useState('');
  const [isMuted, setIsMuted] = useState(soundService.getIsMuted());
  const [audioLevel, setAudioLevel] = useState<number[]>(new Array(12).fill(15));
  const animRef = useRef<number | null>(null);

  // Audio level animation during transmission
  useEffect(() => {
    if (isTransmitting) {
      const interval = setInterval(() => {
        setAudioLevel(
          Array.from({ length: 14 }, () => Math.floor(Math.random() * 85) + 15)
        );
      }, 80);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(new Array(14).fill(15));
    }
  }, [isTransmitting]);

  // Spacebar push-to-talk handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space' && !isTransmitting && !e.repeat) {
        e.preventDefault();
        startTransmission();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space' && isTransmitting) {
        e.preventDefault();
        stopTransmission();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isTransmitting]);

  const startTransmission = async () => {
    setIsTransmitting(true);
    setTransmissionStatus('transmitting');
    const started = await voiceService.startRecording();
    if (!started) {
      // Fallback if mic permission not granted
      console.log('Using simulated radio transmitter');
    }
  };

  const stopTransmission = async () => {
    setIsTransmitting(false);
    setTransmissionStatus('idle');
    const voiceMsg = await voiceService.stopRecording(currentUser.id, currentUser.name);
    if (voiceMsg) {
      convoyService.broadcastVoiceMessage(voiceMsg);
      setLastTransmission(`Sent voice message (${(voiceMsg.durationMs / 1000).toFixed(1)}s)`);
    } else {
      // Trigger roger beep
      soundService.playRogerBeep();
      setLastTransmission(`Transmission complete on ${channelName}`);
    }
  };

  // Quick simulated voice callouts for instant testing
  const handleQuickRadioCallout = (phrase: string) => {
    setTransmissionStatus('transmitting');
    const voiceMsg = voiceService.generateSimulatedVoice(currentUser.name, phrase);
    convoyService.broadcastVoiceMessage(voiceMsg);
    setLastTransmission(`"${phrase}"`);
    setTimeout(() => {
      setTransmissionStatus('idle');
    }, 1200);
  };

  const handleToggleMute = () => {
    const muted = soundService.toggleMute();
    setIsMuted(muted);
  };

  const QUICK_CALLOUTS = isTrek ? [
    'Holding pace at switchback 4',
    'Loose gravel on ridge, step carefully',
    'Stopping at natural spring to refill',
    'Summit in sight, 300m vertical remaining'
  ] : [
    'Break 1-9, road clear ahead holding 70',
    'Debris in right lane, move to center',
    'Taking exit for fuel & coffee ahead',
    'Holding formation, lead rig in position'
  ];

  return (
    <div className="cockpit-panel-3d rounded-2xl p-4 w-80 sm:w-96 shadow-2xl border border-amber-500/40 text-slate-100 flex flex-col gap-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="w-5 h-5 text-amber-400" />
            <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
              isTransmitting ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'
            }`} />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              {isTrek ? 'ALPINE PTT NET' : 'TACTICAL CB RADIO'}
            </h3>
            <span className="text-[10px] text-amber-400/90 font-bold block">{channelName}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleMute}
            className="p-1.5 rounded-lg btn-tactile text-slate-300"
            title={isMuted ? 'Unmute Roger & Squelch' : 'Mute CB Radio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg btn-tactile text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Recessed Audio Frequency Spectrum Visualizer */}
      <div className="digital-recessed rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 border border-white/10">
        <div className="flex items-end justify-center gap-1 h-12 w-full px-2">
          {audioLevel.map((lvl, idx) => (
            <div
              key={idx}
              className="w-full rounded-sm transition-all duration-75"
              style={{
                height: `${isTransmitting ? lvl : 12}%`,
                backgroundColor: isTransmitting 
                  ? (lvl > 70 ? '#f43f5e' : lvl > 45 ? '#f59e0b' : '#10b981')
                  : '#334155'
              }}
            />
          ))}
        </div>

        <div className="w-full flex items-center justify-between text-[10px] text-slate-400 font-bold px-1">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-amber-400" />
            <span>SQUELCH FILTER</span>
          </span>
          <span className={isTransmitting ? 'text-rose-400 font-black animate-pulse' : 'text-emerald-400'}>
            {isTransmitting ? '● ON AIR / TX' : '○ STANDBY / RX'}
          </span>
        </div>
      </div>

      {/* Central Big 3D Push-To-Talk Button */}
      <div className="flex flex-col items-center justify-center py-2">
        <button
          type="button"
          onMouseDown={startTransmission}
          onMouseUp={stopTransmission}
          onTouchStart={startTransmission}
          onTouchEnd={stopTransmission}
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-1 text-center transition-all duration-150 select-none cursor-pointer ${
            isTransmitting
              ? 'bg-gradient-to-b from-rose-600 to-rose-900 border-4 border-rose-400 shadow-2xl scale-95 ring-8 ring-rose-500/30'
              : 'bg-gradient-to-b from-amber-500 to-amber-700 border-4 border-amber-300 shadow-2xl hover:brightness-110 active:scale-95'
          }`}
          style={{
            boxShadow: isTransmitting
              ? 'inset 0 6px 12px rgba(0,0,0,0.6), 0 0 25px rgba(244, 63, 94, 0.6)'
              : '0 12px 24px -4px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.4)'
          }}
        >
          {isTransmitting ? (
            <Mic className="w-8 h-8 text-white animate-pulse" />
          ) : (
            <MicOff className="w-8 h-8 text-slate-900" />
          )}
          <span className={`text-[11px] font-black tracking-wider uppercase ${isTransmitting ? 'text-white' : 'text-slate-950'}`}>
            {isTransmitting ? 'TRANSMITTING' : 'HOLD TO TALK'}
          </span>
          <span className={`text-[8px] font-bold ${isTransmitting ? 'text-rose-200' : 'text-slate-900'}`}>
            OR HOLD SPACEBAR
          </span>
        </button>
      </div>

      {/* Last Transmission log */}
      {lastTransmission && (
        <div className="digital-recessed rounded-lg px-2.5 py-1.5 text-[10px] text-amber-300 flex items-center justify-between truncate">
          <span className="text-slate-400">LAST TX:</span>
          <span className="font-bold truncate max-w-[200px]">{lastTransmission}</span>
        </div>
      )}

      {/* Quick Tactical Callout Buttons */}
      <div className="flex flex-col gap-1.5 pt-1">
        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">
          QUICK RADIO BROADCASTS
        </span>
        <div className="grid grid-cols-1 gap-1">
          {QUICK_CALLOUTS.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickRadioCallout(phrase)}
              className="text-left px-2.5 py-1.5 rounded-lg btn-tactile text-[10px] text-slate-300 hover:text-amber-300 transition flex items-center justify-between group"
            >
              <span className="truncate">"{phrase}"</span>
              <Sparkles className="w-3 h-3 text-amber-400 opacity-60 group-hover:opacity-100 shrink-0 ml-1" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
