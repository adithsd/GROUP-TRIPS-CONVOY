# Product Specification: ConvoySync (Real-Time Group Travel Overlay)

## 1. Executive Summary
**ConvoySync** is a lightweight, real-time convoy and group-travel web application that runs on top of Google Maps. Designed for groups of friends traveling to a shared destination in separate vehicles, it allows a "Host" to spin up a temporary "Party" (Convoy) and share an invite link/code. Once joined, all participants can view each other's live vehicle locations, current speeds, distances to the destination, and ETA relative to the group—all within a single, unified map interface.

## 2. Core User Roles & Flow
1. **The Host:**
   * Launches the app and clicks **"Create Convoy"**.
   * Sets a shared **Destination** (via Google Places Autocomplete) and enters their display name and vehicle icon/color.
   * Receives a unique **6-character Party Code** and a shareable deep link (e.g., `convoysync.app/join/X9K2P1`).
   * Can manage the convoy (kick inactive users, update the destination for everyone, or end the trip).
2. **The Guest (Party Member):**
   * Opens the shared link or enters the Party Code on the home screen.
   * Enters their display name, selects a vehicle avatar/color, and grants browser Geolocation permissions.
   * Immediately joins the live map session with the destination route pre-loaded.

## 3. Functional Requirements
### 3.1 Map & Routing Layer (Google Maps Platform)
* **Base Map:** Full-screen interactive Google Map (`@vis.gl/react-google-maps` or Google Maps JS API) with dark/navigation styling options.
* **Shared Destination & Route:** Renders the primary route polyline from each user's current position to the shared destination using the Google Maps Directions Service.
* **Custom Vehicle Markers:** Displays custom SVG/HTML markers for every active member in the party, showing:
  * User's Name & Avatar/Vehicle Type (Car, SUV, Bike, Van).
  * Color-coded ring for quick visual identification.
  * Smooth marker interpolation/rotation based on GPS heading (`coords.heading`).
* **Auto-Fit & Focus Modes:**
  * *"Fit All" Button:* Dynamically adjusts map bounds (`LatLngBounds`) so all convoy members and the destination stay in frame.
  * *"Follow Me" Mode:* Centers and zooms on the local user's vehicle.
  * *Tap-to-Focus:* Tapping a friend's avatar in the bottom drawer pans the map to their vehicle.

### 3.2 Real-Time Telemetry & Party State
* **Live Location Streaming:** Uses the browser's `navigator.geolocation.watchPosition()` API to broadcast latitude, longitude, heading, and speed every 3–5 seconds.
* **Backend Sync (Firebase Realtime Database / Firestore or Supabase):**
  * Stores `parties/{partyId}` containing `hostId`, `destination` (`lat`, `lng`, `address`), `createdAt`, and `status`.
  * Stores `parties/{partyId}/members/{userId}` with live coordinates, speed (km/h or mph), battery/signal status, and last-updated timestamp.
* **Convoy Roster Drawer (Bottom Sheet):**
  * Collapsible bottom sheet listing all active vehicles.
  * Displays each member's **Distance to Destination**, **Individual ETA**, and **Distance from You** (e.g., *"2.4 km behind you"*).
  * Quick status pings (e.g., *"Need fuel"*, *"Pit stop"*, *"Traffic ahead"*, *"On my way"*) that trigger a brief toast notification and badge over the sender's map pin.

### 3.3 Privacy & Lifecycle
* **Ephemeral Sessions:** Convoys automatically expire 12 hours after creation or immediately when the Host clicks **"End Trip"**.
* **Leave Anytime:** Guests can tap **"Leave Convoy"** to immediately stop broadcasting their GPS coordinates and wipe their session node.

## 4. Technical Architecture
* **Frontend:** React (Vite + TypeScript), Tailwind CSS, Lucide Icons.
* **Maps SDK:** Google Maps JavaScript API (`Places`, `Directions`, `Marker`/`AdvancedMarkerElement`, `Geometry`).
* **State & Real-Time Sync:** Firebase Realtime Database (ideal for low-latency GPS coordinate updates) + Anonymous Auth.
* **Simulation Mode (For Testing/Demo):** A built-in "Simulate Convoy" toggle that spawns 3–4 virtual friends moving along real Google Maps route polylines toward the destination so the app can be tested from a single desk.