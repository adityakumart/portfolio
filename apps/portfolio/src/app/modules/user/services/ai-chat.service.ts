import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth';
import { environment } from '../../../../environments/environment';

import { IChat as Chat, IMessage as Message } from '@portfolio/shared-types';

@Injectable({
  providedIn: 'root',
})
export class AiChatService {
  private authService = inject(AuthService);
  private apiUrl = environment.APIURL;

  // Signal State Strategy
  activeChatId = signal<string | null>(null);
  chats = signal<Chat[]>([]);
  messages = signal<Message[]>([]);
  isStreaming = signal<boolean>(false);

  // Fetch all historical chats
  async loadChats(): Promise<void> {
    const token = this.authService.getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${this.apiUrl}/chat/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        this.chats.set(data);
      } else {
        console.error('Failed to load chats:', response.statusText);
      }
    } catch (error) {
      console.error('Error in loadChats:', error);
    }
  }

  // Fetch message history for a specific chat
  async loadMessages(chatId: string): Promise<void> {
    const token = this.authService.getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${this.apiUrl}/chat/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        this.messages.set(data);
      } else {
        console.error('Failed to load messages:', response.statusText);
      }
    } catch (error) {
      console.error('Error in loadMessages:', error);
    }
  }

  // Select a historical chat or start a new chat
  selectChat(chatId: string | null): void {
    this.activeChatId.set(chatId);
    if (chatId) {
      this.loadMessages(chatId);
    } else {
      this.messages.set([]);
    }
  }

  // Send message and stream response chunks via fetch + ReadableStream
  async sendMessage(prompt: string): Promise<void> {
    const token = this.authService.getAccessToken();
    if (!token) return;

    const currentChatId = this.activeChatId();

    // 1. Immediately append the user message locally
    const userMsg: Message = {
      role: 'user',
      text: prompt,
      chatId: currentChatId || '',
      createdAt: new Date().toISOString(),
    };
    this.messages.update((prev) => [...prev, userMsg]);

    // 2. Append assistant response placeholder locally
    const assistantMsgPlaceholder: Message = {
      role: 'assistant',
      text: '',
      chatId: currentChatId || '',
      createdAt: new Date().toISOString(),
    };
    this.messages.update((prev) => [...prev, assistantMsgPlaceholder]);
    const assistantMsgIdx = this.messages().length - 1;

    this.isStreaming.set(true);

    try {
      // 3. Initiate fetch request
      const response = await fetch(`${this.apiUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          chatId: currentChatId,
        }),
      });

      if (!response.ok) {
        let rawError: any = `HTTP error! status: ${response.status}`;
        try {
          const errObj = await response.json();
          if (errObj && errObj.error) {
            rawError = errObj.error;
          }
        } catch {
          // ignore
        }
        const customErr = new Error('An Error occurred');
        (customErr as any).rawError = rawError;
        throw customErr;
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Hold the last unfinished line

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data:')) continue;

          const dataStr = trimmedLine.slice(5).trim();
          if (dataStr === '[DONE]') continue;

          try {
            const dataObj = JSON.parse(dataStr);

            if (dataObj.type === 'metadata' && dataObj.chatId) {
              // Capture new chat ID
              this.activeChatId.set(dataObj.chatId);
              // Update chatId on temporary message items
              this.messages.update((prev) => {
                const updated = [...prev];
                if (updated[assistantMsgIdx - 1]) updated[assistantMsgIdx - 1].chatId = dataObj.chatId;
                if (updated[assistantMsgIdx]) updated[assistantMsgIdx].chatId = dataObj.chatId;
                return updated;
              });
              // Refresh chat lists in background
              this.loadChats();
            } else if (dataObj.type === 'text' && dataObj.text) {
              // Progressive typing simulation
              this.messages.update((prev) => {
                const updated = [...prev];
                if (updated[assistantMsgIdx]) {
                  updated[assistantMsgIdx].text += dataObj.text;
                }
                return updated;
              });
            } else if (dataObj.type === 'error') {
              const customErr = new Error('An Error occurred');
              (customErr as any).rawError = dataObj.error || dataObj.message;
              throw customErr;
            }
          } catch (e) {
            console.error('Error parsing SSE line:', e, trimmedLine);
          }
        }
      }
    } catch (error: any) {
      console.error('Error streaming chat:', error.rawError || error);

      this.messages.update((prev) => {
        const updated = [...prev];
        if (updated[assistantMsgIdx]) {
          updated[assistantMsgIdx].text = `An Error occurred`;
        }
        return updated;
      });
    } finally {
      this.isStreaming.set(false);
    }
  }
}
