import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StepIndicatorComponent } from '@ui';
import { SessionSignalStore } from '@front/state/session';
import { LoggerService } from '@front/utils';
import { ProgrammingStore, ProgramInformationComponent, ProgramDescriptionComponent, CoachAssignmentComponent } from '@front/core/classes';
import { Service } from '@models/services';
import { ServicesService } from '@front/core/services';

@Component({
  selector: 'app-services-program-classes',
  imports: [RouterModule, StepIndicatorComponent, ProgramInformationComponent, ProgramDescriptionComponent, CoachAssignmentComponent],
  providers: [ProgrammingStore],
  templateUrl: './services-program-classes.component.html',
  styleUrls: ['./services-program-classes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesProgramClassesComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sessionStore = inject(SessionSignalStore);
  private logger = inject(LoggerService);
  private servicesService = inject(ServicesService);
  store = inject(ProgrammingStore);

  serviceId = signal<string>('');
  service = signal<Service | null>(null);
  errorMessage = signal('');
  currentStep = computed(() => this.store.currentStep());

  stepDefinitions = signal([
    { id: 'program-creation', label: 'Crear programas' },
    { id: 'program-description', label: 'Descripción de programas' },
    { id: 'coach-assignment', label: 'Asignar coaches' }
  ]);

  constructor() {
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

  onProgramCreate(): void {
    this.store.createProgram();
  }

  onProgramEdit(programId: string): void {
    this.store.editProgram(programId);
  }

  onProgramUpdate(update: { programId: string; title?: string; slotIds?: string[] }): void {
    this.store.updateProgram(update);
  }

  onProgramConfirm(programId: string): void {
    this.store.confirmProgram(programId);
  }

  onProgramDelete(programId: string): void {
    this.store.deleteProgram(programId);
  }

  onProgramCancelEdit(programId: string): void {
    this.store.cancelEditProgram(programId);
  }

  onWeekChange(weekRange: { start: Date; end: Date }): void {
    this.store.generateDateCalendarSlots(weekRange.start, weekRange.end);
  }

  onDescriptionChange(event: { programId: string; description: string }): void {
    this.store.updateProgramDescription(event.programId, event.description);
  }

  onCoachAssignment(event: { programId: string; slotId: string; instructorId: string }): void {
    this.store.setProgramCoachAssignment(event.programId, event.slotId, event.instructorId);
  }

  onSameCoachForAll(event: { programId: string; instructorId: string }): void {
    this.store.assignSameCoachToProgram(event.programId, event.instructorId);
  }

  onClearCoachAssignment(event: { programId: string; instructorId: string }): void {
    this.store.clearProgramCoachAssignment(event.programId, event.instructorId);
  }

  canProceedToNextStep(): boolean {
    const currentStep = this.store.currentStep();
    if (currentStep === 1) {
      return this.store.confirmedPrograms().length > 0;
    }
    return true;
  }

  goToNextStep(): void {
    if (this.canProceedToNextStep()) {
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

    const confirmedPrograms = this.store.confirmedPrograms();
    if (confirmedPrograms.length === 0) {
      this.errorMessage.set('No se han creado programas');
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

