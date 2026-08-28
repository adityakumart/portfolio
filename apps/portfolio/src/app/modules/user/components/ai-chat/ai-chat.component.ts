import { Component, inject, signal, computed, effect, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AiChatService } from '../../services/ai-chat.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './ai-chat.component.html',
  styleUrl: './ai-chat.component.scss',
})
export class AiChatComponent implements OnInit, AfterViewInit {
  // Inject services
  chatService = inject(AiChatService);
  authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  // Component state (bound to service signals)
  chats = computed(() => this.chatService.chats());
  messages = computed(() => this.chatService.messages());
  activeChatId = computed(() => this.chatService.activeChatId());
  isStreaming = computed(() => this.chatService.isStreaming());

  activeChat = computed(() => {
    const id = this.activeChatId();
    if (!id) return null;
    return this.chats().find(c => c.id === id) || null;
  });

  // Local state signals
  currentPrompt = signal<string>('');
  isSidebarOpen = signal<boolean>(true);

  // Selectors for viewport and textarea auto-sizing
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('promptTextarea') private promptTextarea!: ElementRef<HTMLTextAreaElement>;

  // User details
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
    // Automatically scroll down when message log updates or streaming state shifts
    effect(() => {
      this.chatService.messages();
      this.chatService.isStreaming();
      this.scheduleScroll();
    });
  }

  ngOnInit() {
    // Load historical chats on load
    this.chatService.loadChats();
  }

  ngAfterViewInit() {
    this.scheduleScroll();
    this.adjustTextareaHeight();
  }

  // Scroll tracking helpers
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

  // Toggle Sidebar on mobile/desktop
  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  // Auto expanding input panel
  onPromptInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.currentPrompt.set(target.value);
    this.adjustTextareaHeight();
  }

  adjustTextareaHeight() {
    if (this.promptTextarea) {
      const textarea = this.promptTextarea.nativeElement;
      textarea.style.height = 'auto';
      // Restrict minimum height to 44px, maximum height to scrollHeight
      const newHeight = Math.max(44, textarea.scrollHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }

  // Handle keyboard submissions on Enter (Shift+Enter inserts new lines)
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  // Send message
  onSend() {
    const prompt = this.currentPrompt().trim();
    if (!prompt || this.isStreaming()) return;

    // Dispatch prompt
    this.chatService.sendMessage(prompt);

    // Reset prompt fields
    this.currentPrompt.set('');
    if (this.promptTextarea) {
      this.promptTextarea.nativeElement.value = '';
    }
    
    setTimeout(() => {
      this.adjustTextareaHeight();
      if (this.promptTextarea) {
        this.promptTextarea.nativeElement.focus();
      }
    }, 0);
  }

  // Select historical chat
  onSelectChat(chatId: string | undefined) {
    if (!chatId) return;
    this.chatService.selectChat(chatId);
    // On small screen mobile layout, auto-collapse sidebar on chat click
    if (window.innerWidth <= 768) {
      this.isSidebarOpen.set(false);
    }
  }

  // New Chat action
  onNewChat() {
    this.chatService.selectChat(null);
    this.currentPrompt.set('');
    if (this.promptTextarea) {
      this.promptTextarea.nativeElement.value = '';
    }
    setTimeout(() => this.adjustTextareaHeight(), 0);
  }

  // Suggestion chip helper
  useSuggestion(suggestion: string) {
    this.currentPrompt.set(suggestion);
    if (this.promptTextarea) {
      this.promptTextarea.nativeElement.value = suggestion;
      this.promptTextarea.nativeElement.focus();
    }
    setTimeout(() => this.adjustTextareaHeight(), 0);
  }

  // Format response text with HTML tags according to user instructions
  formatMessage(text: string): string {
    if (!text) return '';

    let html = text;

    // 1. Escape HTML special characters to prevent XSS before parsing markdown tags
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 2. Block code: ```lang\ncode\n``` -> <pre><code>code</code></pre>
    html = html.replace(/```(?:[a-zA-Z0-9]+)?\n?([\s\S]*?)\n?```/g, '<pre><code>$1</code></pre>');

    // 3. Headings:
    html = html.replace(/(?:^|\n)####\s+([^\n]+)/g, '\n<h4>$1</h4>');
    html = html.replace(/(?:^|\n)###\s+([^\n]+)/g, '\n<h3>$1</h3>');

    // 4. Bold: **text** -> <strong>text</strong>
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 5. Inline Code: `text` -> <code class="inline-code">text</code>
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // 6. Convert newlines to <br>
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  sanitizeHtml(text: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.formatMessage(text));
  }

  // Copy chat content to clipboard
  copyToClipboard(text: string) {
    if (!text) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy text:', err);
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textarea);
    }
  }

  // Retry sending a failed prompt
  onRetry(prompt: string, errorIndex: number) {
    if (this.isStreaming()) return;

    // Clear the error bubble and the corresponding user prompt
    this.chatService.messages.update((prev) => {
      const updated = [...prev];
      if (updated[errorIndex]) {
        updated.splice(errorIndex, 1);
      }
      if (updated[errorIndex - 1]) {
        updated.splice(errorIndex - 1, 1);
      }
      return updated;
    });

    // Resend
    this.chatService.sendMessage(prompt);
  }
}
