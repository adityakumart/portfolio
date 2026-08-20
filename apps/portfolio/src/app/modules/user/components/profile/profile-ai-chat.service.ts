import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ChatMessage } from './profile-ai-chat.model';
import { GeminiAiService } from './gemini-ai.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileAiChatService {
  private geminiService = inject(GeminiAiService);

  // Reactive Signals for state management
  messages = signal<ChatMessage[]>([]);
  isLoading = signal<boolean>(false);

  constructor() {
    // Add a friendly welcome message on load
    this.addWelcomeMessage();
    this.setupGlobalClipboardHelper();
  }

  private addWelcomeMessage() {
    this.messages.set([
      {
        id: 'welcome',
        role: 'assistant',
        content: this.formatMarkdown(
          'Hello! I am your **AI Developer Assistant**. \n\nI can help you explore the tech stack of this portfolio, demonstrate Angular Signals, or answer coding questions. Try asking: \n- *What is the tech stack?*\n- *Show me a Signal code example.*\n- *How do I connect a real API?*'
        ),
        timestamp: new Date(),
        status: 'complete',
      },
    ]);
  }

  // Inject a global helper on the window object to handle copying code from rendered HTML
  private setupGlobalClipboardHelper() {
    if (typeof window !== 'undefined') {
      (window as Window & { copyCodeToClipboard?: (button: HTMLButtonElement) => void }).copyCodeToClipboard = (button: HTMLButtonElement) => {
        const wrapper = button.closest('.code-block-wrapper');
        const codeElement = wrapper?.querySelector('.code-block-content');
        if (codeElement) {
          const codeText = codeElement.textContent || '';
          navigator.clipboard.writeText(codeText).then(() => {
            const originalText = button.innerHTML;
            button.innerHTML = '<span class="material-icons">check</span> Copied!';
            button.classList.add('copied');
            button.disabled = true;
            setTimeout(() => {
              button.innerHTML = originalText;
              button.classList.remove('copied');
              button.disabled = false;
            }, 2000);
          }).catch(err => {
            console.error('Failed to copy code:', err);
          });
        }
      };
    }
  }

  /**
   * Safe Custom Markdown to HTML Formatter
   * Escapes HTML first for strict security against XSS, then processes markup constructs.
   */
  formatMarkdown(text: string): string {
    if (!text) return '';

    // 1. Separate code blocks from the text to prevent inner contents from formatting
    const codeBlocks: string[] = [];
    let processedText = text;

    // RegEx to capture ```lang\ncode\n```
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    processedText = processedText.replace(codeBlockRegex, (match, lang, code) => {
      const index = codeBlocks.length;
      // Escape code block content for rendering
      const escapedCode = this.escapeHtml(code.trim());
      const displayLang = lang || 'code';
      
      const codeHtml = `
        <div class="code-block-wrapper">
          <div class="code-block-header">
            <span class="code-block-lang">${displayLang}</span>
            <button class="copy-code-btn" onclick="window.copyCodeToClipboard(this)">
              <span class="material-icons">content_copy</span> Copy
            </button>
          </div>
          <pre class="code-block-pre"><code class="code-block-content">${escapedCode}</code></pre>
        </div>
      `;
      codeBlocks.push(codeHtml);
      return `__CODE_BLOCK_PLACEHOLDER_${index}__`;
    });

    // 2. Escape HTML of the surrounding text content to prevent XSS
    processedText = this.escapeHtml(processedText);

    // 3. Format Lists (Unordered lists starting with - or *)
    const lines = processedText.split('\n');
    let inList = false;
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemContent = trimmed.substring(2).trim();
        let prefix = '';
        if (!inList) {
          inList = true;
          prefix = '<ul class="chat-list">';
        }
        return `${prefix}<li>${itemContent}</li>`;
      } else {
        let prefix = '';
        if (inList) {
          inList = false;
          prefix = '</ul>';
        }
        return prefix + line;
      }
    });
    if (inList) {
      processedLines.push('</ul>');
    }
    processedText = processedLines.join('\n');

    // 4. Format Inline bold: **text**
    processedText = processedText.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');

    // 5. Format Inline italics: *text* or _text_
    processedText = processedText.replace(/\*([\s\S]*?)\*/g, '<em>$1</em>');
    processedText = processedText.replace(/_([\s\S]*?)_/g, '<em>$1</em>');

    // 6. Format Inline code: `code`
    processedText = processedText.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // 7. Format Links: [label](url)
    processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>');

    // 8. Convert remaining newlines to <br> tags (except those inside tags)
    processedText = processedText.replace(/\n/g, '<br>');

    // 9. Reinsert the untouched formatted code blocks
    codeBlocks.forEach((codeHtml, index) => {
      processedText = processedText.replace(`__CODE_BLOCK_PLACEHOLDER_${index}__`, codeHtml);
    });

    return processedText;
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Dispatches the prompt to the AI response generator.
   */
  async sendMessage(content: string): Promise<string | null> {
    if (!content.trim()) return null;

    // 1. Add User Message
    const userMessageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: this.escapeHtml(content),
      timestamp: new Date(),
      status: 'complete',
      rawContent: content,
    };

    this.messages.update(prev => [...prev, userMsg]);
    this.isLoading.set(true);

    const assistantMessageId = `ai-${Date.now()}`;

    try {
      // Map complete messages history (excluding welcome node) for backend request payload
      const history = this.messages()
        .filter(m => m.status === 'complete' && m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          content: m.rawContent || m.content
        }));

      // Call backend Gemini HTTP request via the Angular GeminiAiService
      const res = await firstValueFrom(this.geminiService.sendMessage(content, history));
      const rawReply = res.reply;

      // Streaming typing effect: feed the message chunk by chunk
      const assistantMsg: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        status: 'sending',
      };

      // Push initial empty response object
      this.messages.update(prev => [...prev, assistantMsg]);
      this.isLoading.set(false);

      // Perform a typing effect
      let currentLength = 0;
      const totalLength = rawReply.length;
      // Type 8-15 characters at a time for smooth rendering speed
      const interval = setInterval(() => {
        currentLength += Math.min(totalLength - currentLength, Math.floor(Math.random() * 12) + 8);
        const slicedText = rawReply.substring(0, currentLength);
        const htmlFormatted = this.formatMarkdown(slicedText);

        // Update active message content
        this.messages.update(prev =>
          prev.map(m => (m.id === assistantMessageId ? { ...m, content: htmlFormatted } : m))
        );

        if (currentLength >= totalLength) {
          clearInterval(interval);
          this.messages.update(prev =>
            prev.map(m =>
              m.id === assistantMessageId ? { ...m, status: 'complete' as const, rawContent: rawReply } : m
            )
          );
        }
      }, 40);

      return rawReply;
    } catch (error: unknown) {
      console.error('Error generating AI response:', error);
      this.isLoading.set(false);
      
      const err = error as { error?: { message?: string }; message?: string };
      const errorMsgText = err.error?.message || err.message || 'Failed to retrieve response from developer assistant. Please check your connection and try again.';
      const errorMsg: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: `<span class="chat-error-text">${this.escapeHtml(errorMsgText)}</span>`,
        timestamp: new Date(),
        status: 'error',
        rawContent: errorMsgText,
      };
      this.messages.update(prev => [...prev, errorMsg]);
      return null;
    }
  }

  /**
   * Resets or clears the conversation thread
   */
  clearChat() {
    this.messages.set([]);
    this.addWelcomeMessage();
  }

  /**
   * Retries the last failed user message
   */
  async retryMessage(failedMessageContent: string): Promise<string | null> {
    // Remove the error message from the log
    this.messages.update(prev => prev.filter(m => m.status !== 'error'));
    return this.sendMessage(failedMessageContent);
  }

  /**
   * Local Mock AI Response Knowledge Base matching user developer-portfolio context
   */
  private generateMockResponse(prompt: string): string {
    const cleanPrompt = prompt.toLowerCase();

    if (cleanPrompt.includes('tech stack') || cleanPrompt.includes('technologies') || cleanPrompt.includes('framework')) {
      return `This modern portfolio application is built using a highly optimized frontend-focused architecture:

* **Frontend Framework:** Angular 22 (using standalone components, Signals, and the elegant control flow template structures).
* **State Management:** Fully reactive system using native Angular Signals (\`signal\`, \`computed\`).
* **Styling & Theme:** Vanilla SCSS with a custom glassmorphism design that features automatic system or manual toggle dark/light theme support.
* **Component Framework:** Angular Material for layout wrappers, tooltips, buttons, and animations.
* **Build System:** Nx Monorepo workspace setup for multi-app management.
* **Backend Core:** Express.js API server running on Node.js.
* **Database:** MongoDB Atlas cluster with mongoose configuration for user details and credentials.

Would you like to see how we implement Signal state management or would you like to review some router guard patterns?`;
    }

    if (cleanPrompt.includes('signal') || cleanPrompt.includes('code example') || cleanPrompt.includes('typescript')) {
      return `Here is a production-grade example of an Angular Standalone Component showing Signal reactivity, state management, and modern control flow syntax:

\`\`\`typescript
import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-stats',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="stats-card">
      <h4>Stats Dashboard</h4>
      <p>Active Users: {{ usersCount() }}</p>
      <p>Premium Ratio: {{ premiumPercentage() }}%</p>
      <button (click)="addUser()">Add User</button>
    </div>
  \`
})
export class UserStatsComponent {
  // 1. Core State Signals
  users = signal<{ id: number; premium: boolean }[]>([
    { id: 1, premium: true },
    { id: 2, premium: false }
  ]);

  // 2. Derived Computed Signals (automatically cached & updated)
  usersCount = computed(() => this.users().length);
  premiumPercentage = computed(() => {
    const total = this.users().length;
    if (total === 0) return 0;
    const premiumCount = this.users().filter(u => u.premium).length;
    return Math.round((premiumCount / total) * 100);
  });

  constructor() {
    // 3. Side Effects (useful for logging, local storage Sync, etc.)
    effect(() => {
      console.log(\`Users count updated: \${this.usersCount()}\`);
    });
  }

  addUser() {
    // 4. Update state safely using signal.update()
    const newId = this.users().length + 1;
    const isPremium = Math.random() > 0.5;
    this.users.update(prev => [...prev, { id: newId, premium: isPremium }]);
  }
}
\`\`\`

**Key Takeaways:**
1. State is declared using \`signal()\`.
2. Calculations automatically recompute on changes using \`computed()\`.
3. Side effects are executed cleanly in \`effect()\`.
4. Values are never mutated directly—always use \`.set()\` or \`.update()\` to trigger notifications!`;
    }

    if (cleanPrompt.includes('connect a real api') || cleanPrompt.includes('live api') || cleanPrompt.includes('backend') || cleanPrompt.includes('connect api')) {
      return `To connect this client-side chat interface to a live LLM endpoint (such as Google Gemini, OpenAI, or a custom LLM), follow these structured steps:

### Step 1: Create a Backend Endpoint in \`portfolio-core\`
In \`apps/portfolio-core/src/controllers/chat.controller.ts\`, implement the endpoint calling Gemini:

\`\`\`typescript
import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function handleChat(req: Request, res: Response) {
  const { message, history } = req.body;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message
    });
    
    return res.json({ reply: response.text });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
\`\`\`

### Step 2: Update Angular Service to use HttpClient
In \`profile-ai-chat.service.ts\`, replace the simulation logic with a post request:

\`\`\`typescript
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';

// Inside ProfileAiChatService class:
private http = inject(HttpClient);

async sendMessage(content: string) {
  // Add user message...
  
  this.http.post<any>(\`\${environment.apiUrl}/chat\`, { message: content })
    .subscribe({
      next: (res) => {
        const parsedReply = this.formatMarkdown(res.reply);
        // Update assistant ChatMessage in signal...
      },
      error: (err) => {
        // Handle error status in signal...
      }
    });
}
\`\`\`

This provides a fully secured and structured API routing setup, protecting your private API Keys on the backend server.`;
    }

    if (cleanPrompt.includes('hello') || cleanPrompt.includes('hi') || cleanPrompt.includes('hey')) {
      return `Hello! Welcome to the AI chat console. I am your developer assistant. 

I can answer questions regarding the frontend layout of this portfolio, show you coding samples using Angular Signals, or discuss connecting to databases or OpenAI/Gemini. 

What can I code or explain for you today?`;
    }

    if (cleanPrompt.includes('who are you') || cleanPrompt.includes('author') || cleanPrompt.includes('creator') || cleanPrompt.includes('aditya')) {
      return `I am the AI assistant integrated into the Developer Portfolio of **Aditya**. 

Aditya is a Software Engineer specializing in modern frontend architectures, building high-performance reactive applications, and engineering backend APIs with Node.js and MongoDB.

You can ask me questions about this workspace's file structures, how to run dev scripts, or how to implement complex animations!`;
    }

    // Default Fallback Response
    return `I received your query: *"${prompt}"*.

Here is how you can proceed with coding this feature:
1. **Interactive UI:** Type in the prompt area below. You can trigger new lines with \`Shift + Enter\`.
2. **Auto-resizing:** The textarea height adjusts dynamically depending on the amount of content you enter.
3. **Copy Code:** When I output code, click the **Copy** button in the header of the code block.

Let me know if you would like to ask a technical question about the Angular workspace setup!`;
  }
}
