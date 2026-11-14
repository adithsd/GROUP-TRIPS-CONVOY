import React, { useState, useEffect } from 'react';
import { Users, Car, X, KeyRound } from 'lucide-react';
import { ConvoyMember, ConvoyParty } from '../types';
import { convoyService } from '../services/convoyService';

interface JoinConvoyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoined: (party: ConvoyParty, user: ConvoyMember) => void;
  defaultPartyCode?: string;
  defaultLocation: { lat: number; lng: number };
}

const VEHICLE_COLORS = [
  { name: 'Electric Cyan', hex: '#06b6d4' },
  { name: 'Racing Red', hex: '#ef4444' },
  { name: 'Midnight Blue', hex: '#3b82f6' },
  { name: 'Neon Emerald', hex: '#10b981' },
  { name: 'Sunset Orange', hex: '#f97316' },
  { name: 'Amethyst Purple', hex: '#8b5cf6' }
];

const AVATARS = ['🏎️', '🚙', '🚗', '🚐', '⚡', '🚀', '🔥'];

export const JoinConvoyModal: React.FC<JoinConvoyModalProps> = ({
  isOpen,
  onClose,
  onJoined,
  defaultPartyCode = '',
  defaultLocation
}) => {
  const [partyCode, setPartyCode] = useState(defaultPartyCode);
  const [name, setName] = useState('');
  const [vehicleModel, setVehicleModel] = useState('Jeep Wrangler');
  const [vehicleColor, setVehicleColor] = useState('#3b82f6');
  const [avatar, setAvatar] = useState('🚙');
  const [error, setError] = useState('');

  useEffect(() => {
    if (defaultPartyCode) {
      setPartyCode(defaultPartyCode);
    }
  }, [defaultPartyCode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!partyCode.trim() || !name.trim()) {
      setError('Please enter both party code and your name.');
      return;
    }

    const result = convoyService.joinParty(partyCode.trim().toUpperCase(), {
      name: name.trim(),
      vehicleModel,
      vehicleColor,
      avatar,
      lat: defaultLocation.lat + (Math.random() * 0.02 - 0.01),
      lng: defaultLocation.lng + (Math.random() * 0.02 - 0.01),
      speed: 0,
      heading: 0,
      lastUpdated: Date.now()
    });

    if (!result) {
      setError('Party not found. Please check the 6-character code and ensure the host is active.');
      return;
    }

    onJoined(result.party, result.user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800/80 p-2 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/40 rounded-2xl flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Join Active Convoy</h2>
            <p className="text-xs text-slate-400">Enter your friend's party code to join the live road trip</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              6-Character Party Code
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
              <input
                type="text"
                value={partyCode}
                onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
                placeholder="e.g. A3F8K2"
                maxLength={6}
                required
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-3 font-mono font-bold tracking-widest text-cyan-400 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Your Driver Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Lee"
                required
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Vehicle Model
              </label>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g. Jeep Wrangler"
                required
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Vehicle Color Badge
            </label>
            <div className="flex items-center gap-2.5">
              {VEHICLE_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setVehicleColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-8 h-8 rounded-full transition transform ${
                    vehicleColor === c.hex ? 'ring-4 ring-white/30 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Driver Avatar
            </label>
            <div className="flex items-center gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center bg-slate-800 border transition ${
                    avatar === av ? 'border-cyan-500 bg-cyan-500/20 scale-105' : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-blue-500/25 text-sm"
          >
            Join Convoy Party
          </button>
        </form>
      </div>
    </div>
  );
};
