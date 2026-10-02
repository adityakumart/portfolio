import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideX, lucidePin, lucideTag, lucidePalette } from '@ng-icons/lucide';
import { INote } from '@portfolio/shared-types';

export const NOTE_COLOR_PRESETS = [
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#64748b', // Slate
];

@Component({
  selector: 'app-planner-note-editor-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [
    provideIcons({
      lucideX,
      lucidePin,
      lucideTag,
      lucidePalette,
    }),
  ],
  templateUrl: './note-editor-sheet.component.html',
  styleUrls: ['./note-editor-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteEditorSheetComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() note: INote | null = null;
  @Input() isSaving = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{
    title: string;
    content: string;
    tags: string[];
    isPinned: boolean;
    color: string;
  }>();

  readonly colorPresets = NOTE_COLOR_PRESETS;

  form = {
    title: '',
    content: '',
    tagInput: '',
    tags: [] as string[],
    isPinned: false,
    color: NOTE_COLOR_PRESETS[0],
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['note'] || changes['isOpen']) {
      if (this.note) {
        this.form = {
          title: this.note.title || '',
          content: this.note.content || '',
          tagInput: '',
          tags: [...(this.note.tags || [])],
          isPinned: Boolean(this.note.isPinned),
          color: this.note.color || NOTE_COLOR_PRESETS[0],
        };
      } else {
        this.resetForm();
      }
    }
  }

  resetForm(): void {
    this.form = {
      title: '',
      content: '',
      tagInput: '',
      tags: [],
      isPinned: false,
      color: NOTE_COLOR_PRESETS[0],
    };
  }

  addTag(): void {
    const t = this.form.tagInput.trim().replace(/^#/, '');
    if (t && !this.form.tags.includes(t)) {
      this.form.tags.push(t);
      this.form.tagInput = '';
    }
  }

  removeTag(tag: string): void {
    this.form.tags = this.form.tags.filter((t) => t !== tag);
  }

  onSave(): void {
    if (!this.form.content.trim()) return;
    if (this.form.tagInput.trim()) {
      this.addTag();
    }
    this.save.emit({
      title: this.form.title.trim(),
      content: this.form.content.trim(),
      tags: this.form.tags,
      isPinned: this.form.isPinned,
      color: this.form.color,
    });
  }
}
