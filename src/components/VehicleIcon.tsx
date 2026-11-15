import React from 'react';
import { VehicleType } from '../types';

interface VehicleIconProps {
  type?: VehicleType;
  color: string;
  heading: number; // 0-360 deg
  size?: number;
  showHeadlights?: boolean;
}

export const VehicleIcon: React.FC<VehicleIconProps> = ({
  type = 'suv',
  color = '#ffaa00',
  heading = 0,
  size = 40,
  showHeadlights = true
}) => {
  return (
    <div 
      className="relative flex items-center justify-center transition-transform duration-500 ease-out"
      style={{
        width: size,
        height: size,
        transform: `rotate(${heading}deg)`
      }}
    >
      {/* Forward Headlight / Headlamp Cones */}
      {showHeadlights && (
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none opacity-40"
          style={{
            width: size * 1.3,
            height: size * 0.9,
            background: `radial-gradient(ellipse at 50% 100%, ${color} 0%, transparent 70%)`,
            filter: 'blur(1px)'
          }}
        />
      )}

      {/* SVG Icon Rendering */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {type === 'hiker' || type === 'backpacker' ? (
          // Mountain Trekker / Hiker with Backpack & Trekking Poles
          <>
            {/* Trekking Poles on sides */}
            <line x1="8" y1="12" x2="14" y2="38" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <line x1="40" y1="12" x2="34" y2="38" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <circle cx="8" cy="12" r="2.5" fill={color} />
            <circle cx="40" cy="12" r="2.5" fill={color} />

            {/* Backpacker Heavy Expedition Pack */}
            <rect x="15" y="20" width="18" height="18" rx="4" fill="#1e293b" stroke={color} strokeWidth="2" />
            {/* Backpack strapping */}
            <line x1="15" y1="26" x2="33" y2="26" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
            <line x1="15" y1="32" x2="33" y2="32" stroke={color} strokeWidth="1" strokeDasharray="2 2" />

            {/* Hiker Shoulders / Torso */}
            <ellipse cx="24" cy="20" rx="9" ry="6" fill="#0f172a" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

            {/* Hiker Head / Cap with Headlamp */}
            <circle cx="24" cy="14" r="6" fill="#0f172a" stroke={color} strokeWidth="2" />
            {/* Headlamp beam emitter */}
            <rect x="22" y="7" width="4" height="2.5" rx="1" fill="#fff" />
          </>
        ) : type === 'truck' ? (
          // Pickup Truck (e.g. F-150 / Cyber)
          <>
            <rect x="14" y="6" width="20" height="36" rx="4" fill="#0d1117" stroke={color} strokeWidth="2" />
            <path d="M16 16 L32 16 L30 23 L18 23 Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
            <rect x="16" y="27" width="16" height="13" rx="1.5" fill="#161b22" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <rect x="15" y="7" width="4" height="2" rx="1" fill="#fff" />
            <rect x="29" y="7" width="4" height="2" rx="1" fill="#fff" />
            <rect x="15" y="40" width="4" height="1.5" rx="0.5" fill="#ff3b30" />
            <rect x="29" y="40" width="4" height="1.5" rx="0.5" fill="#ff3b30" />
          </>
        ) : type === 'sport' ? (
          // Aerodynamic Sport GT (Taycan / Model S)
          <>
            <path
              d="M16 10 C16 7, 32 7, 32 10 L34 26 C35 34, 33 40, 31 42 L17 42 C15 40, 13 34, 14 26 Z"
              fill="#0d1117"
              stroke={color}
              strokeWidth="2"
            />
            <path
              d="M17 17 C17 15, 31 15, 31 17 L30 25 C30 28, 18 28, 18 25 Z"
              fill={color}
              fillOpacity="0.4"
            />
            <circle cx="24" cy="33" r="3" fill={color} fillOpacity="0.8" />
            <path d="M16 8 Q20 10 21 11" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            <path d="M32 8 Q28 10 27 11" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="41" x2="32" y2="41" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          // Overland 4x4 / SUV with Roof Gear (Rivian / Defender)
          <>
            <rect x="13" y="7" width="22" height="34" rx="5" fill="#0d1117" stroke={color} strokeWidth="2" />
            <rect x="16" y="18" width="16" height="18" rx="2" fill="#161b22" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <line x1="16" y1="23" x2="32" y2="23" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <line x1="16" y1="29" x2="32" y2="29" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <path d="M15 16 L33 16 L31 11 L17 11 Z" fill={color} fillOpacity="0.35" stroke={color} strokeWidth="1" />
            <line x1="18" y1="9" x2="30" y2="9" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="14" y="38" width="3.5" height="2" rx="0.5" fill="#ff3b30" />
            <rect x="30.5" y="38" width="3.5" height="2" rx="0.5" fill="#ff3b30" />
          </>
        )}
      </svg>
    </div>
  );
};
