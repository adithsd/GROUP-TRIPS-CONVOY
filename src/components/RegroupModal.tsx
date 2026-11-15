import React, { useState } from 'react';
import { 
  X, MapPin, Zap, Coffee, Fuel, Mountain, Compass, 
  CheckCircle, Sliders, AlertCircle, Navigation, Trash2
} from 'lucide-react';
import { ConvoyParty, ConvoyMember, RegroupPoint } from '../types';
import { convoyService } from '../services/convoyService';

interface RegroupModalProps {
  party: ConvoyParty;
  currentUser: ConvoyMember;
  onClose: () => void;
}

export const RegroupModal: React.FC<RegroupModalProps> = ({ party, currentUser, onClose }) => {
  const isTrek = party.activityType === 'trek';
  const [thresholdKm, setThresholdKm] = useState<number>(party.regroupThresholdKm || (isTrek ? 1.0 : 2.5));
  const [selectedPoint, setSelectedPoint] = useState<RegroupPoint | null>(party.activeRegroupPoint || null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Suggested POIs ahead along the corridor
  const SUGGESTED_POIS: RegroupPoint[] = isTrek ? [
    {
      id: 'poi_trek_1',
      name: 'Merced River Spring & Footbridge',
      type: 'trailhead',
      lat: currentUser.lat + 0.008,
      lng: currentUser.lng + 0.006,
      distanceAheadKm: 1.2,
      designatedBy: currentUser.name,
      timestamp: Date.now()
    },
    {
      id: 'poi_trek_2',
      name: 'Little Yosemite Valley Meadow Rest',
      type: 'trailhead',
      lat: currentUser.lat + 0.018,
      lng: currentUser.lng + 0.014,
      distanceAheadKm: 2.8,
      designatedBy: currentUser.name,
      timestamp: Date.now()
    },
    {
      id: 'poi_trek_3',
      name: 'Subdome Base Saddle Overlook',
      type: 'vista_overlook',
      lat: currentUser.lat + 0.029,
      lng: currentUser.lng + 0.021,
      distanceAheadKm: 4.5,
      designatedBy: currentUser.name,
      timestamp: Date.now()
    }
  ] : [
    {
      id: 'poi_convoy_1',
      name: 'Electrify America & Starbucks Oasis',
      type: 'supercharger',
      lat: currentUser.lat + 0.035,
      lng: currentUser.lng + 0.025,
      distanceAheadKm: 4.2,
      designatedBy: currentUser.name,
      timestamp: Date.now()
    },
    {
      id: 'poi_convoy_2',
      name: 'Shell Highway Travel Plaza & Deli',
      type: 'gas_station',
      lat: currentUser.lat + 0.065,
      lng: currentUser.lng + 0.052,
      distanceAheadKm: 7.8,
      designatedBy: currentUser.name,
      timestamp: Date.now()
    },
    {
      id: 'poi_convoy_3',
      name: 'Eagle Rock Panoramic Viewpoint Turnout',
      type: 'vista_overlook',
      lat: currentUser.lat + 0.095,
      lng: currentUser.lng + 0.081,
      distanceAheadKm: 12.4,
      designatedBy: currentUser.name,
      timestamp: Date.now()
    }
  ];

  const handleUpdateThreshold = (val: number) => {
    setThresholdKm(val);
    convoyService.setRegroupThreshold(val);
    triggerSuccess();
  };

  const handleDesignateRegroup = (poi: RegroupPoint) => {
    setSelectedPoint(poi);
    convoyService.setRegroupPoint(poi);
    triggerSuccess();
  };

  const handleClearRegroup = () => {
    setSelectedPoint(null);
    convoyService.setRegroupPoint(null);
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const PRESETS = isTrek ? [0.5, 1.0, 1.5, 2.0, 3.0] : [1.0, 1.5, 2.5, 4.0, 5.0, 10.0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="cockpit-panel-3d rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-amber-500/40 text-slate-100 flex flex-col gap-5 font-mono max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
                {isTrek ? 'TRAIL REGROUP & GAP CONFIG' : 'CONVOY REGROUP AUTO-FINDER'}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold">
                Dynamic corridor separation thresholds & POI rendezvous
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl btn-tactile text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success toast */}
        {savedSuccess && (
          <div className="digital-recessed rounded-xl p-2.5 text-xs text-emerald-300 border border-emerald-500/40 flex items-center gap-2 font-bold animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Telemetry updated and synced across all squad devices!</span>
          </div>
        )}

        {/* Section 1: Customizable Separation Threshold (User requested flexibility) */}
        <div className="cockpit-panel-3d rounded-2xl p-4 border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Max Separation Threshold
              </span>
            </div>
            <div className="digital-recessed px-3 py-1 rounded-lg">
              <span className="text-base font-extrabold text-amber-400">{thresholdKm.toFixed(1)}</span>
              <span className="text-[9px] text-slate-400 ml-1 font-bold">KM</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            ConvoyPulse warns the convoy whenever the headway gap between the lead and sweep {isTrek ? 'hiker' : 'vehicle'} exceeds this distance.
          </p>

          {/* Slider */}
          <div className="px-1 py-1">
            <input
              type="range"
              min={isTrek ? 0.3 : 0.5}
              max={isTrek ? 5.0 : 15.0}
              step={0.1}
              value={thresholdKm}
              onChange={(e) => handleUpdateThreshold(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-bold">
              <span>{isTrek ? '0.3 km (Tight Pack)' : '0.5 km (Close Formation)'}</span>
              <span>{isTrek ? '5.0 km (Loose Trek)' : '15.0 km (Wide Highway)'}</span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[9px] text-slate-400 uppercase font-extrabold mr-1">PRESETS:</span>
            {PRESETS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleUpdateThreshold(val)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                  Math.abs(thresholdKm - val) < 0.05
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md'
                    : 'btn-tactile text-slate-300'
                }`}
              >
                {val} km
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Active Regroup Lock Status */}
        {selectedPoint ? (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border-2 border-amber-400 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shadow-md">
                <MapPin className="w-5 h-5 font-bold" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 block">
                  ACTIVE CONVOY REGROUP TARGET
                </span>
                <h4 className="text-xs font-black text-white">{selectedPoint.name}</h4>
                <p className="text-[10px] text-slate-300 font-bold">
                  {selectedPoint.distanceAheadKm} km ahead • Designated by {selectedPoint.designatedBy}
                </p>
              </div>
            </div>

            <button
              onClick={handleClearRegroup}
              className="p-2 rounded-xl btn-tactile text-rose-300 hover:text-rose-100 flex items-center gap-1 text-[10px] font-bold"
              title="Clear Regroup Point"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        ) : (
          <div className="digital-recessed rounded-xl p-3 text-[11px] text-slate-400 flex items-center gap-2 border border-white/5">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
            <span>No active regroup waypoint designated. Select an auto-finder POI below to establish a rendezvous stop.</span>
          </div>
        )}

        {/* Section 3: Corridor POI Auto-Finder Suggestions */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
            <span>UPCOMING RENDEZVOUS WAYPOINTS ALONG CORRIDOR</span>
          </span>

          <div className="grid grid-cols-1 gap-2">
            {SUGGESTED_POIS.map((poi) => {
              const isCurrentActive = selectedPoint?.name === poi.name;

              return (
                <div
                  key={poi.id}
                  className={`cockpit-panel-3d rounded-2xl p-3 flex items-center justify-between gap-3 border transition ${
                    isCurrentActive ? 'border-amber-400 bg-amber-500/10' : 'border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#080b11] border border-white/10 text-amber-400">
                      {poi.type === 'supercharger' ? (
                        <Zap className="w-4 h-4 text-amber-400" />
                      ) : poi.type === 'gas_station' ? (
                        <Fuel className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Mountain className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{poi.name}</h4>
                      <span className="text-[10px] text-amber-400/90 font-bold block">
                        {poi.distanceAheadKm} km along route
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDesignateRegroup(poi)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-extrabold flex items-center gap-1.5 transition ${
                      isCurrentActive
                        ? 'bg-amber-500 text-slate-950 border border-amber-300'
                        : 'btn-amber-3d text-slate-950 font-black'
                    }`}
                  >
                    {isCurrentActive ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>ACTIVE</span>
                      </>
                    ) : (
                      <span>LOCK POINT</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl btn-tactile text-xs font-bold text-slate-200"
          >
            Close & Return to HUD
          </button>
        </div>
      </div>
    </div>
  );
};
