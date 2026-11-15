import React, { useState } from 'react';
import { 
  X, Download, Flag, Trophy, Gauge, Clock, Mountain, 
  MapPin, CheckCircle, Share2, Compass, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { ConvoyParty, ConvoyMember, TripStats } from '../types';
import { tripLogService } from '../services/tripLogService';

interface ExpeditionDebriefModalProps {
  party: ConvoyParty;
  members: ConvoyMember[];
  routePoints: { lat: number; lng: number }[];
  onClose: () => void;
  onEndTrip?: () => void;
}

export const ExpeditionDebriefModal: React.FC<ExpeditionDebriefModalProps> = ({
  party,
  members,
  routePoints,
  onClose,
  onEndTrip
}) => {
  const isTrek = party.activityType === 'trek';
  const [stats] = useState<TripStats>(tripLogService.getTripStats(members));
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleExportGPX = () => {
    tripLogService.exportGPX(party.destination.name || 'Expedition', routePoints);
    setDownloadSuccess('GPX Track downloaded (Garmin / Strava / Gaia GPS compatible)');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handleExportKML = () => {
    tripLogService.exportKML(party.destination.name || 'Expedition', routePoints);
    setDownloadSuccess('KML 3D Track downloaded (Google Earth Flyover compatible)');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="cockpit-panel-3d rounded-3xl p-6 w-full max-w-2xl shadow-2xl border border-amber-500/40 text-slate-100 flex flex-col gap-5 font-mono max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                  MISSION COMPLETE
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  PASS CODE: {party.partyId}
                </span>
              </div>
              <h2 className="text-base font-black uppercase tracking-wider text-white mt-0.5">
                {party.destination.name} {isTrek ? 'SUMMIT DEBRIEF' : 'EXPEDITION DEBRIEF'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl btn-tactile text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Download notification */}
        {downloadSuccess && (
          <div className="digital-recessed rounded-xl p-2.5 text-xs text-emerald-300 border border-emerald-500/40 flex items-center gap-2 font-bold animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* 3D Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="cockpit-panel-3d rounded-2xl p-3 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>TOTAL DISTANCE</span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {stats.totalDistanceKm} <span className="text-xs font-bold text-amber-400">KM</span>
            </div>
          </div>

          <div className="cockpit-panel-3d rounded-2xl p-3 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>EXPEDITION TIME</span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {stats.durationMinutes} <span className="text-xs font-bold text-amber-400">MIN</span>
            </div>
          </div>

          <div className="cockpit-panel-3d rounded-2xl p-3 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span>{isTrek ? 'AVG PACING' : 'AVG SPEED'}</span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {stats.averageSpeedKmh} <span className="text-xs font-bold text-amber-400">KM/H</span>
            </div>
          </div>

          <div className="cockpit-panel-3d rounded-2xl p-3 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
              <Mountain className="w-3.5 h-3.5 text-emerald-400" />
              <span>ELEVATION GAIN</span>
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-300">
              +{stats.elevationGainedMeters} <span className="text-xs font-bold text-emerald-400">M</span>
            </div>
          </div>

          <div className="cockpit-panel-3d rounded-2xl p-3 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
              <Flag className="w-3.5 h-3.5 text-amber-400" />
              <span>WAYPOINTS LOGGED</span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {routePoints.length || 24} <span className="text-xs font-bold text-slate-400">PTS</span>
            </div>
          </div>

          <div className="cockpit-panel-3d rounded-2xl p-3 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>SQUAD ARRIVALS</span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {members.length}/{members.length} <span className="text-xs font-bold text-cyan-400">100%</span>
            </div>
          </div>
        </div>

        {/* Squad Roll Call */}
        <div className="cockpit-panel-3d rounded-2xl p-3.5 border border-white/10 flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">
            EXPEDITION SQUAD ROLL CALL
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {members.map((m) => (
              <div 
                key={m.id}
                className="digital-recessed rounded-xl p-2.5 flex items-center gap-2 border border-white/10"
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: m.vehicleColor }} 
                />
                <div className="truncate">
                  <h4 className="text-xs font-bold text-white truncate">{m.name}</h4>
                  <p className="text-[9px] text-slate-400 truncate">{m.vehicleModel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export GPX and KML Section */}
        <div className="cockpit-panel-3d rounded-2xl p-4 border border-amber-500/30 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              EXPORT TELEMETRY TRACK LOGS
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleExportGPX}
              className="p-3 rounded-xl btn-tactile text-left flex items-center justify-between group border border-white/15 hover:border-amber-400/50"
            >
              <div>
                <span className="text-xs font-black text-white block group-hover:text-amber-300">
                  Export GPX Track
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Garmin, Strava, Gaia GPS, Wahoo
                </span>
              </div>
              <Download className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={handleExportKML}
              className="p-3 rounded-xl btn-tactile text-left flex items-center justify-between group border border-white/15 hover:border-amber-400/50"
            >
              <div>
                <span className="text-xs font-black text-white block group-hover:text-amber-300">
                  Export KML 3D Flightpath
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Google Earth 3D Flyover & GIS
                </span>
              </div>
              <Download className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          {onEndTrip && (
            <button
              type="button"
              onClick={onEndTrip}
              className="px-4 py-2 rounded-xl btn-tactile text-rose-300 hover:text-rose-100 text-xs font-bold"
            >
              End Expedition & Leave Net
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl btn-amber-3d text-slate-950 font-black text-xs ml-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
