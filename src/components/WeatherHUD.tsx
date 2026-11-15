import React, { useState, useEffect } from 'react';
import { Cloud, Sun, Wind, Eye, AlertTriangle, CloudFog, CloudRain, Compass, ChevronDown, ChevronUp } from 'lucide-react';
import { WeatherCondition } from '../types';
import { weatherService } from '../services/weatherService';

interface WeatherHUDProps {
  lat: number;
  lng: number;
  isTrek?: boolean;
}

export const WeatherHUD: React.FC<WeatherHUDProps> = ({ lat, lng, isTrek = false }) => {
  const [weather, setWeather] = useState<WeatherCondition>(
    weatherService.getWeatherForLocation(lat, lng, isTrek)
  );
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const data = weatherService.getWeatherForLocation(lat, lng, isTrek);
    setWeather(data);
  }, [lat, lng, isTrek]);

  const getWeatherIcon = (condition: WeatherCondition['condition']) => {
    switch (condition) {
      case 'Clear':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'Mountain Fog':
        return <CloudFog className="w-4 h-4 text-slate-300" />;
      case 'High Winds':
        return <Wind className="w-4 h-4 text-cyan-300" />;
      case 'Rain':
        return <CloudRain className="w-4 h-4 text-blue-400" />;
      default:
        return <Cloud className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <div className="cockpit-panel-3d rounded-2xl p-2.5 shadow-2xl border border-white/15 text-white font-mono transition-all duration-200">
      {/* Compact Top Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between gap-3 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#080b11] border border-white/10">
            {getWeatherIcon(weather.condition)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">{weather.tempCelsius}°C</span>
              <span className="text-[10px] text-slate-400 font-bold">• {weather.condition}</span>
            </div>
            <span className="text-[9px] text-amber-400/90 font-bold block">
              {isTrek ? 'PASS MICRO-CLIMATE' : 'ROUTE WEATHER'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-300">
          <div className="flex items-center gap-1 digital-recessed px-2 py-0.5 rounded-md">
            <Wind className="w-3 h-3 text-cyan-400" />
            <span className="font-bold">{weather.windSpeedKmh} km/h</span>
            <span className="text-slate-400 text-[8px]">{weather.windDirection}</span>
          </div>
          <button 
            type="button"
            className="p-1 rounded btn-tactile text-slate-400 hover:text-white"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Meteorological Telemetry */}
      {isExpanded && (
        <div className="mt-2.5 pt-2.5 border-t border-white/10 flex flex-col gap-2 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="digital-recessed rounded-lg p-2 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Eye className="w-3 h-3 text-emerald-400" />
                <span>VISIBILITY:</span>
              </span>
              <span className="font-extrabold text-white">{weather.visibilityKm} km</span>
            </div>

            <div className="digital-recessed rounded-lg p-2 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" />
                <span>CROSSWIND:</span>
              </span>
              <span className="font-extrabold text-amber-300">{weather.windDirection} {weather.windSpeedKmh}k</span>
            </div>
          </div>

          {weather.alert && (
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-[10px] font-bold flex items-start gap-1.5 leading-snug">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <span>{weather.alert}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
