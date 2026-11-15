import React from 'react';
import { ConvoyMember } from '../types';
import { ShieldCheck, Gauge } from 'lucide-react';
import { VehicleIcon } from './VehicleIcon';

interface FormationRadarProps {
  members: ConvoyMember[];
  currentUserId: string;
  onSelectMember: (id: string) => void;
  selectedMemberId: string | null;
}

export const FormationRadar: React.FC<FormationRadarProps> = ({
  members,
  currentUserId,
  onSelectMember,
  selectedMemberId
}) => {
  if (members.length === 0) return null;

  // Sort members by distanceToDestKm ascending (closest to destination is Lead)
  const sorted = [...members].sort((a, b) => (a.distanceToDestKm ?? 0) - (b.distanceToDestKm ?? 0));

  const averageSpeed = Math.round(
    members.reduce((acc, m) => acc + (m.speed || 0), 0) / members.length
  );

  return (
    <div className="cockpit-panel-3d rounded-2xl p-3 text-xs shadow-2xl">
      {/* Header telemetry line */}
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
          <span className="font-mono uppercase tracking-wider font-extrabold text-white text-[11px]">
            CONVOY 3D RADAR HUD
          </span>
          <span className="text-[10px] text-amber-400 font-mono font-bold">[{members.length} RIGS]</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300">
          <div className="flex items-center gap-1.5 digital-recessed px-2 py-0.5 rounded-lg">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>AVG: <strong className="text-white">{averageSpeed}</strong> KM/H</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-emerald-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>IN FORMATION</span>
          </div>
        </div>
      </div>

      {/* 3D Highway Convoy Track */}
      <div className="relative py-3 px-3 overflow-x-auto digital-recessed rounded-xl">
        <div className="flex items-center justify-between min-w-[500px] relative py-2">
          {/* 3D Highway Road Surface */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-2.5 bg-[#141a24] rounded-full border border-white/10 shadow-inner" />
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 border-t border-dashed border-amber-500/40" />

          {sorted.map((member, idx) => {
            const isMe = member.id === currentUserId;
            const isLead = idx === 0;
            const isSweep = idx === sorted.length - 1 && sorted.length > 1;
            const isSelected = selectedMemberId === member.id;

            // Headway separation
            let headwayText = '';
            if (idx > 0) {
              const prev = sorted[idx - 1];
              const diffKm = Math.abs((member.distanceToDestKm ?? 0) - (prev.distanceToDestKm ?? 0));
              headwayText = diffKm >= 1 ? `+${diffKm.toFixed(1)} km` : `+${Math.round(diffKm * 1000)} m`;
            }

            return (
              <React.Fragment key={member.id}>
                {/* Distance spacing tag between vehicles */}
                {idx > 0 && (
                  <div className="relative z-10 px-2 py-0.5 rounded bg-[#10151f] border border-white/15 text-[9px] font-mono text-amber-300 font-bold shadow-md">
                    {headwayText}
                  </div>
                )}

                {/* 3D Vehicle node */}
                <button
                  type="button"
                  onClick={() => onSelectMember(member.id)}
                  className={`relative z-10 flex flex-col items-center group transition transform hover:-translate-y-1 ${
                    isSelected ? 'scale-105' : ''
                  }`}
                >
                  {/* Position callout tag */}
                  <span className={`text-[8px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5 font-extrabold shadow-sm ${
                    isLead 
                      ? 'bg-amber-500 text-slate-950 shadow-amber-500/30' 
                      : isSweep 
                        ? 'bg-purple-600 text-white shadow-purple-500/30'
                        : 'bg-slate-800 text-slate-300 border border-white/10'
                  }`}>
                    {isLead ? 'LEAD' : isSweep ? 'SWEEP' : `RIG ${idx + 1}`}
                  </span>

                  {/* 3D Vehicle Badge */}
                  <div 
                    style={{ borderColor: member.vehicleColor }}
                    className={`relative p-2 rounded-xl border-2 transition shadow-lg ${
                      isMe 
                        ? 'bg-slate-900 border-amber-400 ring-4 ring-amber-400/20' 
                        : 'bg-slate-900'
                    } ${isSelected ? 'ring-2 ring-white shadow-xl -translate-y-1' : ''}`}
                  >
                    <VehicleIcon
                      type={member.vehicleType || 'suv'}
                      color={member.vehicleColor}
                      heading={member.heading}
                      size={30}
                      showHeadlights={false}
                    />

                    {/* Status ping indicator */}
                    {member.activeStatus && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping shadow-sm" />
                    )}
                  </div>

                  {/* Driver Name & Speed */}
                  <div className="text-center mt-1.5">
                    <p className="text-[10px] font-bold text-white leading-tight font-mono flex items-center justify-center gap-1">
                      <span>{member.name.split(' ')[0]}</span>
                      {isMe && <span className="text-[8px] text-amber-400 font-bold">(YOU)</span>}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono font-medium">{member.speed} KM/H</p>
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
