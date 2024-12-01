import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { CommonMaterialModule } from 'src/app/shared/Material/common-material.module';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-create',
  imports: [
    CommonModule,
    CommonMaterialModule,
    DragDropModule
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent implements OnInit {

  @ViewChild('fieldsList') private myScrollContainer!: ElementRef;

  jsonData = signal<{
    id: number;
    inputType: string;
    label: string;
    question: string;
  }[]>([]);
  addJsonData = signal<{
    inputType: string;
    icon: string;
    label: string;
  }[]>([]);

  selectedFieldId = signal<number | null>(null);


  dragging = false;

  fieldSelected = (id: number) => {
    this.selectedFieldId.set(id);
  }

  ngOnInit(): void {
    this.jsonData.set([
      {
        id: 1,
        inputType: "text",
        label: "one",
        question: ""
      },
      {
        id: 2,
        inputType: "textarea",
        label: "two",
        question: ""
      },
      {
        id: 3,
        inputType: "select",
        label: "three",
        question: ""
      },
      {
        id: 4,
        inputType: "radio",
        label: "three",
        question: ""
      },
      {
        id: 5,
        inputType: "date",
        label: "three",
        question: ""
      },
      {
        id: 6,
        inputType: "dateRange",
        label: "three",
        question: ""
      },
      {
        id: 7,
        inputType: "checkBox",
        label: "three",
        question: ""
      }
    ]);
    this.addJsonData.set([
      {
        inputType: "text",
        icon: "text_fields",
        label: "Text"
      },
      {
        inputType: "phone",
        icon: "call",
        label: "Phone"
      },
      {
        inputType: "textarea",
        icon: "text_fields",
        label: "Text Area"
      },
      {
        inputType: "select",
        icon: "playlist_add_check",
        label: "Select"
      },
      {
        inputType: "radio",
        icon: "radio_button_checked",
        label: "Radio"
      },
      {
        inputType: "date",
        icon: "today",
        label: "Date"
      },
      {
        inputType: "dateRange",
        icon: "date_range",
        label: "Date Range"
      },
      {
        inputType: "checkBox",
        icon: "check_box",
        label: "Checkbox"
      }

    ]);
  }

  addInput(inputType: string) {
    let tempObj = this.addJsonData().find(x => x.inputType === inputType);
    if (tempObj) {
      this.jsonData.set([...this.jsonData(), { ...tempObj, id: this.jsonData().length + 1 , question: "Question " + this.jsonData().length + 1 }]);
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
      behavior: 'smooth'
    });

  }

}
