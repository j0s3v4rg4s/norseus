import { NgModule } from '@angular/core';

import { CDKSelectComponent } from './cdk-select.component';
import { CDKOptionComponent } from './cdk-option.component';

@NgModule({
  imports: [CDKSelectComponent, CDKOptionComponent],
  exports: [CDKSelectComponent, CDKOptionComponent],
})
export class CDKSelectModule {}
