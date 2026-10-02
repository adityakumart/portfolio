import { Component, Output, EventEmitter, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideStickyNote, lucideCheckSquare, lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'app-planner-mobile-fab',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({
      lucidePlus,
      lucideStickyNote,
      lucideCheckSquare,
      lucideX,
    }),
  ],
  templateUrl: './mobile-fab.component.html',
  styleUrls: ['./mobile-fab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileFabComponent {
  @Output() newNote = new EventEmitter<void>();
  @Output() newTask = new EventEmitter<void>();

  readonly isOpen = signal<boolean>(false);

  toggle(): void {
    this.isOpen.set(!this.isOpen());
  }

  onNewNote(): void {
    this.isOpen.set(false);
    this.newNote.emit();
  }

  onNewTask(): void {
    this.isOpen.set(false);
    this.newTask.emit();
  }
}
