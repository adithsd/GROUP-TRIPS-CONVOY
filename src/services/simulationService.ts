import { ConvoyMember, Destination } from '../types';
import { convoyService } from './convoyService';

class SimulationService {
  private isRunning: boolean = false;
  private intervalId: any = null;
  private pingIntervalId: any = null;
  private simulatedMembers: ConvoyMember[] = [];
  private progressValues: number[] = [0.15, 0.30, 0.45];

  public startSimulation(
    userLocation: { lat: number; lng: number }, 
    destination: Destination, 
    routePoints: { lat: number; lng: number }[],
    isTrek: boolean = false
  ) {
    if (this.isRunning) return;
    this.isRunning = true;

    // Vehicle squad vs Wilderness Trek squad
    const friendsData = isTrek ? [
      { 
        name: 'Marcus Cole', 
        callsign: 'LEAD SCOUT',
        vehicleModel: 'Black Diamond Trail Rig', 
        vehicleType: 'hiker' as const,
        vehicleColor: '#ffaa00', 
        avatar: '🥾', 
        progress: 0.36, 
        speed: 4.8,
        battery: 92,
        elevation: 2680
      },
      { 
        name: 'Elena Rostova', 
        callsign: 'NAVIGATOR',
        vehicleModel: 'Osprey 65L Expedition', 
        vehicleType: 'backpacker' as const,
        vehicleColor: '#10b981', 
        avatar: '🎒', 
        progress: 0.22, 
        speed: 4.4,
        battery: 88,
        elevation: 2650
      },
      { 
        name: 'Samira Khan', 
        callsign: 'SWEEP GUARD',
        vehicleModel: 'Deuter Aircontact Pro', 
        vehicleType: 'hiker' as const,
        vehicleColor: '#ef4444', 
        avatar: '🏔️', 
        progress: 0.10, 
        speed: 4.0,
        battery: 79,
        elevation: 2610
      }
    ] : [
      { 
        name: 'Sarah Jenkins', 
        callsign: 'PACESETTER',
        vehicleModel: 'Porsche Taycan Cross', 
        vehicleType: 'sport' as const,
        vehicleColor: '#10b981', 
        avatar: '⚡', 
        progress: 0.38, 
        speed: 74,
        battery: 84,
        elevation: undefined
      },
      { 
        name: 'Mike Ross', 
        callsign: 'WARHORSE',
        vehicleModel: 'Ford F-150 Lightning', 
        vehicleType: 'truck' as const,
        vehicleColor: '#ffaa00', 
        avatar: '🛻', 
        progress: 0.24, 
        speed: 68,
        battery: 72,
        elevation: undefined
      },
      { 
        name: 'Priya Patel', 
        callsign: 'SWEEPER-1',
        vehicleModel: 'Rivian R1S Overland', 
        vehicleType: 'suv' as const,
        vehicleColor: '#f59e0b', 
        avatar: '🏔️', 
        progress: 0.12, 
        speed: 66,
        battery: 91,
        elevation: undefined
      }
    ];

    this.simulatedMembers = friendsData.map((f, idx) => {
      const ptIdx = Math.min(Math.floor(f.progress * (routePoints.length || 1)), Math.max(0, (routePoints.length || 1) - 1));
      const pt = routePoints[ptIdx] || userLocation;
      return {
        id: `sim_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        name: f.name,
        role: 'member' as const,
        vehicleModel: f.vehicleModel,
        vehicleType: f.vehicleType,
        vehicleColor: f.vehicleColor,
        avatar: f.avatar,
        lat: pt.lat,
        lng: pt.lng,
        speed: f.speed,
        heading: 48,
        elevationMeters: f.elevation,
        batteryLevel: f.battery,
        lastUpdated: Date.now(),
        isSimulated: true
      };
    });

    this.progressValues = friendsData.map(f => f.progress);

    // Initial sync
    convoyService.updateSimulatedMembers(this.simulatedMembers);

    // Movement engine tick every 1.5s
    this.intervalId = setInterval(() => {
      if (!this.isRunning || routePoints.length === 0) return;

      this.simulatedMembers = this.simulatedMembers.map((member, idx) => {
        // Step progress scaled to walking vs driving
        const stepRate = isTrek ? 0.0008 * (member.speed / 4) : 0.0035 * (member.speed / 60);
        let prog = this.progressValues[idx] + stepRate;
        if (prog >= 0.98) {
          prog = 0.04;
        }
        this.progressValues[idx] = prog;

        const targetIdx = Math.floor(prog * (routePoints.length - 1));
        const nextIdx = Math.min(targetIdx + 1, routePoints.length - 1);
        const currPt = routePoints[targetIdx] || userLocation;
        const nextPt = routePoints[nextIdx] || destination;

        // Calculate movement bearing
        const dLon = (nextPt.lng - currPt.lng);
        const y = Math.sin(dLon * Math.PI / 180) * Math.cos(nextPt.lat * Math.PI / 180);
        const x = Math.cos(currPt.lat * Math.PI / 180) * Math.sin(nextPt.lat * Math.PI / 180) -
                  Math.sin(currPt.lat * Math.PI / 180) * Math.cos(nextPt.lat * Math.PI / 180) * Math.cos(dLon * Math.PI / 180);
        let brng = Math.atan2(y, x) * 180 / Math.PI;
        brng = (brng + 360) % 360;

        // Dynamic speed variations
        const speedJitter = isTrek 
          ? Math.max(3.6, Math.min(5.4, member.speed + (Math.random() * 0.4 - 0.2)))
          : Math.max(50, Math.min(84, member.speed + (Math.random() * 4 - 2)));

        return {
          ...member,
          lat: currPt.lat,
          lng: currPt.lng,
          speed: isTrek ? Number(speedJitter.toFixed(1)) : Math.round(speedJitter),
          heading: Math.round(brng),
          elevationMeters: member.elevationMeters ? member.elevationMeters + Math.round(Math.random() * 4 - 1) : undefined,
          batteryLevel: Math.max(15, (member.batteryLevel ?? 80) - (Math.random() > 0.85 ? 1 : 0)),
          lastUpdated: Date.now()
        };
      });

      convoyService.updateSimulatedMembers(this.simulatedMembers);
    }, 1500);

    // Occasional simulated radio chitchat / status pings
    const samplePings: { type: 'fuel' | 'pit_stop' | 'traffic' | 'hazard' | 'all_good' | 'regroup' | 'water' | 'camp'; msg: string; driver: string }[] = isTrek ? [
      { type: 'all_good', msg: 'Trail is marked and clear. Approaching Half Dome shoulder.', driver: 'Marcus Cole' },
      { type: 'water', msg: 'Fresh mountain water spring verified at switchback 12.', driver: 'Elena Rostova' },
      { type: 'hazard', msg: 'Loose granite gravel on the ridgeline, watch your footing.', driver: 'Samira Khan' },
      { type: 'pit_stop', msg: 'Quick 5-minute pack adjustment at the overlook.', driver: 'Marcus Cole' },
      { type: 'all_good', msg: 'Pacing is steady at 4.4 km/h. Sweep is keeping contact.', driver: 'Samira Khan' }
    ] : [
      { type: 'all_good', msg: 'Road is wide open ahead. Holding formation at 72 km/h.', driver: 'Sarah Jenkins' },
      { type: 'traffic', msg: 'Minor brake check in the fast lane, road construction in 3km.', driver: 'Mike Ross' },
      { type: 'pit_stop', msg: 'Scenic vista overlook coming up on the right shoulder.', driver: 'Priya Patel' },
      { type: 'all_good', msg: 'Radio net clear. All rigs within visual contact.', driver: 'Sarah Jenkins' },
      { type: 'fuel', msg: 'Supercharger station in 18 km, battery at 68%.', driver: 'Mike Ross' }
    ];

    let pingIndex = 0;
    this.pingIntervalId = setInterval(() => {
      if (!this.isRunning) return;
      const sample = samplePings[pingIndex % samplePings.length];
      pingIndex++;
      convoyService.sendStatusPing(sample.type as any, sample.msg, sample.driver);
    }, 22000);
  }

  public stopSimulation() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
    this.simulatedMembers = [];
    convoyService.updateSimulatedMembers([]);
  }

  public getIsRunning() {
    return this.isRunning;
  }
}

export const simulationService = new SimulationService();
