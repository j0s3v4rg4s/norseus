import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';

import { TooltipComponent } from './tooltip.component';
import { TooltipDirective } from './tooltip.directive';

@NgModule({
  imports: [OverlayModule, TooltipDirective, TooltipComponent],
  exports: [TooltipDirective, TooltipComponent],
})
export class TooltipModule {}
