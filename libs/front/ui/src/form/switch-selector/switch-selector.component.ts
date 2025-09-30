import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

export interface SwitchOption<T> {
  name: string;
  value: T;
}

@Component({
  selector: 'ui-switch-selector',
  imports: [CommonModule],
  templateUrl: './switch-selector.component.html',
  styleUrl: './switch-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchSelectorComponent<T> implements ControlValueAccessor, AfterViewInit {
  options = input.required<SwitchOption<T>[]>();
  selectedValue = signal<T | null>(null);
  disabled = signal<boolean>(false);
  selectedWidth = signal(0);
  selectedOffset = signal(0);

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private onChange?: (value: T) => void;
  private onTouched?: () => void;
  private static nextId = 0;
  readonly uniqueId = 'ui-switch-selector-' + SwitchSelectorComponent.nextId++;
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    effect(() => {
      const currentOptions = this.options();
      if (currentOptions.length === 0) {
        return;
      }

      const currentValue = this.selectedValue();
      const hasMatch = currentOptions.some((option) => option.value === currentValue);

      if (!hasMatch) {
        this.selectedValue.set(currentOptions[0].value);
      }
    });

    effect(() => {
      const selectedValue = this.selectedValue();
      const id = this.uniqueId + '_' + selectedValue;
      const element = this.elementRef.nativeElement.querySelector(`#${id}`);
      if (element) {
        this.calculateSelectedElement(element as HTMLElement);
      }
    });
  }

  ngAfterViewInit(): void {
    const selectedValue = this.selectedValue();
    const id = this.uniqueId + '_' + selectedValue;
    const element = this.elementRef.nativeElement.querySelector(`#${id}`);
    if (element) {
      this.calculateSelectedElement(element as HTMLElement);
    }
  }

  calculateSelectedElement(element: HTMLElement) {
    const width = element.clientWidth;
    this.selectedWidth.set(width);

    const offset = element.offsetLeft;

    const container = element.parentElement as HTMLElement;
    const containerPaddingLeft = container ? parseInt(getComputedStyle(container).paddingLeft) : 0;

    const adjustedOffset = offset - containerPaddingLeft;
    this.selectedOffset.set(adjustedOffset);
  }

  writeValue(value: T | null): void {
    if (value !== null) {
      this.selectedValue.set(value);
      return;
    }

    const currentOptions = this.options();

    if (currentOptions.length > 0) {
      this.selectedValue.set(currentOptions[0].value);
    } else {
      this.selectedValue.set(null);
    }
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  selectOption(option: SwitchOption<T>): void {
    if (this.disabled()) {
      return;
    }

    this.selectedValue.set(option.value);

    if (this.onChange) {
      this.onChange(option.value);
    }

    if (this.onTouched) {
      this.onTouched();
    }
  }

  isSelected(option: SwitchOption<T>): boolean {
    return option.value === this.selectedValue();
  }
}
