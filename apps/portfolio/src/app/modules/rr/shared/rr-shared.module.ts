import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RRVehicleCardComponent } from './components/vehicle-card/vehicle-card.component';
import { RRCarLoaderComponent } from './components/car-loader/car-loader.component';

@NgModule({
  imports: [
    CommonModule,
    RRVehicleCardComponent,
    RRCarLoaderComponent,
  ],
  exports: [
    RRVehicleCardComponent,
    RRCarLoaderComponent,
  ],
})
export class RRSharedModule {}

