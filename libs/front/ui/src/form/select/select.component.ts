import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
  input,
  inject,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import 'basecoat-css/select';

@Component({
  selector: 'ui-select',
  imports: [CommonModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
})
export class SelectComponent implements OnInit, OnDestroy, ControlValueAccessor {
  private static nextId = 0;
  readonly uniqueId = `ui-select-${SelectComponent.nextId++}`;

  popoverSide = signal<'top' | 'bottom'>('bottom');
  value = signal<string>('');
  placeholder = input<string>('');
  isOpen = signal<boolean>(false);

  disabled = signal<boolean>(false);

  readonly ngControl = inject(NgControl, {
    optional: true,
    self: true,
  });
  private readonly hostElement = inject(ElementRef<HTMLElement>);

  private popoverElement = viewChild<ElementRef<HTMLElement>>('popoverElement');

  get hasError() {
    return this.ngControl?.invalid && this.ngControl?.touched;
  }

  private onChange?: (value: string) => void;
  private onTouched?: () => void;

  private handlePopoverEvent = (event: Event) => {
    const source = (event as CustomEvent).detail.source as HTMLElement;
    if (source.id.includes(this.uniqueId)) {
      this.isOpen.set(true);
      const popover = this.popoverElement()?.nativeElement as HTMLElement;
      const clientRect = popover.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const isBelowTrigger = clientRect.bottom > viewportHeight;
      this.popoverSide.set(isBelowTrigger ? 'top' : 'bottom');
    }
  };

  private handleChangeEvent = (event: Event) => {
    if ((event.target as HTMLElement).id.includes(this.uniqueId)) {
      const newValue = (event as CustomEvent).detail.value;
      this.onValueChange(newValue);
    }
  };

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    document.addEventListener('basecoat:popover', this.handlePopoverEvent);
    document.addEventListener('change', this.handleChangeEvent);
  }

  ngOnDestroy(): void {
    document.removeEventListener('basecoat:popover', this.handlePopoverEvent);
    document.removeEventListener('change', this.handleChangeEvent);
  }

  writeValue(value: string): void {
    this.value.set(value || '');
    (document.getElementById(this.uniqueId) as HTMLElement & { selectByValue: (value: string) => void })?.selectByValue(
      value,
    );
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onValueChange(newValue: string): void {
    this.value.set(newValue);
    this.onChange?.(newValue);
    this.onTouched?.();
    this.isOpen.set(false);
  }

  handleClick(element: HTMLButtonElement) {
    if (element.getAttribute('aria-expanded') === 'true') {
      this.onTouched?.();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.hostElement.nativeElement.contains(event.target as Node) && this.isOpen()) {
      this.isOpen.set(false);
      this.onTouched?.();
    }
  }
}
