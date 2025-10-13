import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClassCalendarSlot, StepIndicatorComponent } from '@ui';
import { SessionSignalStore } from '@front/state/session';
import { LoggerService } from '@front/utils';
import { ProgrammingStore, ProgramInformationComponent, CoachAssignmentComponent } from '@front/core/classes';
import { Service, ServiceSchedule } from '@models/services';
import { ServicesService } from '@front/core/services';

@Component({
  selector: 'app-services-program-classes',
  imports: [ReactiveFormsModule, RouterModule, StepIndicatorComponent, ProgramInformationComponent, CoachAssignmentComponent],
  providers: [ProgrammingStore],
  templateUrl: './services-program-classes.component.html',
  styleUrls: ['./services-program-classes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesProgramClassesComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sessionStore = inject(SessionSignalStore);
  private fb = inject(FormBuilder);
  private logger = inject(LoggerService);
  private servicesService = inject(ServicesService);
  store = inject(ProgrammingStore);

  serviceId = signal<string>('');
  service = signal<Service | null>(null);
  errorMessage = signal('');
  currentStep = computed(() => this.store.currentStep());

  form: FormGroup;

  stepDefinitions = signal([
    { id: 'program-info', label: 'Información del programa' },
    { id: 'coach-assignment', label: 'Asignar coaches' }
  ]);

  constructor() {
    this.form = this.fb.group({
      description: [''],
    });

    effect(() => {
      const loading = this.sessionStore.loading();
      const facility = this.sessionStore.selectedFacility();
      const id = this.route.snapshot.paramMap.get('id');

      if (!loading && facility?.id && id) {
        this.serviceId.set(id);
        this.store.setServiceId(id);
        this.loadService(facility.id, id);
        this.store.loadSchedules({ facilityId: facility.id, serviceId: id });
        this.store.loadEmployees(facility.id);
      }
    });
  }

  private loadService(facilityId: string, serviceId: string): void {
    this.servicesService.getServiceById(facilityId, serviceId).subscribe({
      next: (service) => {
        this.service.set(service || null);
      },
      error: (error) => {
        this.logger.error('Error loading service:', error);
        this.errorMessage.set('Error al cargar el servicio');
      },
    });
  }

  onSlotClick(event: ClassCalendarSlot<ServiceSchedule>): void {
    this.store.setSlotSelection(event.id, !event.isSelected);
  }
  onDaySelect(slots: ClassCalendarSlot<ServiceSchedule>[]): void {
    const noSelect = slots.some(slot => !slot.isSelected)
    if (noSelect) {
      slots.forEach(slot => {
        this.store.setSlotSelection(slot.id, true);
      });
    } else {
      slots.forEach(slot => {
        this.store.setSlotSelection(slot.id, false);
      });
    }
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
      return this.store.activeSlots().length > 0;
    }
    return true;
  }

  goToNextStep(): void {
    if (this.store.currentStep() === 1 && this.canProceedToNextStep()) {
      const { description } = this.form.value;
      const facility = this.sessionStore.selectedFacility();

      if (facility?.id) {
        this.store.generateProgramClasses(facility.id, description || '');
      }

      this.store.incrementCurrentStep();
    }
  }

  onCancel(): void {
    this.router.navigate(['/home/services', this.serviceId()]);
  }

  goBack(): void {
    this.store.decrementCurrentStep();
  }

  async onSave(): Promise<void> {
    this.errorMessage.set('');
    if (this.store.programClasses().length === 0) {
      this.errorMessage.set('No se han seleccionado horarios');
      return;
    }

    const facility = this.sessionStore.selectedFacility();

    if (!facility?.id) {
      this.errorMessage.set('No se ha seleccionado una facilidad');
      return;
    }

    try {
      await this.store.saveProgramClasses(facility.id);
      this.router.navigate(['/home/services', this.serviceId()]);
    } catch (error) {
      this.errorMessage.set('Error al guardar la programación');
      this.logger.error('Error saving program:', error);
    }
  }
}

