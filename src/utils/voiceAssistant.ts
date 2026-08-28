// Voice Assistant & Speech Recognition Utility for Vishwajit's Engineering Lab

export interface VoiceCommandEventDetail {
  transcript: string;
  action?: string;
  target?: string | null;
  reply?: string;
  source: 'robot' | 'global';
}

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

class VoiceAssistantService {
  private recognition: any = null;
  private isListening = false;
  private isSpeaking = false;
  private speechMuted = false;
  private listeners: Set<(state: { isListening: boolean; transcript: string; reply: string; status: string }) => void> = new Set();
  private currentTranscript = '';
  private currentReply = '';
  private status = 'IDLE';

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      try {
        this.recognition = new SpeechRecognitionAPI();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.status = 'LISTENING';
          this.notify();
        };

        this.recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          this.currentTranscript = final || interim;
          this.notify();

          if (final) {
            this.handleFinalTranscript(final.trim());
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          this.isListening = false;
          if (event.error === 'not-allowed') {
            this.status = 'MIC_BLOCKED';
          } else {
            this.status = 'ERROR';
          }
          this.notify();
        };

        this.recognition.onend = () => {
          this.isListening = false;
          if (this.status === 'LISTENING') {
            this.status = 'IDLE';
          }
          this.notify();
        };
      } catch (err) {
        console.warn('SpeechRecognition initialization failed:', err);
      }
    } else {
      this.status = 'UNSUPPORTED';
    }
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public subscribe(callback: (state: { isListening: boolean; transcript: string; reply: string; status: string }) => void) {
    this.listeners.add(callback);
    callback({
      isListening: this.isListening,
      transcript: this.currentTranscript,
      reply: this.currentReply,
      status: this.status,
    });
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) =>
      cb({
        isListening: this.isListening,
        transcript: this.currentTranscript,
        reply: this.currentReply,
        status: this.status,
      })
    );
  }

  public startListening() {
    if (!this.recognition) {
      this.initSpeechRecognition();
    }
    if (!this.recognition) {
      this.status = 'UNSUPPORTED';
      this.notify();
      return;
    }

    try {
      this.currentTranscript = '';
      this.recognition.start();
    } catch (e) {
      // Already running or starting
      console.warn('Recognition start exception:', e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Recognition stop exception:', e);
      }
    }
  }

  public toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  public toggleMute(): boolean {
    this.speechMuted = !this.speechMuted;
    if (this.speechMuted && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    return this.speechMuted;
  }

  public isMuted(): boolean {
    return this.speechMuted;
  }

  public speak(text: string, onEnd?: () => void) {
    if (this.speechMuted || typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Cancel ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      // Pick high-tech natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel'))
      );
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
      };
      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis failed:', err);
      if (onEnd) onEnd();
    }
  }

  public async handleFinalTranscript(transcript: string, source: 'robot' | 'global' = 'global') {
    this.status = 'PROCESSING';
    this.notify();

    try {
      // Fetch response and action from full-stack endpoint (backed by OpenRouter / Gemini / Local)
      const res = await fetch('/api/voice-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcript,
          currentSection: window.location.hash.replace('#', '') || 'hero',
        }),
      });

      if (!res.ok) {
        throw new Error('API response not ok');
      }

      const data = await res.json();
      this.currentReply = data.reply || 'Command recognized.';
      this.status = 'RESPONDING';
      this.notify();

      // Dispatch global command event for 3D elements, Navigation, and Theme
      this.executeAction(data.action, data.target, transcript);

      // Speak reply out loud
      this.speak(this.currentReply, () => {
        this.status = 'IDLE';
        this.notify();
      });
    } catch (err) {
      console.warn('Voice command processing error:', err);
      // Fallback local execution
      this.executeLocalFallback(transcript);
    }
  }

  private executeAction(action?: string, target?: string | null, rawTranscript: string = '') {
    // Dispatch custom event for subscribers
    const event = new CustomEvent<VoiceCommandEventDetail>('portfolio:voice-command', {
      detail: {
        transcript: rawTranscript,
        action,
        target,
        reply: this.currentReply,
        source: 'global',
      },
    });
    window.dispatchEvent(event);

    if (action === 'navigate' && target) {
      const el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (action === 'open_resume') {
      const resumeBtn = document.getElementById('open-resume-btn') || document.getElementById('nav-resume-btn');
      if (resumeBtn) {
        resumeBtn.click();
      }
    } else if (action === 'open_certificate') {
      const certBtn = document.getElementById('open-cert-modal-header-btn') || document.getElementById('cert-card-cert-1');
      if (certBtn) {
        certBtn.click();
      }
    }
  }

  private executeLocalFallback(transcript: string) {
    const text = transcript.toLowerCase();
    let reply = `Executing command: ${transcript}`;

    if (text.includes('rotate') || text.includes('spin')) {
      reply = 'Toggling 3D model auto-rotation.';
      this.executeAction('robot_rotate', null, transcript);
    } else if (text.includes('exploded') || text.includes('explode')) {
      reply = 'Toggling 3D exploded view inspection.';
      this.executeAction('robot_explode', null, transcript);
    } else if (text.includes('reset')) {
      reply = 'Resetting robot joints and camera position.';
      this.executeAction('robot_reset', null, transcript);
    } else if (text.includes('certificate') || text.includes('certification') || text.includes('internship')) {
      reply = 'Opening official certificate credential and PDF viewer.';
      this.executeAction('open_certificate', null, transcript);
    } else if (text.includes('home')) {
      reply = 'Navigating to Home section.';
      this.executeAction('navigate', 'hero', transcript);
    } else if (text.includes('about')) {
      reply = 'Navigating to About section.';
      this.executeAction('navigate', 'about', transcript);
    } else if (text.includes('robot')) {
      reply = 'Navigating to 3D Robot Project.';
      this.executeAction('navigate', 'robot-project', transcript);
    } else if (text.includes('resume')) {
      reply = 'Opening printable resume document.';
      this.executeAction('open_resume', null, transcript);
    } else if (text.includes('good morning')) {
      reply = 'Good morning! Vishwajit Laxman Pawar\'s 3D Engineering Laboratory is online.';
      this.executeAction('none', null, transcript);
    }

    this.currentReply = reply;
    this.status = 'RESPONDING';
    this.notify();
    this.speak(reply, () => {
      this.status = 'IDLE';
      this.notify();
    });
  }
}

export const voiceAssistant = new VoiceAssistantService();
