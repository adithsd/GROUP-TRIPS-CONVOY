import { ConvoyMember, Destination } from '../types';
import { convoyService } from './convoyService';

class SimulationService {
  private isRunning: boolean = false;
  private intervalId: any = null;
  private simulatedMembers: ConvoyMember[] = [];
  private progressValues: number[] = [0.15, 0.30, 0.45]; // progress 0 to 1 along route

  public startSimulation(userLocation: { lat: number; lng: number }, destination: Destination, routePoints: { lat: number; lng: number }[]) {
    if (this.isRunning) return;
    this.isRunning = true;

    // Create 3 virtual friends
    const friendsData = [
      { name: 'Sarah Jenkins', vehicleModel: 'Tesla Model Y', vehicleColor: '#ef4444', avatar: '🏎️', progress: 0.12, speed: 68 },
      { name: 'Mike Ross', vehicleModel: 'Ford F-150', vehicleColor: '#3b82f6', avatar: '🚙', progress: 0.28, speed: 72 },
      { name: 'Priya Patel', vehicleModel: 'Subaru Outback', vehicleColor: '#10b981', avatar: '🚗', progress: 0.42, speed: 65 }
    ];

    this.simulatedMembers = friendsData.map((f, idx) => {
      const ptIdx = Math.min(Math.floor(f.progress * (routePoints.length || 1)), (routePoints.length || 1) - 1);
      const pt = routePoints[ptIdx] || userLocation;
      return {
        id: `sim_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        name: f.name,
        role: 'member' as const,
        vehicleModel: f.vehicleModel,
        vehicleColor: f.vehicleColor,
        avatar: f.avatar,
        lat: pt.lat,
        lng: pt.lng,
        speed: f.speed,
        heading: 45,
        lastUpdated: Date.now(),
        isSimulated: true
      };
    });

    this.progressValues = friendsData.map(f => f.progress);

    this.intervalId = setInterval(() => {
      if (!this.isRunning || routePoints.length === 0) return;

      this.simulatedMembers = this.simulatedMembers.map((member, idx) => {
        let prog = this.progressValues[idx] + 0.003 * (member.speed / 60);
        if (prog >= 0.98) {
          prog = 0.05; // loop back near start for continuous simulation demo
        }
        this.progressValues[idx] = prog;

        const targetIdx = Math.floor(prog * (routePoints.length - 1));
        const nextIdx = Math.min(targetIdx + 1, routePoints.length - 1);
        const currPt = routePoints[targetIdx] || userLocation;
        const nextPt = routePoints[nextIdx] || destination;

        // calculate heading
        const dLon = (nextPt.lng - currPt.lng);
        const y = Math.sin(dLon * Math.PI / 180) * Math.cos(nextPt.lat * Math.PI / 180);
        const x = Math.cos(currPt.lat * Math.PI / 180) * Math.sin(nextPt.lat * Math.PI / 180) -
                  Math.sin(currPt.lat * Math.PI / 180) * Math.cos(nextPt.lat * Math.PI / 180) * Math.cos(dLon * Math.PI / 180);
        let brng = Math.atan2(y, x) * 180 / Math.PI;
        brng = (brng + 360) % 360;

        // jitter speed slightly
        const newSpeed = Math.max(40, Math.min(85, member.speed + (Math.random() * 6 - 3)));

        return {
          ...member,
          lat: currPt.lat,
          lng: currPt.lng,
          speed: Math.round(newSpeed),
          heading: Math.round(brng),
          lastUpdated: Date.now()
        };
      });

      convoyService.updateSimulatedMembers(this.simulatedMembers);
    }, 2000);
  }

  public stopSimulation() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.simulatedMembers = [];
    convoyService.updateSimulatedMembers([]);
  }

  public getIsRunning() {
    return this.isRunning;
  }
}

export const simulationService = new SimulationService();
