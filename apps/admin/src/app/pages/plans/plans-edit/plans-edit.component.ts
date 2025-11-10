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
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PlansEditStore } from './plans-edit.store';
import { SessionSignalStore } from '@front/state/session';
import { PlanDuration, PlanDurationNames, ClassLimitType, ClassLimitTypeNames, Plan, PlanService } from '@models/plans';
import { ButtonComponent, SelectModule } from '@ui';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PlanServiceFormComponent } from '../plans-create/components/plan-service-form';

@Component({
  selector: 'app-plans-edit',
  imports: [ReactiveFormsModule, SelectModule, PlanServiceFormComponent, ButtonComponent, RouterModule, MatSlideToggleModule],
  templateUrl: './plans-edit.component.html',
  styleUrl: './plans-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PlansEditStore],
})
export class PlansEditComponent {
  private readonly store = inject(PlansEditStore);
  private readonly session = inject(SessionSignalStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly plan = this.store.plan;
  readonly services = this.store.services;
  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly planDurationNames = PlanDurationNames;
  readonly planDurations = Object.values(PlanDuration);
  readonly classLimitTypeNames = ClassLimitTypeNames;

  form: FormGroup;
  planId: string;

  constructor() {
    this.planId = this.route.snapshot.paramMap.get('id') || '';

    this.form = this.fb.group({
      name: [null, Validators.required],
      description: [''],
      cost: [null, [Validators.required, Validators.min(0)]],
      active: [true, Validators.required],
      duration: this.fb.group({
        type: [PlanDuration.MONTHLY, Validators.required],
        days: [{ value: null, disabled: true }],
      }),
      services: this.fb.array([], this.arrayMinLengthValidator(1)),
    });

    effect(() => {
      const plan = this.plan();
      if (plan) {
        this.form.patchValue({
          name: plan.name,
          description: plan.description,
          cost: plan.cost,
          active: plan.active,
          duration: {
            type: plan.duration.type,
            days: plan.duration.days,
          },
        });

        const servicesArray = this.form.get('services') as FormArray;
        servicesArray.clear();
        plan.services.forEach((service) => {
          servicesArray.push(this.createServiceGroup(service));
        });
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

    effect(() => {
      const facilityId = this.session.selectedFacility()?.id;
      if (facilityId && this.planId) {
        this.store.loadServices(facilityId);
        this.store.loadPlan({ facilityId, planId: this.planId });
      }
    });
  }

  get servicesArray(): FormArray {
    return this.form.get('services') as FormArray;
  }

  private createServiceGroup(service: PlanService): FormGroup {
    return this.fb.group({
      serviceId: [service.serviceId, Validators.required],
      classLimitType: [service.classLimitType, Validators.required],
      classLimit: [service.classLimit],
    });
  }

  addService() {
    const serviceGroup = this.fb.group({
      serviceId: ['', Validators.required],
      classLimitType: [ClassLimitType.UNLIMITED, Validators.required],
      classLimit: [{ value: null }],
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
        : {
            minLengthArray: {
              requiredLength: minLength,
              actualLength: control.length,
            },
          };
    };
  }

  async updatePlan() {
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
    const planData: Plan = {
      id: this.planId,
      name: formValue.name,
      description: formValue.description,
      cost: formValue.cost,
      currency: this.plan()?.currency || 'COP',
      duration: {
        type: formValue.duration.type,
        days: formValue.duration.days || null,
      },
      services: planServices,
      active: formValue.active,
    };
    await this.store.updatePlan(planData, facilityId);
    this.router.navigate(['/home/plans', this.planId]);
  }
}
