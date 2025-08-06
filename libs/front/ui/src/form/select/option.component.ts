import { Component, input } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-option',
  imports: [CommonModule],
  template: `<div [id]="uniqueId" role="option" [attr.data-value]="value()" aria-selected="false">
    <ng-content></ng-content>
  </div>`,
  styles: ``,
})
export class OptionComponent<T> {
  //****************************************************************************
  //* PUBLIC INPUTS
  //****************************************************************************
  prefix = input<string>('');
  value = input.required<T>();

  //****************************************************************************
  //* PRIVATE STATIC PROPERTIES
  //****************************************************************************
  private static uniqueId = 0;

  //****************************************************************************
  //* PUBLIC INSTANCE PROPERTIES
  //****************************************************************************
  readonly uniqueId = `ui-option-${this.prefix()}-${OptionComponent.uniqueId++}`;
}
