import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PlansCreateStore } from './plans-create.store';
import { SessionSignalStore } from '@front/state/session';
import { PlanDuration, PlanDurationNames, ClassLimitType, ClassLimitTypeNames, Plan, PlanService } from '@models/plans';
import { ButtonComponent, SelectModule } from '@ui';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PlanServiceFormComponent } from './components/plan-service-form';

@Component({
  selector: 'app-plans-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    PlanServiceFormComponent,
    ButtonComponent,
    RouterModule,
  ],
  templateUrl: './plans-create.component.html',
  styleUrls: ['./plans-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PlansCreateStore],
})
export class PlansCreateComponent {
  private readonly store = inject(PlansCreateStore);
  private readonly session = inject(SessionSignalStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly services = this.store.services;
  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly planDurationNames = PlanDurationNames;
  readonly planDurations = Object.values(PlanDuration);
  readonly classLimitTypeNames = ClassLimitTypeNames;

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: [null, Validators.required],
      description: [''],
      cost: [null, [Validators.required, Validators.min(0)]],
      duration: this.fb.group({
        type: [PlanDuration.MONTHLY, Validators.required],
        days: [{ value: null, disabled: true }],
      }),
      services: this.fb.array([], this.arrayMinLengthValidator(1)),
    });

    effect(() => {
      const facilityId = this.session.selectedFacility()?.id;
      if (facilityId) {
        this.store.loadServices(facilityId);
      }
    });

    this.form
      .get('duration.type')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((type) => {
        const daysControl = this.form.get('duration.days');
        if (type === PlanDuration.CUSTOM) {
          daysControl?.enable();
          daysControl?.setValidators(Validators.required);
        } else {
          daysControl?.disable();
          daysControl?.clearValidators();
        }
        daysControl?.updateValueAndValidity();
      });
  }

  get servicesArray(): FormArray {
    return this.form.get('services') as FormArray;
  }

  addService() {
    const serviceGroup = this.fb.group({
      serviceId: ['', Validators.required],
      classLimitType: [ClassLimitType.UNLIMITED, Validators.required],
      classLimit: [{ value: null, disabled: true }],
    });

    this.servicesArray.push(serviceGroup);
  }

  removeService(index: number) {
    this.servicesArray.removeAt(index);
  }

  private arrayMinLengthValidator(minLength: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control instanceof FormArray)) {
        return null;
      }
      return control.length >= minLength
        ? null
        : { minLengthArray: { requiredLength: minLength, actualLength: control.length } };
    };
  }

  async savePlan() {
    if (this.form.invalid) {
      return;
    }

    const facilityId = this.session.selectedFacility()?.id;
    if (!facilityId) return;

    const formValue = this.form.getRawValue();
    const planServices: PlanService[] = formValue.services.map(
      (service: { serviceId: string; classLimitType: ClassLimitType; classLimit: number | null }) => {
        const planService: PlanService = {
          serviceId: service.serviceId,
          classLimitType: service.classLimitType,
          classLimit: service.classLimit || null,
        };
        return planService;
      },
    );
    const planData: Omit<Plan, 'id'> = {
      name: formValue.name,
      description: formValue.description,
      cost: formValue.cost,
      currency: 'COP',
      duration: {
        type: formValue.duration.type,
        days: formValue.duration.days || null,
      },
      services: planServices,
      active: true,
    };
    await this.store.createPlan(planData, facilityId);
    this.router.navigate(['/home/plans']);
  }
}
