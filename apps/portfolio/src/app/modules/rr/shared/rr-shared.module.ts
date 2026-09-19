import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RRVehicleCardComponent } from './components/vehicle-card/vehicle-card.component';
import { RRCarLoaderComponent } from './components/car-loader/car-loader.component';
import { RRAadharInputComponent } from './components/aadhar-input/aadhar-input.component';
import { AadharMaskPipe, AadharVisiblePipe } from './utils/aadhar-mask.util';

@NgModule({
  imports: [
    CommonModule,
    RRVehicleCardComponent,
    RRCarLoaderComponent,
    RRAadharInputComponent,
    AadharMaskPipe,
    AadharVisiblePipe,
  ],
  exports: [
    RRVehicleCardComponent,
    RRCarLoaderComponent,
    RRAadharInputComponent,
    AadharMaskPipe,
    AadharVisiblePipe,
  ],
})
export class RRSharedModule {}

