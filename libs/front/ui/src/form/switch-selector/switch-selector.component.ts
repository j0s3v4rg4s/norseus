import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SwitchSelectorComponent,
      multi: true,
    },
  ],
})
export class SwitchSelectorComponent<T> implements ControlValueAccessor, AfterViewInit {
  options = input.required<SwitchOption<T>[]>();
  selectedValue = signal<T | null>(null);
  disabled = signal<boolean>(false);
  selectedWidth = signal(0);
  selectedOffset = signal(0);

  private onChange?: (value: T) => void;
  private onTouched?: () => void;
  private static nextId = 0;
  readonly uniqueId = 'ui-switch-selector-' + SwitchSelectorComponent.nextId++;
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);

  constructor() {
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
      if (selectedValue !== null) {
        this.updateSelectedElement();
      }
    });
  }

  ngAfterViewInit(): void {
    this.updateSelectedElement();
  }

  private updateSelectedElement(): void {
    const selectedValue = this.selectedValue();
    if (selectedValue === null) return;

    const id = this.uniqueId + '_' + selectedValue;
    const element = this.elementRef.nativeElement.querySelector(`#${id}`) as HTMLElement;

    if (element) {
      this.calculateSelectedElement(element);
    }
  }

  private calculateSelectedElement(element: HTMLElement): void {
    const offset = element.offsetLeft;
    const container = element.parentElement as HTMLElement;
    const containerPaddingLeft = container ? parseInt(getComputedStyle(container).paddingLeft, 10) : 0;
    const elementWidth = element.clientWidth + (containerPaddingLeft * 2);
    this.selectedWidth.set(elementWidth);

    const elementCenter = offset + elementWidth / 2;
    const adjustedOffset = elementCenter - elementWidth / 2 - (containerPaddingLeft * 2);
    this.selectedOffset.set(adjustedOffset);
  }

  writeValue(value: T | null): void {
    if (value !== null) {
      this.selectedValue.set(value);
      return;
    }

    const currentOptions = this.options();
    this.selectedValue.set(currentOptions.length > 0 ? currentOptions[0].value : null);
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
    this.onChange?.(option.value);
    this.onTouched?.();
  }

  isSelected(option: SwitchOption<T>): boolean {
    return option.value === this.selectedValue();
  }
}
