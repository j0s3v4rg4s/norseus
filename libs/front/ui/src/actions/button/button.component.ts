import { Component, effect, ElementRef, inject, input } from '@angular/core';


@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[ui-button]',
  imports: [],
  template: `
    <div>
      @if (isLoading()) {
        <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      } @else {
        <ng-content></ng-content>
      }
    </div>
  `,
  styles: ``,
})
export class ButtonComponent {
  isLoading = input(false);
  parentElement = inject(ElementRef<HTMLElement>);

  constructor() {
    effect(() => {
      if (this.isLoading()) {
        this.parentElement?.nativeElement?.setAttribute('disabled', 'true');
      } else {
        this.parentElement?.nativeElement?.removeAttribute('disabled');
      }
    });
  }
}
