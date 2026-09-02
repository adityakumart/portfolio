import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  signal,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonMaterialModule } from '../../../shared/Material/common-material.module';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
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
  imports: [CommonModule, CommonMaterialModule, DragDropModule, NgIconComponent],
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
  addJsonData = signal<
    {
      inputType: string;
      icon: string;
      label: string;
    }[]
  >([]);

  selectedFieldId = signal<number | null>(null);

  dragging = false;

  fieldSelected = (id: number) => {
    this.selectedFieldId.set(id);
  };

  ngOnInit(): void {
    this.jsonData.set([
      {
        id: 1,
        inputType: 'text',
        label: 'one',
        question: '',
      },
      {
        id: 2,
        inputType: 'textarea',
        label: 'two',
        question: '',
      },
      {
        id: 3,
        inputType: 'select',
        label: 'three',
        question: '',
      },
      {
        id: 4,
        inputType: 'radio',
        label: 'three',
        question: '',
      },
      {
        id: 5,
        inputType: 'date',
        label: 'three',
        question: '',
      },
      {
        id: 6,
        inputType: 'dateRange',
        label: 'three',
        question: '',
      },
      {
        id: 7,
        inputType: 'checkBox',
        label: 'three',
        question: '',
      },
    ]);
    this.addJsonData.set([
      {
        inputType: 'text',
        icon: 'lucideType',
        label: 'Text',
      },
      {
        inputType: 'phone',
        icon: 'lucidePhone',
        label: 'Phone',
      },
      {
        inputType: 'textarea',
        icon: 'lucideFileText',
        label: 'Text Area',
      },
      {
        inputType: 'select',
        icon: 'lucideListFilter',
        label: 'Select',
      },
      {
        inputType: 'radio',
        icon: 'lucideCheckCircle2',
        label: 'Radio',
      },
      {
        inputType: 'date',
        icon: 'lucideCalendar',
        label: 'Date',
      },
      {
        inputType: 'dateRange',
        icon: 'lucideCalendarRange',
        label: 'Date Range',
      },
      {
        inputType: 'checkBox',
        icon: 'lucideCheckSquare',
        label: 'Checkbox',
      },
    ]);
  }

  addInput(inputType: string) {
    let tempObj = this.addJsonData().find((x) => x.inputType === inputType);
    if (tempObj) {
      this.jsonData.set([
        ...this.jsonData(),
        {
          ...tempObj,
          id: this.jsonData().length + 1,
          question: 'Question ' + this.jsonData().length + 1,
        },
      ]);
      setTimeout(() => {
        this.scrollToElement();
      }, 200);
    }
  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.jsonData(), event.previousIndex, event.currentIndex);
  }

  scrollToElement(): void {
    this.myScrollContainer.nativeElement.scroll({
      top: this.myScrollContainer.nativeElement.scrollHeight,
      left: 0,
      behavior: 'smooth',
    });
  }
}
