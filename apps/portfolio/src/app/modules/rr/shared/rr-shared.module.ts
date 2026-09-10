import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RRVehicleCardComponent } from './components/vehicle-card/vehicle-card.component';

@NgModule({
  imports: [
    CommonModule,
    RRVehicleCardComponent,
  ],
  exports: [
    RRVehicleCardComponent,
  ],
})
export class RRSharedModule {}
