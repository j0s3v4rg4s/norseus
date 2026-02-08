import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  TemplateRef,
  ViewContainerRef,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import {
  Overlay,
  OverlayRef,
  OverlayModule,
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { ENTER, SPACE, ESCAPE, DOWN_ARROW, UP_ARROW, TAB, HOME, END } from '@angular/cdk/keycodes';
import { CDKOptionComponent } from './cdk-option.component';

let nextSelectId = 0;

@Component({
  selector: 'ui-cdk-select',
  imports: [OverlayModule],
  templateUrl: './cdk-select.component.html',
  styleUrl: './cdk-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'cdk-select',
    '[class.cdk-select-disabled]': 'disabled()',
    '[class.cdk-select-invalid]': 'hasError()',
  },
})
export class CDKSelectComponent<T = unknown> implements ControlValueAccessor, AfterContentInit, OnDestroy {
  private readonly selectId = nextSelectId++;
  readonly triggerId = `ui-cdk-select-trigger-${this.selectId}`;
  readonly panelId = `ui-cdk-select-panel-${this.selectId}`;

  placeholder = input<string>('Select an option');

  readonly options = contentChildren(CDKOptionComponent<T>);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panelTemplate');

  readonly value = signal<T | null>(null);
  readonly isOpen = signal<boolean>(false);
  readonly disabled = signal<boolean>(false);

  readonly displayValue = computed(() => {
    const currentValue = this.value();
    if (currentValue === null || currentValue === undefined) {
      return null;
    }
    const selectedOption = this.options().find(
      (option) => option.value() === currentValue
    );
    return selectedOption?.getLabel() ?? null;
  });

  readonly activeDescendantId = computed(() => {
    if (!this.isOpen() || !this.keyManager) {
      return null;
    }
    return this.keyManager.activeItem?.id ?? null;
  });

  readonly hasError = computed(() => {
    return this.ngControl?.invalid && this.ngControl?.touched;
  });

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly overlay = inject(Overlay);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);

  private overlayRef: OverlayRef | null = null;
  private keyManager: ActiveDescendantKeyManager<CDKOptionComponent<T>> | null = null;
  private portal: TemplatePortal<unknown> | null = null;

  private onChange: ((value: T | null) => void) | null = null;
  private onTouched: (() => void) | null = null;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngAfterContentInit(): void {
    this.setupKeyManager();
    this.subscribeToOptionChanges();
    this.syncSelectedOption();
  }

  ngOnDestroy(): void {
    this.destroyOverlay();
  }

  writeValue(value: T | null): void {
    this.value.set(value);
    this.syncSelectedOption();
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (this.disabled() || this.isOpen()) {
      return;
    }

    this.createOverlay();
    this.isOpen.set(true);

    if (this.keyManager) {
      const selectedIndex = this.options().findIndex(
        (option) => option.value() === this.value()
      );
      if (selectedIndex >= 0) {
        this.keyManager.setActiveItem(selectedIndex);
      } else if (this.options().length > 0) {
        this.keyManager.setFirstItemActive();
      }
    }
  }

  close(): void {
    if (!this.isOpen()) {
      return;
    }

    this.destroyOverlay();
    this.isOpen.set(false);
    this.onTouched?.();
    this.trigger().nativeElement.focus();
  }

  handleTriggerKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;

    if (keyCode === DOWN_ARROW || keyCode === UP_ARROW || keyCode === ENTER || keyCode === SPACE) {
      if (!this.isOpen()) {
        event.preventDefault();
        this.open();
      }
    }
  }

  handlePanelKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;

    if (keyCode === ESCAPE) {
      event.preventDefault();
      this.close();
      return;
    }

    if (keyCode === TAB) {
      this.close();
      return;
    }

    if ((keyCode === ENTER || keyCode === SPACE) && this.keyManager?.activeItem) {
      event.preventDefault();
      this.selectOption(this.keyManager.activeItem);
      return;
    }

    if (keyCode === HOME) {
      event.preventDefault();
      this.keyManager?.setFirstItemActive();
      return;
    }

    if (keyCode === END) {
      event.preventDefault();
      this.keyManager?.setLastItemActive();
      return;
    }

    this.keyManager?.onKeydown(event);
  }

  private setupKeyManager(): void {
    this.keyManager = new ActiveDescendantKeyManager(this.options())
      .withHomeAndEnd()
      .withVerticalOrientation()
      .withTypeAhead()
      .skipPredicate((option) => option.disabled);
  }

  private subscribeToOptionChanges(): void {
    this.options().forEach((option) => {
      const subscription = option.selected.subscribe(() => {
        this.selectOption(option);
      });

      this.destroyRef.onDestroy(() => subscription.unsubscribe());
    });
  }

  private selectOption(option: CDKOptionComponent<T>): void {
    if (option.disabled) {
      return;
    }

    const previousValue = this.value();
    const newValue = option.value();

    if (previousValue !== newValue) {
      this.value.set(newValue);
      this.onChange?.(newValue);
      this.syncSelectedOption();
    }

    this.close();
  }

  private syncSelectedOption(): void {
    const currentValue = this.value();
    this.options().forEach((option) => {
      if (option.value() === currentValue) {
        option.select();
      } else {
        option.deselect();
      }
    });
  }

  private createOverlay(): void {
    if (this.overlayRef) {
      return;
    }

    const positionStrategy = this.getPositionStrategy();

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      width: this.trigger().nativeElement.getBoundingClientRect().width,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });

    this.portal = new TemplatePortal(this.panelTemplate(), this.viewContainerRef);
    this.overlayRef.attach(this.portal);

    this.overlayRef.backdropClick().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.close();
    });

    this.overlayRef.keydownEvents().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      this.handlePanelKeydown(event);
    });
  }

  private getPositionStrategy(): FlexibleConnectedPositionStrategy {
    const positions: ConnectedPosition[] = [
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetY: 4,
      },
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
        offsetY: -4,
      },
    ];

    return this.overlay
      .position()
      .flexibleConnectedTo(this.trigger())
      .withPositions(positions)
      .withFlexibleDimensions(false)
      .withPush(false);
  }

  private destroyOverlay(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
      this.portal = null;
    }
  }
}
