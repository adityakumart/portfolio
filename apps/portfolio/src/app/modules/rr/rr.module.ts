import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RRRoutingModule } from './rr-routing.module';
import { RRSharedModule } from './shared';

@NgModule({
  imports: [
    CommonModule,
    RRRoutingModule,
    RRSharedModule,
  ],
  exports: [
    RRSharedModule,
  ],
})
export class RRModule { }

