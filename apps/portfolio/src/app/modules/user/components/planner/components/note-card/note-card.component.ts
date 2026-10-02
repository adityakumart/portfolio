import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucidePin, lucideTrash2, lucideEdit3, lucideCopy, lucideCheck } from '@ng-icons/lucide';
import { INote } from '@portfolio/shared-types';

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
  @Output() tagClick = new EventEmitter<string>();

  copied = false;

  onCopy(): void {
    if (navigator?.clipboard) {
      const text = `${this.note.title ? this.note.title + '\n\n' : ''}${this.note.content}`;
      navigator.clipboard.writeText(text);
      this.copied = true;
      setTimeout(() => (this.copied = false), 1800);
    }
  }
}
