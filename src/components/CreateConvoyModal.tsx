import React, { useState, useRef } from 'react';
import { MapPin, Compass, X, Mountain, Car } from 'lucide-react';
import { Destination, ConvoyMember, ConvoyParty, VehicleType } from '../types';
import { convoyService } from '../services/convoyService';
import { VehicleIcon } from './VehicleIcon';

interface CreateConvoyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (party: ConvoyParty, user: ConvoyMember) => void;
  defaultLocation: { lat: number; lng: number };
  initialActivity?: 'convoy' | 'trek';
}

const VEHICLE_CONFIGS = [
  { model: 'Rivian R1S Overland', type: 'suv' as VehicleType, color: '#ffaa00', label: 'Overland 4x4' },
  { model: 'Ford F-150 Lightning', type: 'truck' as VehicleType, color: '#f59e0b', label: 'Heavy Rig' },
  { model: 'Porsche Taycan Cross', type: 'sport' as VehicleType, color: '#10b981', label: 'Pacesetter' },
  { model: 'Tesla Model Y AWD', type: 'suv' as VehicleType, color: '#e2e8f0', label: 'Expedition' },
  { model: 'Audi RS6 Avant', type: 'sport' as VehicleType, color: '#ef4444', label: 'Rally GT' }
];

const TREK_CONFIGS = [
  { model: 'Trail Scout / Lead Guide', type: 'hiker' as VehicleType, color: '#ffaa00', label: 'Pace Scout' },
  { model: 'Expedition Backpacker 65L', type: 'backpacker' as VehicleType, color: '#10b981', label: 'Heavy Pack' },
  { model: 'Alpine Ultralight Hiker', type: 'hiker' as VehicleType, color: '#f59e0b', label: 'Trail Mid' },
  { model: 'Mountain Sweep Guard', type: 'backpacker' as VehicleType, color: '#ef4444', label: 'Tail Guard' }
];

const CURATED_ROAD_DESTINATIONS = [
  { name: 'Yosemite National Park', address: 'Yosemite Valley, CA 95389', lat: 37.8651, lng: -119.5383 },
  { name: 'Big Sur (Pacific Coast Hwy)', address: 'Highway 1, Big Sur, CA', lat: 36.2704, lng: -121.8081 },
  { name: 'Red Rock Canyon', address: 'Scenic Loop Rd, Las Vegas, NV', lat: 36.1352, lng: -115.4272 },
  { name: 'Lake Tahoe Rim Trail', address: 'Emerald Bay, Lake Tahoe, CA', lat: 38.9535, lng: -120.1105 }
];

const CURATED_TREK_DESTINATIONS = [
  { name: 'Half Dome Summit Peak', address: 'John Muir Trail, Yosemite, CA', lat: 37.7459, lng: -119.5332, altitudeMeters: 2694 },
  { name: 'Mount Whitney Trailhead', address: 'Whitney Portal Rd, Lone Pine, CA', lat: 36.5870, lng: -118.2394, altitudeMeters: 4421 },
  { name: 'Angel\'s Landing Peak', address: 'West Rim Trail, Zion National Park, UT', lat: 37.2691, lng: -112.9479, altitudeMeters: 1765 },
  { name: 'Skyline Trail / Mount Rainier', address: 'Paradise Valley, WA', lat: 46.7860, lng: -121.7350, altitudeMeters: 3100 }
];

