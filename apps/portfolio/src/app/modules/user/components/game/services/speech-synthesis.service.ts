import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class SpeechSynthesisService {
  private platformId = inject(PLATFORM_ID);

  isSpeaking = signal<boolean>(false);
  isSupported = signal<boolean>(false);

  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (isPlatformBrowser(this.platformId) && 'speechSynthesis' in window) {
      this.isSupported.set(true);
      this.loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices(): void {
    if (!isPlatformBrowser(this.platformId) || !('speechSynthesis' in window)) {
      return;
    }
    this.availableVoices = window.speechSynthesis.getVoices();
  }

  /**
   * Speaks English clue text aloud with optimal speech rate and Indian/US English voice.
   */
  speak(text: string): void {
    if (!isPlatformBrowser(this.platformId) || !('speechSynthesis' in window)) {
      return;
    }

    // Cancel any previous utterance to prevent queue pile-up
    window.speechSynthesis.cancel();

    if (!text || !text.trim()) {
      this.isSpeaking.set(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick best English voice (prefer en-IN, then en-US, then any English)
    if (this.availableVoices.length > 0) {
      const preferred =
        this.availableVoices.find((v) => v.lang.startsWith('en-IN')) ||
        this.availableVoices.find((v) => v.lang.startsWith('en-US')) ||
        this.availableVoices.find((v) => v.lang.startsWith('en'));
      if (preferred) {
        utterance.voice = preferred;
      }
    }

    utterance.onstart = () => {
      this.isSpeaking.set(true);
    };

    utterance.onend = () => {
      this.isSpeaking.set(false);
    };

    utterance.onerror = () => {
      this.isSpeaking.set(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Cancels any active speech utterance immediately.
   */
  stop(): void {
    if (isPlatformBrowser(this.platformId) && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking.set(false);
    }
  }
}
