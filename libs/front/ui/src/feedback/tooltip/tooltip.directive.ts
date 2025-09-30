import {
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  OnDestroy,
  ViewContainerRef,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

import { TooltipComponent } from './tooltip.component';

@Directive({
  selector: '[uiTooltip]',
})
export class TooltipDirective implements OnDestroy {
  uiTooltip = input.required<string>();
  uiTooltipDisabled = input(false);

  private readonly overlay = inject(Overlay);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private overlayRef: OverlayRef | null = null;
  private tooltipInstance: ComponentRef<TooltipComponent> | null = null;

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.uiTooltipDisabled()) {
      return;
    }
    this.showTooltip();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hideTooltip();
  }

  @HostListener('focus')
  onFocus(): void {
    if (this.uiTooltipDisabled()) {
      return;
    }
    this.showTooltip();
  }

  @HostListener('blur')
  onBlur(): void {
    this.hideTooltip();
  }

  ngOnDestroy(): void {
    this.hideTooltip();
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  private showTooltip(): void {
    if (this.overlayRef?.hasAttached()) {
      return;
    }

    if (this.overlayRef === null) {
      this.overlayRef = this.overlay.create({
        positionStrategy: this.overlay
          .position()
          .flexibleConnectedTo(this.elementRef)
          .withPositions([
            {
              originX: 'center',
              originY: 'top',
              overlayX: 'center',
              overlayY: 'bottom',
              offsetY: -8,
            },
            {
              originX: 'center',
              originY: 'bottom',
              overlayX: 'center',
              overlayY: 'top',
              offsetY: 8,
            },
          ]),
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
      });
    }

    this.tooltipInstance = this.overlayRef.attach(new ComponentPortal(TooltipComponent, this.viewContainerRef));
    this.tooltipInstance.instance.content.set(this.uiTooltip());
  }

  private hideTooltip(): void {
    if (this.overlayRef?.hasAttached()) {
      this.overlayRef.detach();
      this.tooltipInstance = null;
    }
  }
}
