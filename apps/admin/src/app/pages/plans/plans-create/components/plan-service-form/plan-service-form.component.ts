import { ChangeDetectionStrategy, Component, computed, input, OnInit, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Service } from '@models/services';
import { ClassLimitTypeValues, ClassLimitTypeNames, ClassLimitType } from '@models/plans';
import { SelectModule } from '@ui';


@Component({
  selector: 'app-plan-service-form',
  imports: [ReactiveFormsModule, SelectModule],
  templateUrl: './plan-service-form.component.html',
  styleUrls: ['./plan-service-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanServiceFormComponent implements OnInit{
  private static uniqueId = 0;

  id = input<string>(`plan-service-form-${PlanServiceFormComponent.uniqueId++}`);
  serviceGroup = input.required<FormGroup>();
  services = input.required<Service[]>();
  readonly classLimitTypes = ClassLimitTypeValues;


  readonly classLimitTypeNames = ClassLimitTypeNames;
  readonly remove = output<void>();

  isFixedLimit = signal(false);

  ngOnInit(): void {
    this.serviceGroup().get('classLimitType')?.valueChanges.subscribe(value => {
      const isFixed = value === ClassLimitType.FIXED;
      this.isFixedLimit.set(isFixed);
      if (isFixed) {
        this.serviceGroup().get('classLimit')?.setValidators([Validators.required, Validators.min(1)]);
        this.serviceGroup().get('classLimit')?.enable();
      } else {
        this.serviceGroup().get('classLimit')?.clearValidators();
        this.serviceGroup().get('classLimit')?.disable();
        this.serviceGroup().get('classLimit')?.setValue(null);
      }
      this.serviceGroup().get('classLimit')?.updateValueAndValidity();
    })
  }
}
