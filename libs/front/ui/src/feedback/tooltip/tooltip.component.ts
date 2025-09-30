import { Component, signal } from '@angular/core';

@Component({
  selector: 'ui-tooltip',
  template: `
    <div class="bg-neutral-800 text-white text-sm px-3 py-2 rounded-md shadow-lg max-w-xs break-words">
      {{ content() }}
    </div>
  `,
})
export class TooltipComponent {
  content = signal<string>('');
}
