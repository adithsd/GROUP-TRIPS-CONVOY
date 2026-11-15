import React from 'react';
import { Mountain, Compass, Footprints, Droplets, Tent, ShieldAlert, ArrowRight, Play, Battery, TrendingUp } from 'lucide-react';
import { VehicleIcon } from './VehicleIcon';

interface TrekTileProps {
  onLaunchTrekDemo: () => void;
  onOpenCreateTrek: () => void;
}

export const TrekTile: React.FC<TrekTileProps> = ({ onLaunchTrekDemo, onOpenCreateTrek }) => {
  return (
    <div className="w-full cockpit-panel-3d card-3d-tilt rounded-3xl p-6 mb-10 text-left border border-amber-500/30 relative overflow-hidden shadow-2xl">
      {/* Background Mountain Topo Contour Overlay */}
      <div 
        className="absolute -right-10 -bottom-10 w-96 h-96 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
          backgroundSize: '18px 18px'
        }}
      />

      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
          <span className="font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Mountain className="w-4 h-4 text-amber-400" />
            BACKCOUNTRY TREK & TRAIL SYNC MODE
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-300 text-[11px] font-bold">
          <span className="digital-recessed px-2 py-0.5 rounded text-amber-300 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-amber-400" />
            ELEVATION: 2,694m
          </span>
          <span className="text-slate-400">TRAIL PACK: 4 HIKERS</span>
        </div>
      </div>

      {/* Core Tile Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: Trek Use Case Overview */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xl sm:text-2xl font-mono font-extrabold text-white leading-tight">
            Heading Into the Mountains? <br />
            <span className="text-amber-400">Keep Your Hiking Squad Linked on the Trail.</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            ConvoyPulse isn't just for cars. When your squad hits backcountry trails, switch to <strong>Trek Mode</strong> to monitor trail elevation, pacing, and separation distance between the lead scout and the sweep guard so no one gets left behind in dense fog or switchbacks.
          </p>

          {/* Trek Feature Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
            <div className="digital-recessed p-2 rounded-xl flex items-center gap-2 border border-white/5">
              <Footprints className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-slate-400 text-[9px] block">PACING</span>
                <span className="font-bold text-white">4.2 KM/H</span>
              </div>
            </div>

            <div className="digital-recessed p-2 rounded-xl flex items-center gap-2 border border-white/5">
              <Droplets className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 text-[9px] block">WATER STOPS</span>
                <span className="font-bold text-white">SPRING IN 1.8km</span>
              </div>
            </div>

            <div className="digital-recessed p-2 rounded-xl flex items-center gap-2 border border-white/5">
              <Tent className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-slate-400 text-[9px] block">BASECAMP</span>
                <span className="font-bold text-white">HALF DOME</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onLaunchTrekDemo}
              className="btn-amber-3d text-slate-950 font-mono font-extrabold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Half Dome Trek Demo</span>
            </button>

            <button
              onClick={onOpenCreateTrek}
              className="btn-tactile text-slate-200 font-mono font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <Mountain className="w-3.5 h-3.5 text-amber-400" />
              <span>Dispatch Custom Trek</span>
            </button>
          </div>
        </div>

        {/* Right Side: 3D Hiker Telemetry Preview Cards */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { name: 'Marcus Cole', role: 'Lead Scout', rig: 'Trail Guide', color: '#ffaa00', pace: '4.8 km/h', elev: '2,694m', sep: 'LEAD', type: 'hiker' as const },
            { name: 'Elena Rostova', role: 'Navigator', rig: 'Osprey 65L', color: '#00ff88', pace: '4.4 km/h', elev: '2,670m', sep: '+85m', type: 'backpacker' as const },
            { name: 'Jordan Lee (You)', role: 'Pack Mid', rig: 'Gregory Baltoro', color: '#f59e0b', pace: '4.2 km/h', elev: '2,650m', sep: '+160m', type: 'backpacker' as const },
            { name: 'Samira Khan', role: 'Sweep Guard', rig: 'Deuter Aircontact', color: '#ef4444', pace: '3.9 km/h', elev: '2,610m', sep: '+310m', type: 'hiker' as const }
          ].map((hiker, idx) => (
            <div 
              key={idx}
              className="bg-gradient-to-b from-[#18202c] to-[#0c1017] border border-white/10 rounded-2xl p-2.5 shadow-md hover:border-amber-400/40 transition"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1 rounded-lg bg-[#080b11] border border-white/10 shrink-0 shadow-inner">
                  <VehicleIcon type={hiker.type} color={hiker.color} heading={35} size={24} showHeadlights={false} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-white truncate font-mono">{hiker.name}</p>
                  <p className="text-[10px] text-amber-400 font-mono truncate">{hiker.role}</p>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold border border-white/10">
                  {hiker.sep}
                </span>
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono text-slate-300 pt-1 border-t border-white/10">
                <span>{hiker.pace}</span>
                <span className="text-amber-300 font-bold">{hiker.elev}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
