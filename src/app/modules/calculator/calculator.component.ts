import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PercentageCalculatorComponent } from './percentage/percentage-calculator.component';
import { ExperienceComponent } from './experience/experience.component';
import { TimezoneConverterComponent } from './timezone-converter/timezone-converter.component';


@Component({
  selector: 'app-calculator',
  imports: [MatTabsModule, PercentageCalculatorComponent, ExperienceComponent, TimezoneConverterComponent],
  templateUrl: './calculator.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './calculator.component.scss'
})
export class CalculatorComponent {

}
