import { ConvoyMember, ConvoyParty, StatusPingEvent, Destination, RegroupPoint, VoiceMessage } from '../types';
import { soundService } from './soundService';
import { voiceService } from './voiceService';

const CHANNEL_NAME = 'convoy_pulse_sync_channel_v1';
const STORAGE_PREFIX = 'convoy_pulse_';

class ConvoyService {
  private channel: BroadcastChannel | null = null;
  private listeners: ((state: { party: ConvoyParty | null; members: ConvoyMember[]; pings: StatusPingEvent[] }) => void)[] = [];
  
  private currentPartyId: string | null = null;
  private currentUser: ConvoyMember | null = null;
  
  constructor() {
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data && event.data.type === 'STATE_SYNC') {
            this.notifyListeners();
          } else if (event.data && event.data.type === 'STATUS_PING') {
            soundService.playRogerBeep();
            this.notifyListeners();
          } else if (event.data && event.data.type === 'VOICE_MESSAGE') {
            if (event.data.voiceMsg && event.data.voiceMsg.senderId !== this.currentUser?.id) {
              voiceService.playVoiceMessage(event.data.voiceMsg);
            }
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported:', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith(STORAGE_PREFIX)) {
          this.notifyListeners();
        }
      });
    }
  }

  public subscribe(callback: (state: { party: ConvoyParty | null; members: ConvoyMember[]; pings: StatusPingEvent[] }) => void) {
    this.listeners.push(callback);
    callback(this.getState());
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(cb => cb(state));
  }

  private broadcast(ping?: boolean) {
    if (this.channel) {
      this.channel.postMessage({ 
        type: ping ? 'STATUS_PING' : 'STATE_SYNC', 
        partyId: this.currentPartyId 
      });
    }
  }

  public getState() {
    if (!this.currentPartyId) {
      return { party: null, members: [], pings: [] };
    }
    const partyJson = localStorage.getItem(`${STORAGE_PREFIX}party_${this.currentPartyId}`);
    const membersJson = localStorage.getItem(`${STORAGE_PREFIX}members_${this.currentPartyId}`);
    const pingsJson = localStorage.getItem(`${STORAGE_PREFIX}pings_${this.currentPartyId}`);

    const party: ConvoyParty | null = partyJson ? JSON.parse(partyJson) : null;
    const members: ConvoyMember[] = membersJson ? JSON.parse(membersJson) : [];
    const pings: StatusPingEvent[] = pingsJson ? JSON.parse(pingsJson) : [];

    return { party, members, pings };
  }

  public createParty(hostUser: Omit<ConvoyMember, 'id'>, destination: Destination, routePoints?: { lat: number; lng: number }[]): { party: ConvoyParty; user: ConvoyMember } {
    const partyId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const userId = 'user_' + Math.random().toString(36).substring(2, 9);
    
    const user: ConvoyMember = {
      ...hostUser,
      id: userId,
      role: 'host',
      batteryLevel: hostUser.batteryLevel ?? 88,
      fuelRangeKm: hostUser.fuelRangeKm ?? 320,
      fuelType: hostUser.fuelType ?? 'ev',
      lastUpdated: Date.now()
    };

    const party: ConvoyParty = {
      partyId,
      hostId: userId,
      destination,
      routePoints: routePoints || [],
      radioChannel: 'CH-19 (146.520 MHz)',
      regroupThresholdKm: 2.5, // Default threshold customizable by user
      activeRegroupPoint: null,
      createdAt: Date.now(),
      isActive: true
    };

    this.currentPartyId = partyId;
    this.currentUser = user;

    localStorage.setItem(`${STORAGE_PREFIX}party_${partyId}`, JSON.stringify(party));
    localStorage.setItem(`${STORAGE_PREFIX}members_${partyId}`, JSON.stringify([user]));
    localStorage.setItem(`${STORAGE_PREFIX}pings_${partyId}`, JSON.stringify([]));

    soundService.playRogerBeep();
    this.broadcast();
    return { party, user };
  }

  public joinParty(partyId: string, memberInfo: Omit<ConvoyMember, 'id' | 'role'>): { party: ConvoyParty; user: ConvoyMember } | null {
    const partyJson = localStorage.getItem(`${STORAGE_PREFIX}party_${partyId}`);
    if (!partyJson) return null;

    const party: ConvoyParty = JSON.parse(partyJson);
    const userId = 'user_' + Math.random().toString(36).substring(2, 9);

    const user: ConvoyMember = {
      ...memberInfo,
      id: userId,
      role: 'member',
      batteryLevel: memberInfo.batteryLevel ?? 85,
      fuelRangeKm: memberInfo.fuelRangeKm ?? 290,
      fuelType: memberInfo.fuelType ?? 'ev',
      lastUpdated: Date.now()
    };

    this.currentPartyId = partyId;
    this.currentUser = user;

    const membersJson = localStorage.getItem(`${STORAGE_PREFIX}members_${partyId}`);
    const members: ConvoyMember[] = membersJson ? JSON.parse(membersJson) : [];

    const filtered = members.filter(m => m.name !== user.name);
    filtered.push(user);

    localStorage.setItem(`${STORAGE_PREFIX}members_${partyId}`, JSON.stringify(filtered));

    soundService.playRogerBeep();
    this.broadcast();
    return { party, user };
  }

  public updateLocation(lat: number, lng: number, speed: number, heading: number, distanceToDest?: number, etaString?: string, relativeDistText?: string) {
    if (!this.currentPartyId || !this.currentUser) return;

    this.currentUser.lat = lat;
    this.currentUser.lng = lng;
    this.currentUser.speed = speed;
    this.currentUser.heading = heading;
    if (distanceToDest !== undefined) this.currentUser.distanceToDestKm = distanceToDest;
    if (etaString !== undefined) this.currentUser.etaString = etaString;
    if (relativeDistText !== undefined) this.currentUser.relativeDistText = relativeDistText;
    this.currentUser.lastUpdated = Date.now();

    const membersJson = localStorage.getItem(`${STORAGE_PREFIX}members_${this.currentPartyId}`);
    if (!membersJson) return;

    const members: ConvoyMember[] = JSON.parse(membersJson);
    const idx = members.findIndex(m => m.id === this.currentUser?.id);
    if (idx >= 0) {
      members[idx] = this.currentUser;
    } else {
      members.push(this.currentUser);
    }

    localStorage.setItem(`${STORAGE_PREFIX}members_${this.currentPartyId}`, JSON.stringify(members));
    this.broadcast();
  }

  public updateFuelAndBattery(batteryPercent: number, rangeKm: number) {
    if (!this.currentPartyId || !this.currentUser) return;
    this.currentUser.batteryLevel = batteryPercent;
    this.currentUser.fuelRangeKm = rangeKm;

    const membersJson = localStorage.getItem(`${STORAGE_PREFIX}members_${this.currentPartyId}`);
    if (!membersJson) return;

    const members: ConvoyMember[] = JSON.parse(membersJson);
    const idx = members.findIndex(m => m.id === this.currentUser?.id);
    if (idx >= 0) {
      members[idx] = this.currentUser;
      localStorage.setItem(`${STORAGE_PREFIX}members_${this.currentPartyId}`, JSON.stringify(members));
      this.broadcast();
    }
  }

  public setRegroupThreshold(thresholdKm: number) {
    if (!this.currentPartyId) return;
    const partyJson = localStorage.getItem(`${STORAGE_PREFIX}party_${this.currentPartyId}`);
    if (!partyJson) return;

    const party: ConvoyParty = JSON.parse(partyJson);
    party.regroupThresholdKm = thresholdKm;
    localStorage.setItem(`${STORAGE_PREFIX}party_${this.currentPartyId}`, JSON.stringify(party));
    this.broadcast();
  }

  public setRegroupPoint(point: RegroupPoint | null) {
    if (!this.currentPartyId) return;
    const partyJson = localStorage.getItem(`${STORAGE_PREFIX}party_${this.currentPartyId}`);
    if (!partyJson) return;

    const party: ConvoyParty = JSON.parse(partyJson);
    party.activeRegroupPoint = point;
    localStorage.setItem(`${STORAGE_PREFIX}party_${this.currentPartyId}`, JSON.stringify(party));

    if (point) {
      this.sendStatusPing('regroup', `REGROUP LOCK: ${point.name} in ${point.distanceAheadKm} km`);
    } else {
      this.broadcast();
    }
  }

  public broadcastVoiceMessage(voiceMsg: VoiceMessage) {
    if (this.channel) {
      this.channel.postMessage({
        type: 'VOICE_MESSAGE',
        partyId: this.currentPartyId,
        voiceMsg
      });
    }
  }

  public updateRoutePoints(points: { lat: number; lng: number }[]) {
    if (!this.currentPartyId) return;
    const partyJson = localStorage.getItem(`${STORAGE_PREFIX}party_${this.currentPartyId}`);
    if (!partyJson) return;

    const party: ConvoyParty = JSON.parse(partyJson);
    party.routePoints = points;
    localStorage.setItem(`${STORAGE_PREFIX}party_${this.currentPartyId}`, JSON.stringify(party));
    this.broadcast();
  }

  public sendStatusPing(type: 'fuel' | 'pit_stop' | 'traffic' | 'hazard' | 'all_good' | 'regroup' | 'water' | 'camp', message: string, senderName?: string) {
    if (!this.currentPartyId) return;

    if (type === 'hazard') {
      soundService.playHazardAlert();
    } else {
      soundService.playRogerBeep();
    }

    const memberName = senderName || this.currentUser?.name || 'Driver';
    const memberId = this.currentUser?.id || 'sender';

    if (this.currentUser) {
      this.currentUser.activeStatus = type;
      this.currentUser.statusTime = Date.now();
    }

    const membersJson = localStorage.getItem(`${STORAGE_PREFIX}members_${this.currentPartyId}`);
    if (membersJson) {
      const members: ConvoyMember[] = JSON.parse(membersJson);
      const idx = members.findIndex(m => m.name === memberName || m.id === memberId);
      if (idx >= 0) {
        members[idx].activeStatus = type;
        members[idx].statusTime = Date.now();
        localStorage.setItem(`${STORAGE_PREFIX}members_${this.currentPartyId}`, JSON.stringify(members));
      }
    }

    const pingsJson = localStorage.getItem(`${STORAGE_PREFIX}pings_${this.currentPartyId}`);
    const pings: StatusPingEvent[] = pingsJson ? JSON.parse(pingsJson) : [];
    
    const newPing: StatusPingEvent = {
      id: 'ping_' + Math.random().toString(36).substring(2, 9),
      memberId,
      memberName,
      type,
      message,
      timestamp: Date.now()
    };

    pings.unshift(newPing);
    if (pings.length > 25) pings.pop();

    localStorage.setItem(`${STORAGE_PREFIX}pings_${this.currentPartyId}`, JSON.stringify(pings));
    this.broadcast(true);
  }

  public updateSimulatedMembers(simulatedMembers: ConvoyMember[]) {
    if (!this.currentPartyId) return;
    const membersJson = localStorage.getItem(`${STORAGE_PREFIX}members_${this.currentPartyId}`);
    if (!membersJson) return;

    const members: ConvoyMember[] = JSON.parse(membersJson);
    const nonSimulated = members.filter(m => !m.isSimulated && m.id !== this.currentUser?.id);
    const updated = [
      ...(this.currentUser ? [this.currentUser] : []),
      ...nonSimulated,
      ...simulatedMembers
    ];

    localStorage.setItem(`${STORAGE_PREFIX}members_${this.currentPartyId}`, JSON.stringify(updated));
    this.broadcast();
  }

  public leaveParty() {
    if (!this.currentPartyId || !this.currentUser) return;
    const membersJson = localStorage.getItem(`${STORAGE_PREFIX}members_${this.currentPartyId}`);
    if (membersJson) {
      const members: ConvoyMember[] = JSON.parse(membersJson);
      const filtered = members.filter(m => m.id !== this.currentUser?.id);
      localStorage.setItem(`${STORAGE_PREFIX}members_${this.currentPartyId}`, JSON.stringify(filtered));
    }
    this.currentPartyId = null;
    this.currentUser = null;
    this.broadcast();
  }

  public getCurrentUser() {
    return this.currentUser;
  }

  public getCurrentPartyId() {
    return this.currentPartyId;
  }
}

export const convoyService = new ConvoyService();
