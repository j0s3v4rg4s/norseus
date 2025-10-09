import { Component, computed, input } from '@angular/core';

export interface Step {
  id: string;
  label: string;
}

@Component({
  selector: 'ui-step-indicator',
  templateUrl: './step-indicator.component.html',
  styleUrls: ['./step-indicator.component.scss'],
})
export class StepIndicatorComponent {
  steps = input.required<Step[]>();
  currentStep = input.required<number>();

  stepStates = computed(() => {
    const steps = this.steps();
    const current = this.currentStep();

    return steps.map((step, index) => {
      const stepNumber = index + 1;
      return {
        ...step,
        stepNumber,
        isCompleted: stepNumber < current,
        isCurrent: stepNumber === current,
        isPending: stepNumber > current,
      };
    });
  });
}
