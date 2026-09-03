import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  signal,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { HlmCardDirective } from '@spartan-ng/hel/card';
import { HlmInputDirective } from '@spartan-ng/hel/input';
import { HlmLabelDirective } from '@spartan-ng/hel/label';
import { HlmButtonDirective } from '@spartan-ng/hel/button';
import { HlmDropdownMenuImports } from '@spartan-ng/hel/dropdown-menu';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideType,
  lucidePhone,
  lucideFileText,
  lucideListFilter,
  lucideCheckCircle2,
  lucideCalendar,
  lucideCalendarRange,
  lucideCheckSquare,
  lucideGripVertical,
  lucidePlus,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    HlmCardDirective,
    HlmInputDirective,
    HlmLabelDirective,
    HlmButtonDirective,
    HlmDropdownMenuImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucideType,
      lucidePhone,
      lucideFileText,
      lucideListFilter,
      lucideCheckCircle2,
      lucideCalendar,
      lucideCalendarRange,
      lucideCheckSquare,
      lucideGripVertical,
      lucidePlus,
    }),
  ],
  templateUrl: './create.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './create.component.scss',
})
export class CreateComponent implements OnInit {
  @ViewChild('fieldsList') private myScrollContainer!: ElementRef;

  jsonData = signal<
    {
      id: number;
      inputType: string;
      label: string;
      question: string;
    }[]
  >([]);

  addJsonData = signal([
    {
      inputType: 'text',
      label: 'Text',
      icon: 'lucideType',
    },
    {
      inputType: 'phone',
      label: 'Phone number',
      icon: 'lucidePhone',
    },
    {
      inputType: 'textarea',
      label: 'Textarea',
      icon: 'lucideFileText',
    },
    {
      inputType: 'select',
      label: 'Dropdown',
      icon: 'lucideListFilter',
    },
    {
      inputType: 'radio',
      label: 'Single selection',
      icon: 'lucideCheckCircle2',
    },
    {
      inputType: 'date',
      label: 'Date',
      icon: 'lucideCalendar',
    },
    {
      inputType: 'dateRange',
      label: 'Date range',
      icon: 'lucideCalendarRange',
    },
    {
      inputType: 'checkBox',
      label: 'Multiple choice',
      icon: 'lucideCheckSquare',
    },
  ]);

  dragging = false;

  selectedFieldId = signal(1);

  ngOnInit(): void {
    this.jsonData.set([
      {
        id: 1,
        inputType: 'text',
        label: 'Text',
        question: '',
      },
      {
        id: 2,
        inputType: 'textarea',
        label: 'Textarea',
        question: '',
      },
      {
        id: 3,
        inputType: 'select',
        label: 'Dropdown',
        question: '',
      },
      {
        id: 4,
        inputType: 'radio',
        label: 'Single selection',
        question: '',
      },
      {
        id: 5,
        inputType: 'date',
        label: 'Date',
        question: '',
      },
      {
        id: 6,
        inputType: 'dateRange',
        label: 'Date range',
        question: '',
      },
      {
        id: 7,
        inputType: 'checkBox',
        label: 'Multiple choice',
        question: '',
      },
    ]);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.jsonData(), event.previousIndex, event.currentIndex);
  }

  addInput(inputType: string) {
    const list = this.jsonData();
    list.push({
      id: list.length + 1,
      inputType,
      label: inputType,
      question: '',
    });
    this.jsonData.set([...list]);
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop =
        this.myScrollContainer.nativeElement.scrollHeight;
    } catch {}
  }

  fieldSelected(id: number) {
    this.selectedFieldId.set(id);
  }
}
