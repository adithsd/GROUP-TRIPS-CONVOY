import React, { useState, useEffect } from 'react';
import { KeyRound, X, Radio } from 'lucide-react';
import { ConvoyMember, ConvoyParty, VehicleType } from '../types';
import { convoyService } from '../services/convoyService';
import { VehicleIcon } from './VehicleIcon';

interface JoinConvoyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoined: (party: ConvoyParty, user: ConvoyMember) => void;
  defaultPartyCode?: string;
  defaultLocation: { lat: number; lng: number };
}

const VEHICLE_CONFIGS = [
  { model: 'Rivian R1S Overland', type: 'suv' as VehicleType, color: '#ffaa00', label: 'Overland 4x4' },
  { model: 'Ford F-150 Lightning', type: 'truck' as VehicleType, color: '#f59e0b', label: 'Heavy Rig' },
  { model: 'Porsche Taycan Cross', type: 'sport' as VehicleType, color: '#10b981', label: 'Pacesetter' },
  { model: 'Tesla Model Y AWD', type: 'suv' as VehicleType, color: '#e2e8f0', label: 'Expedition' }
];

export const JoinConvoyModal: React.FC<JoinConvoyModalProps> = ({
  isOpen,
  onClose,
  onJoined,
  defaultPartyCode = '',
  defaultLocation
}) => {
  const [partyCode, setPartyCode] = useState(defaultPartyCode);
  const [name, setName] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_CONFIGS[1]);
  const [vehicleColor, setVehicleColor] = useState(VEHICLE_CONFIGS[1].color);
  const [error, setError] = useState('');

  useEffect(() => {
    if (defaultPartyCode) {
      setPartyCode(defaultPartyCode.toUpperCase());
    }
  }, [defaultPartyCode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!partyCode.trim() || !name.trim()) {
      setError('Please provide both party code and your driver call sign.');
      return;
    }

    const result = convoyService.joinParty(partyCode.trim().toUpperCase(), {
      name: name.trim(),
      vehicleModel: selectedVehicle.model,
      vehicleType: selectedVehicle.type,
      vehicleColor: vehicleColor,
      avatar: '🚙',
      lat: defaultLocation.lat + (Math.random() * 0.015 - 0.008),
      lng: defaultLocation.lng + (Math.random() * 0.015 - 0.008),
      speed: 0,
      heading: 45,
      batteryLevel: 89,
      lastUpdated: Date.now()
    });

    if (!result) {
      setError(`Party "${partyCode.toUpperCase()}" not found on this computer. Ensure host is active or open the host link in another tab.`);
      return;
    }

    onJoined(result.party, result.user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06080d]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="cockpit-panel-3d rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 btn-tactile text-slate-400 hover:text-white p-2 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#2a3442] to-[#121720] border border-white/20 flex items-center justify-center text-amber-400 shadow-xl shadow-black/70">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-extrabold px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
              FLEET TRANSCEIVER
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1 font-mono">Join Active Convoy</h2>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs px-4 py-3 rounded-xl mb-4 font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              6-Character Party Code
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-400" />
              <input
                type="text"
                value={partyCode}
                onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
                placeholder="e.g. A3F8K2"
                maxLength={6}
                required
                className="w-full digital-recessed rounded-xl pl-10 pr-4 py-3 font-mono font-extrabold tracking-widest text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition uppercase text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Your Driver Call Sign / Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jordan Lee (Sweeper-2)"
              required
              className="w-full digital-recessed rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Select Your Rig
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VEHICLE_CONFIGS.map((v) => {
                const isSelected = selectedVehicle.model === v.model;
                return (
                  <button
                    key={v.model}
                    type="button"
                    onClick={() => {
                      setSelectedVehicle(v);
                      setVehicleColor(v.color);
                    }}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#253040] to-[#141a24] border-amber-400 ring-2 ring-amber-400/25 shadow-lg'
                        : 'bg-slate-950/70 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="p-1 rounded-lg bg-[#080b11] border border-white/10 shrink-0 shadow-inner">
                      <VehicleIcon
                        type={v.type}
                        color={isSelected ? vehicleColor : v.color}
                        heading={0}
                        size={26}
                        showHeadlights={false}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight font-mono">{v.model}</p>
                      <p className="text-[10px] text-amber-400 font-mono font-bold">{v.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Livery Accent
            </label>
            <div className="flex items-center gap-2">
              {['#ffaa00', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#a855f7'].map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setVehicleColor(hex)}
                  style={{ backgroundColor: hex }}
                  className={`w-7 h-7 rounded-full transition transform ${
                    vehicleColor === hex ? 'ring-4 ring-white/50 scale-110 shadow-lg' : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 btn-amber-3d text-slate-950 font-mono font-extrabold py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider"
          >
            Lock On & Join Formation
          </button>
        </form>
      </div>
    </div>
  );
};
