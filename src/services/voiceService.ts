import { VoiceMessage } from '../types';
import { soundService } from './soundService';

class VoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording: boolean = false;
  private recordStartTime: number = 0;
  private stream: MediaStream | null = null;
  private onVoiceCallback: ((msg: VoiceMessage) => void) | null = null;

  public setVoiceListener(cb: (msg: VoiceMessage) => void) {
    this.onVoiceCallback = cb;
  }

  public async startRecording(): Promise<boolean> {
    if (this.isRecording) return true;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('MediaDevices not supported in this browser');
        return false;
      }

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.recordStartTime = Date.now();
      this.mediaRecorder.start();
      this.isRecording = true;
      soundService.playSquelchBurst();
      return true;
    } catch (err) {
      console.warn('Microphone permission denied or unavailable:', err);
      return false;
    }
  }

  public stopRecording(senderId: string, senderName: string): Promise<VoiceMessage | null> {
    return new Promise((resolve) => {
      if (!this.isRecording || !this.mediaRecorder) {
        this.isRecording = false;
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const durationMs = Date.now() - this.recordStartTime;

        // Clean up tracks
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }

        // Convert blob to base64 data url
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          const voiceMsg: VoiceMessage = {
            id: 'voice_' + Math.random().toString(36).substring(2, 9),
            senderId,
            senderName,
            audioDataUrl: base64Audio,
            durationMs,
            timestamp: Date.now()
          };
          this.isRecording = false;
          soundService.playRogerBeep();
          resolve(voiceMsg);
        };
        reader.readAsDataURL(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  // Play incoming voice clip with authentic CB radio squelch and roger tone
  public playVoiceMessage(msg: VoiceMessage) {
    if (soundService.getIsMuted()) return;
    try {
      soundService.playSquelchBurst();
      setTimeout(() => {
        const audio = new Audio(msg.audioDataUrl);
        audio.onended = () => {
          soundService.playRogerBeep();
        };
        audio.play().catch((e) => console.warn('Audio play blocked:', e));
      }, 120);
    } catch (e) {
      console.warn('Voice playback error:', e);
    }
  }

  // Generate a simulated radio voice transmission for testing
  public generateSimulatedVoice(senderName: string, text: string): VoiceMessage {
    // Generate text-to-speech audio via Web Speech API synthesizer if supported
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      soundService.playSquelchBurst();
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        utterance.onend = () => {
          soundService.playRogerBeep();
        };
        window.speechSynthesis.speak(utterance);
      }, 100);
    } else {
      soundService.playSquelchBurst();
      setTimeout(() => soundService.playRogerBeep(), 800);
    }

    return {
      id: 'voice_sim_' + Math.random().toString(36).substring(2, 8),
      senderId: 'sim_member',
      senderName,
      audioDataUrl: '',
      durationMs: 3500,
      timestamp: Date.now()
    };
  }
}

export const voiceService = new VoiceService();
