# ConvoyPulse 🛰️🏔️
### Real-Time Overland Convoy & Backcountry Trek Telemetry WebApp

ConvoyPulse is a tactical, real-time group road trip and wilderness trek telemetry application built with React, Vite, TypeScript, and Google Maps Platform. It replaces chaotic group texts with a unified 3D cockpit HUD featuring multi-vehicle radar formation, push-to-talk voice radio, customizable regroup point auto-finding, and GPX/KML expedition logging.

---

## ⚡ Key Capabilities

### 1. 🗺️ Tactical Google Maps Cockpit
- **Night-Rally Stealth Styling**: High-contrast, dark-mode automotive navigation designed for high legibility day or night.
- **Top-Down 3D Rigs**: Dynamic heading-oriented SVG vehicle rigs (Overland SUV, Heavy Truck, GT Sport Sedan) and Backpacker models with real-time 360° heading rotation.
- **Formation Radar**: Real-time corridor headway tracker computing lead/sweep distance, relative spacing, and convoy order.
- **"Fit All Squad" & "Center on Me"**: One-click Google Maps `LatLngBounds` auto-framing.

### 2. 📡 Customizable Regroup Point Auto-Finder
- **Adjustable Separation Distance Threshold**: Customize the allowable separation gap between lead and sweep rigs (from 0.3 km up to 15.0 km) with instant presets (`0.5 km`, `1.0 km`, `1.5 km`, `2.5 km`, `5.0 km`, `10.0 km`).
- **Corridor POI Auto-Finder**: Automatically detects and suggests upcoming waypoints ahead (Superchargers, Highway Travel Plazas, Scenic Viewpoints, Alpine Springs).
- **Rendezvous Lock**: One-click locks a regroup waypoint, broadcasting an animated 3D Regroup Beacon across all convoy devices.
- **Headway Gap Alerts**: Triggers tactical warnings if separation between vehicles exceeds your custom threshold.

### 3. 🎙️ Push-To-Talk (PTT) CB Radio Walkie-Talkie
- **Audio Synthesizer**: Realistic Web Audio bandpass CB static squelch bursts and Apollo/CB 2.475 kHz Quindar roger beeps.
- **Dual Input Modes**: Hold the **Spacebar** or the 3D **Hold To Talk** button to broadcast recorded audio across the convoy.
- **Audio Spectrum Visualizer**: Live frequency spectrum visualizer and squelch status filter.
- **Tactical Quick Callouts**: One-tap pre-recorded squad callouts with Web Speech synthesis fallback.

### 4. ⚡ Convoy Fuel & EV Battery Range Sync
- Real-time battery percentage and estimated fuel range (km) displayed for all squad members.
- **Range Bottleneck Detection**: Automatically identifies the vehicle with the lowest remaining range (*"RANGE BOTTLENECK: Mike (140 km)"*) so the group can plan timely stops.

### 5. ⛅ Micro-Climate & Mountain Pass Weather HUD
- Real-time meteorological telemetry based on current GPS / route coordinates:
  - Temperature (°C) & condition (*Clear*, *Mountain Fog*, *High Winds*, *Rain*, *Snow Squall*).
  - Crosswind velocity & compass direction (e.g. `NW 32 km/h`).
  - Line-of-sight visibility distance in km.
  - Active high-altitude pass warnings and viaduct crosswind alerts.

### 6. 🥾 Wilderness Trek Mode (Backcountry Hiking)
- Dedicated mode for mountain hiking squads (e.g. Yosemite Half Dome cables route).
- Telemetry adapts to hiker pacing (`3.5 – 5.5 km/h`), altimeter elevation tracking (`m`), and trail-specific status pings (*Water Spring*, *Campsite Rest*, *Steep Scramble / SOS*).
- Switches radio to Alpine Pack Radio Net (`CH-07 146.520 MHz`).

### 7. 🏆 Expedition Debrief with GPX & KML 3D Export
- Comprehensive trip metrics dashboard tracking distance, duration, top speed, average pacing, elevation gained, and waypoints.
- **Export GPX Track**: Compatible with Garmin, Strava, Gaia GPS, and Wahoo.
- **Export KML 3D Flightpath**: 3D extruded vector route ready for Google Earth 3D flyovers.

### 8. 📡 Off-Grid Dead-Reckoning
- Extrapolates position based on heading and last recorded speed when cellular reception drops in remote canyons or mountain passes.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite 5
- **Styling**: Tailwind CSS v4 with custom 3D tactile skeuomorphic styling (`.cockpit-panel-3d`, `.btn-tactile`, `.digital-recessed`)
- **Maps**: Google Maps Platform via `@vis.gl/react-google-maps`
- **Real-Time Mesh**: `BroadcastChannel` & `localStorage` cross-tab/cross-device synchronization
- **Audio**: Web Audio API (white noise squelch synthesizer, Quindar tone generator) & Web Speech Synthesis

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Google Maps Platform API Key (with Maps JavaScript API and Directions API enabled)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/adithsd/ConvoyPulse.git
   cd ConvoyPulse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Google Maps API key in `.env`:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 📜 License
MIT License. Created with Google Antigravity & Google Maps Platform.
