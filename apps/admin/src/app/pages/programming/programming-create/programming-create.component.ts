import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StepIndicatorComponent } from '@ui';
import { SessionSignalStore } from '@front/state/session';
import { LoggerService } from '@front/utils';
import { ProgrammingCreateStore } from './programming-create.store';
import { ProgramInformationComponent } from './components/program-information';
import { CoachAssignmentComponent } from './components/coach-assignment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-programming-create',
  imports: [ReactiveFormsModule, RouterModule, StepIndicatorComponent, ProgramInformationComponent, CoachAssignmentComponent, RouterModule],
  providers: [ProgrammingCreateStore],
  templateUrl: './programming-create.component.html',
  styleUrls: ['./programming-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgrammingCreateComponent {
  private sessionStore = inject(SessionSignalStore);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private logger = inject(LoggerService);
  store = inject(ProgrammingCreateStore);
  facility = computed(() => this.sessionStore.selectedFacility());
  errorMessage = signal('');
  currentStep = computed(() => this.store.currentStep());

  form: FormGroup;

  stepDefinitions = signal([
    { id: 'program-info', label: 'Información del programa' },
    { id: 'coach-assignment', label: 'Asignar coaches' }
  ]);

  constructor() {
    this.form = this.fb.group({
      service: [null, Validators.required],
      description: [''],
    });

    effect(() => {
      const loading = this.sessionStore.loading();
      const facility = this.sessionStore.selectedFacility();
      if (!loading && facility?.id) {
        this.store.loadServices(facility.id);
        this.store.loadEmployees(facility.id);
      }
    });

    this.form.get('service')?.valueChanges.pipe(takeUntilDestroyed()).subscribe((service: string | null) => {
      if (service) {
        this.store.setServiceId(service);
        if (this.facility()?.id) {
          this.store.loadSchedules({ facilityId: this.facility()?.id as string, serviceId: service });
        }
      }
    });
  }

  onSlotClick(event: { slotId: string; isSelected: boolean }): void {
    this.store.setSlotSelection(event.slotId, event.isSelected);
  }

  onWeekChange(weekRange: { start: Date; end: Date }): void {
    this.store.generateDateCalendarSlots(weekRange.start, weekRange.end);
  }

  onCoachAssignment(event: { classId: string; instructorId: string }): void {
    this.store.setCoachAssignment(event.classId, event.instructorId);
  }

  onSameCoachForAll(instructorId: string): void {
    this.store.assignSameCoachToAll(instructorId);
  }

  onClearCoachAssignment(instructorId: string): void {
    this.store.clearCoachAssignment(instructorId);
  }

  canProceedToNextStep(): boolean {
    if (this.store.currentStep() === 1) {
      return this.form.valid && this.store.activeSlots().length > 0;
    }
    return true;
  }

  goToNextStep(): void {
    if (this.store.currentStep() === 1 && this.canProceedToNextStep()) {
      const { description } = this.form.value;
      const facility = this.facility();

      if (facility?.id) {
        this.store.generateProgramClasses(facility.id, description || '');
      }

      this.store.incrementCurrentStep();
    }
  }

  onCancel(): void {
    this.router.navigate(['/home/programming']);
  }

  goBack() {
    this.store.decrementCurrentStep();
  }

  async onSave(): Promise<void> {
    this.errorMessage.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.store.programClasses().length === 0) {
      this.errorMessage.set('No se han seleccionado horarios');
      return;
    }

    const facility = this.facility();

    if (!facility?.id) {
      this.errorMessage.set('No se ha seleccionado una facilidad');
      return;
    }

    try {
      await this.store.saveProgramClasses(facility.id);
      this.router.navigate(['/home/programming']);
    } catch (error) {
      this.errorMessage.set('Error al guardar la programación');
      this.logger.error('Error saving program:', error);
    }
  }


}
