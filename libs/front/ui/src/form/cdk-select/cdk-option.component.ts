import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FocusableOption } from '@angular/cdk/a11y';

let nextOptionId = 0;

@Component({
  selector: 'ui-cdk-option',
  template: `<ng-content></ng-content>`,
  styleUrl: './cdk-option.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'cdk-option',
    'role': 'option',
    '[id]': 'id',
    '[class.cdk-option-selected]': 'isSelected()',
    '[class.cdk-option-active]': 'isActive()',
    '[class.cdk-option-disabled]': 'disabled',
    '[attr.aria-selected]': 'isSelected()',
    '[attr.aria-disabled]': 'disabled',
    '[attr.tabindex]': '-1',
    '(click)': 'selectOption()',
  },
})
export class CDKOptionComponent<T = unknown> implements FocusableOption {
  readonly id = `ui-cdk-option-${nextOptionId++}`;

  value = input.required<T>();
  isDisabled = input<boolean>(false);

  isSelected = signal<boolean>(false);
  isActive = signal<boolean>(false);

  readonly selected = output<T>();

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  get disabled(): boolean {
    return this.isDisabled();
  }

  focus(): void {
    this.elementRef.nativeElement.focus();
  }

  getLabel(): string {
    return this.elementRef.nativeElement.textContent?.trim() ?? '';
  }

  selectOption(): void {
    if (!this.disabled) {
      this.selected.emit(this.value());
    }
  }

  setActiveStyles(): void {
    this.isActive.set(true);
  }

  setInactiveStyles(): void {
    this.isActive.set(false);
  }

  select(): void {
    this.isSelected.set(true);
  }

  deselect(): void {
    this.isSelected.set(false);
  }
}
