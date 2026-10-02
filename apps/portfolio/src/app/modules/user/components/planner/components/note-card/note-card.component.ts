import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucidePin, lucideTrash2, lucideEdit3, lucideCopy, lucideCheck, lucideShare2 } from '@ng-icons/lucide';
import { INote } from '@portfolio/shared-types';

export interface NoteLine {
  isChecklist: boolean;
  checked: boolean;
  text: string;
  lineIdx: number;
}

@Component({
  selector: 'app-planner-note-card',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({
      lucidePin,
      lucideTrash2,
      lucideEdit3,
      lucideCopy,
      lucideCheck,
      lucideShare2,
    }),
  ],
  templateUrl: './note-card.component.html',
  styleUrls: ['./note-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteCardComponent {
  @Input({ required: true }) note!: INote;
  @Output() pinToggle = new EventEmitter<INote>();
  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<INote>();
  @Output() share = new EventEmitter<INote>();
  @Output() tagClick = new EventEmitter<string>();
  @Output() contentChange = new EventEmitter<{ note: INote; newContent: string }>();

  copied = false;

  get parsedLines(): NoteLine[] {
    const rawLines = (this.note.content || '').split('\n');
    return rawLines.map((line, idx) => {
      const match = line.match(/^(\s*[-*]\s*\[([ xX])\]\s*)(.*)$/);
      if (match) {
        return {
          isChecklist: true,
          checked: match[2].toLowerCase() === 'x',
          text: match[3],
          lineIdx: idx,
        };
      }
      return {
        isChecklist: false,
        checked: false,
        text: line,
        lineIdx: idx,
      };
    });
  }

  toggleChecklistLine(lineIdx: number, event: MouseEvent): void {
    event.stopPropagation();
    const rawLines = (this.note.content || '').split('\n');
    const target = rawLines[lineIdx];
    if (!target) return;

    if (target.includes('[ ]')) {
      rawLines[lineIdx] = target.replace('[ ]', '[x]');
    } else if (target.includes('[x]') || target.includes('[X]')) {
      rawLines[lineIdx] = target.replace(/\[[xX]\]/, '[ ]');
    }

    const newContent = rawLines.join('\n');
    this.contentChange.emit({ note: this.note, newContent });
  }

  onCopy(): void {
    if (navigator?.clipboard) {
      const text = `${this.note.title ? this.note.title + '\n\n' : ''}${this.note.content}`;
      navigator.clipboard.writeText(text);
      this.copied = true;
      setTimeout(() => (this.copied = false), 1800);
    }
  }
}
