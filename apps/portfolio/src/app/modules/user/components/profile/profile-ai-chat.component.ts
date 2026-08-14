import { Component, inject, signal, computed, effect, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ProfileAiChatService } from './profile-ai-chat.service';
import { GeminiAiService } from './gemini-ai.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile-ai-chat',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './profile-ai-chat.component.html',
  styleUrl: './profile-ai-chat.component.scss',
})
export class ProfileAiChatComponent implements AfterViewInit {
  @Input() isEmbedded = false;

  // Inject services
  chatService = inject(ProfileAiChatService);
  geminiService = inject(GeminiAiService);
  authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  // Component state properties (mapped reactive-ly to service state signals)
  get chatHistory() {
    return this.chatService.messages();
  }

  get isLoading() {
    return this.chatService.isLoading();
  }

  get userInput() {
    return this.currentPrompt();
  }

  set userInput(value: string) {
    this.currentPrompt.set(value);
  }

  get errorMessage(): string | null {
    const messages = this.chatHistory;
    const lastMsg = messages[messages.length - 1];
    return (lastMsg && lastMsg.status === 'error') ? lastMsg.content : null;
  }

  // Local component signals
  currentPrompt = signal<string>('');

  // Selectors for UI scrolling & sizing control
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('promptTextarea') private promptTextarea!: ElementRef<HTMLTextAreaElement>;

  // Compute initials for the current logged-in user
  userInitials = computed<string>(() => {
    const user = this.authService.currentUser();
    if (!user) return 'U';
    const first = String(user['first_name'] || '').trim().charAt(0).toUpperCase();
    const last = String(user['last_name'] || '').trim().charAt(0).toUpperCase();
    if (first || last) {
      return `${first}${last}`;
    }
    return String(user.email || 'U').charAt(0).toUpperCase();
  });

  constructor() {
    // Reactive effect: automatically scroll container to bottom when messages or loading states update
    effect(() => {
      // Register signals to subscribe to updates
      this.chatService.messages();
      this.chatService.isLoading();

      // Trigger scroll delay to allow the DOM rendering cycle to finalize
      this.scheduleScroll();
    });
  }

  ngAfterViewInit() {
    this.scheduleScroll();
    this.adjustTextareaHeight();
  }

  private scheduleScroll() {
    setTimeout(() => {
      this.scrollToBottom();
    }, 60);
  }

  private scrollToBottom() {
    if (this.scrollContainer) {
      const element = this.scrollContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  // Handle auto-expanding prompt input
  onPromptInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.currentPrompt.set(target.value);
    this.adjustTextareaHeight();
  }

  adjustTextareaHeight() {
    if (this.promptTextarea) {
      const textarea = this.promptTextarea.nativeElement;
      textarea.style.height = 'auto';
      // Restrict minimum height to 38px, maximum to scrollHeight
      const newHeight = Math.max(38, textarea.scrollHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }

  // Handle keyboard submission (Enter), allowing manual newlines (Shift + Enter)
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  onSend() {
    const prompt = this.currentPrompt().trim();
    if (!prompt || this.chatService.isLoading()) return;

    // Dispatch message to service
    this.chatService.sendMessage(prompt);

    // Reset input fields
    this.currentPrompt.set('');
    setTimeout(() => {
      this.adjustTextareaHeight();
      if (this.promptTextarea) {
        this.promptTextarea.nativeElement.focus();
      }
    }, 0);
  }

  onClearChat() {
    this.chatService.clearChat();
    setTimeout(() => this.adjustTextareaHeight(), 0);
  }

  onRetry(messageId: string) {
    const messages = this.chatService.messages();
    const errorIdx = messages.findIndex(m => m.id === messageId);
    if (errorIdx > 0) {
      // Fetch user message preceding error node
      const precedingUserMsg = messages[errorIdx - 1];
      if (precedingUserMsg && precedingUserMsg.role === 'user') {
        this.chatService.retryMessage(precedingUserMsg.content);
      }
    }
  }

  // Safe markup sanitizer bypassing context filters for our parsed inputs
  sanitizeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
}
