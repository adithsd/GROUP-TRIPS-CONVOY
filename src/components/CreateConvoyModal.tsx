import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Car, X, Shield, Navigation } from 'lucide-react';
import { Destination, ConvoyMember, ConvoyParty } from '../types';
import { convoyService } from '../services/convoyService';

interface CreateConvoyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (party: ConvoyParty, user: ConvoyMember) => void;
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

const AVATARS = ['🏎️', '🚙', '🚗', '🚐', '🏎️', '⚡', '🚀', '🔥'];

export const CreateConvoyModal: React.FC<CreateConvoyModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  defaultLocation
}) => {
  const [destinationQuery, setDestinationQuery] = useState('');
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [name, setName] = useState('');
  const [vehicleModel, setVehicleModel] = useState('Tesla Model 3');
  const [vehicleColor, setVehicleColor] = useState('#06b6d4');
  const [avatar, setAvatar] = useState('🏎️');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Pre-populate if Google Places library available
    const loadAutocomplete = async () => {
      if (typeof window !== 'undefined' && (window as any).google?.maps) {
        try {
          const { AutocompleteSuggestion } = await (window as any).google.maps.importLibrary('places');
          // We can also let user type freely or use AutocompleteSuggestion
        } catch (e) {
          console.log('Places library load error:', e);
        }
      }
    };
    loadAutocomplete();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDestinationSearch = async (query: string) => {
    setDestinationQuery(query);
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      if ((window as any).google?.maps) {
        const { AutocompleteSuggestion } = await (window as any).google.maps.importLibrary('places');
        const request = {
          input: query,
          includedPrimaryTypes: ['locality', 'establishment', 'geocode']
        };
        const { suggestions: results } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        setSuggestions(results || []);
      } else {
        // Fallback mock suggestions if Google Maps isn't loaded yet
        setSuggestions([
          { placePrediction: { text: { text: `${query} City Center` }, placeId: 'mock_1' } },
          { placePrediction: { text: { text: `${query} Airport` }, placeId: 'mock_2' } }
        ]);
      }
    } catch (e) {
      console.error('Autocomplete fetch error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = async (suggestion: any) => {
    const text = suggestion.placePrediction?.text?.text || destinationQuery;
    setDestinationQuery(text);
    setSuggestions([]);

    // Geocode or set destination coordinates
    let lat = defaultLocation.lat + 0.15;
    let lng = defaultLocation.lng + 0.15;

    try {
      if ((window as any).google?.maps && suggestion.placePrediction?.toPlace) {
        const place = suggestion.placePrediction.toPlace();
        await place.fetchFields({ fields: ['location', 'displayName', 'formattedAddress'] });
        if (place.location) {
          lat = place.location.lat();
          lng = place.location.lng();
        }
        setSelectedDest({
          name: place.displayName || text,
          address: place.formattedAddress || text,
          lat,
          lng
        });
        return;
      }
    } catch (e) {
      console.log('Place fetch fields error:', e);
    }

    // Default fallback coords near user
    setSelectedDest({
      name: text,
      address: `${text}, Road Trip Destination`,
      lat,
      lng
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const dest = selectedDest || {
      name: destinationQuery || 'Scenic Lookout Peak',
      address: 'Pacific Coast Highway, Mile Marker 42',
      lat: defaultLocation.lat + 0.12,
      lng: defaultLocation.lng + 0.12
    };

    const { party, user } = convoyService.createParty(
      {
        name: name.trim(),
        role: 'host',
        vehicleModel,
        vehicleColor,
        avatar,
        lat: defaultLocation.lat,
        lng: defaultLocation.lng,
        speed: 0,
        heading: 0,
        lastUpdated: Date.now()
      },
      dest
    );

    onCreated(party, user);
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
          <div className="w-12 h-12 bg-cyan-500/20 border border-cyan-500/40 rounded-2xl flex items-center justify-center text-cyan-400">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Create a Road Convoy</h2>
            <p className="text-xs text-slate-400">Set a destination and invite friends to track in real-time</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Destination Search (Places Autocomplete)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
              <input
                ref={inputRef}
                type="text"
                value={destinationQuery}
                onChange={(e) => handleDestinationSearch(e.target.value)}
                placeholder="e.g. Yosemite National Park, Big Sur, Las Vegas..."
                required
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
            {suggestions.length > 0 && (
              <div className="absolute z-20 mt-1 left-0 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-slate-700/80 border-b border-slate-700/50 last:border-0 flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{s.placePrediction?.text?.text}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedDest && (
              <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
                ✓ Destination locked: <span className="font-semibold">{selectedDest.name}</span>
              </p>
            )}
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
                placeholder="e.g. Alex Vance"
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
                placeholder="e.g. Tesla Model 3"
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
            className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-cyan-500/25 text-sm"
          >
            Launch Convoy Party
          </button>
        </form>
      </div>
    </div>
  );
};