export const CreateConvoyModal: React.FC<CreateConvoyModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  defaultLocation,
  initialActivity = 'convoy'
}) => {
  const [activityType, setActivityType] = useState<'convoy' | 'trek'>(initialActivity);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [name, setName] = useState(activityType === 'trek' ? 'Marcus Cole (Lead Scout)' : 'Alex Vance (Lead)');
  
  const currentConfigs = activityType === 'trek' ? TREK_CONFIGS : VEHICLE_CONFIGS;
  const currentPresets = activityType === 'trek' ? CURATED_TREK_DESTINATIONS : CURATED_ROAD_DESTINATIONS;

  const [selectedVehicle, setSelectedVehicle] = useState(currentConfigs[0]);
  const [vehicleColor, setVehicleColor] = useState(currentConfigs[0].color);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDestinationSearch = async (query: string) => {
    setDestinationQuery(query);
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      if ((window as any).google?.maps) {
        const { AutocompleteSuggestion } = await (window as any).google.maps.importLibrary('places');
        const request = {
          input: query,
          includedPrimaryTypes: ['locality', 'establishment', 'geocode', 'natural_feature']
        };
        const { suggestions: results } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        setSuggestions(results || []);
        return;
      }
    } catch (e) {
      console.warn('Places API Autocomplete fallback:', e);
    }

    const matched = currentPresets.filter(d => 
      d.name.toLowerCase().includes(query.toLowerCase()) || d.address.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(matched.map(m => ({
      placePrediction: { text: { text: m.name }, customDest: m }
    })));
  };

  const handleSelectSuggestion = async (suggestion: any) => {
    if (suggestion.placePrediction?.customDest) {
      const dest = suggestion.placePrediction.customDest;
      setSelectedDest(dest);
      setDestinationQuery(dest.name);
      setSuggestions([]);
      return;
    }

    const text = suggestion.placePrediction?.text?.text || destinationQuery;
    setDestinationQuery(text);
    setSuggestions([]);

    let lat = defaultLocation.lat + 0.18;
    let lng = defaultLocation.lng + 0.18;

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
      console.warn('Place fetchFields error:', e);
    }

    setSelectedDest({
      name: text,
      address: `${text}, Trail Route`,
      lat,
      lng
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const dest = selectedDest || {
      name: destinationQuery || (activityType === 'trek' ? 'Half Dome Summit Peak' : 'Yosemite National Park'),
      address: activityType === 'trek' ? 'Alpine Trail Mile Marker 8' : 'Scenic Valley Route 120',
      lat: defaultLocation.lat + 0.22,
      lng: defaultLocation.lng + 0.22,
      altitudeMeters: activityType === 'trek' ? 2694 : undefined
    };

    const initialSpeed = activityType === 'trek' ? 4 : 0;

    const { party, user } = convoyService.createParty(
      {
        name: name.trim(),
        role: 'host',
        vehicleModel: selectedVehicle.model,
        vehicleType: selectedVehicle.type,
        vehicleColor: vehicleColor,
        avatar: activityType === 'trek' ? '🥾' : '🏎️',
        lat: defaultLocation.lat,
        lng: defaultLocation.lng,
        speed: initialSpeed,
        heading: 45,
        elevationMeters: activityType === 'trek' ? 2450 : undefined,
        batteryLevel: 94,
        lastUpdated: Date.now()
      },
      dest
    );

    party.activityType = activityType;

    onCreated(party, user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06080d]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="cockpit-panel-3d rounded-3xl max-w-xl w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 btn-tactile text-slate-400 hover:text-white p-2 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#2a3442] to-[#121720] border border-white/20 flex items-center justify-center text-amber-400 shadow-xl shadow-black/70">
            {activityType === 'trek' ? <Mountain className="w-6 h-6" /> : <Compass className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-extrabold px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                MISSION DISPATCH
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-0.5 font-mono">
              {activityType === 'trek' ? 'Create Wilderness Mountain Trek' : 'Create Road Trip Convoy'}
            </h2>
          </div>
        </div>

        {/* Activity Mode Switch: Highway Convoy vs Mountain Trek */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-1 digital-recessed rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setActivityType('convoy');
              setSelectedVehicle(VEHICLE_CONFIGS[0]);
              setVehicleColor(VEHICLE_CONFIGS[0].color);
              setSelectedDest(null);
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-mono font-bold transition ${
              activityType === 'convoy'
                ? 'bg-gradient-to-b from-[#2a3442] to-[#151b24] text-white border border-white/20 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-4 h-4 text-amber-400" />
            <span>Highway Convoy (Vehicles)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActivityType('trek');
              setSelectedVehicle(TREK_CONFIGS[0]);
              setVehicleColor(TREK_CONFIGS[0].color);
              setSelectedDest(null);
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-mono font-bold transition ${
              activityType === 'trek'
                ? 'bg-gradient-to-b from-[#2a3442] to-[#151b24] text-white border border-white/20 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mountain className="w-4 h-4 text-emerald-400" />
            <span>Mountain Trek (Hikers)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Destination Input with Places Autocomplete */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{activityType === 'trek' ? 'Trail Peak / Campsite Target' : 'Mission Destination'}</span>
              <span className="text-[10px] text-amber-400 font-bold">Google Places API</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-400" />
              <input
                ref={inputRef}
                type="text"
                value={destinationQuery}
                onChange={(e) => handleDestinationSearch(e.target.value)}
                placeholder={activityType === 'trek' ? "Search mountain peak, pass, or trail..." : "Search destination (e.g. Yosemite, Big Sur)..."}
                required
                className="w-full digital-recessed rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition font-mono"
              />
            </div>

            {/* Curated quick picks */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] font-mono text-slate-400 mr-1 self-center">Presets:</span>
              {currentPresets.map((dest) => (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => {
                    setSelectedDest(dest);
                    setDestinationQuery(dest.name);
                    setSuggestions([]);
                  }}
                  className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition ${
                    selectedDest?.name === dest.name
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                  }`}
                >
                  {dest.name.split(' (')[0].split(' /')[0]}
                </button>
              ))}
            </div>

            {/* Suggestions drop */}
            {suggestions.length > 0 && (
              <div className="relative z-30 mt-1 bg-slate-900 border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-slate-800 border-b border-white/5 last:border-0 flex items-center gap-2 font-mono"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{s.placePrediction?.text?.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Driver & Callsign */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              {activityType === 'trek' ? 'Lead Hiker Scout / Name' : 'Lead Driver Call Sign / Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={activityType === 'trek' ? "e.g. Marcus Cole (Lead Scout)" : "e.g. Alex Vance (Pacesetter)"}
              required
              className="w-full digital-recessed rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition font-mono"
            />
          </div>

          {/* Rig / Hiker Gear Selection */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              {activityType === 'trek' ? 'Select Trail Pack Role' : 'Select Lead Vehicle Rig'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentConfigs.map((v) => {
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
                        size={28}
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

          <button
            type="submit"
            className="w-full mt-4 btn-amber-3d text-slate-950 font-mono font-extrabold py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider"
          >
            {activityType === 'trek' ? 'Dispatch Wilderness Trek & Link Trail Squad' : 'Dispatch Convoy & Generate Code'}
          </button>
        </form>
      </div>
    </div>
  );
};
