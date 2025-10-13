import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClassWeekCalendarComponent, ClassCalendarSlot, CalendarColor } from '@ui';
import { SessionSignalStore } from '@front/state/session';
import { Service } from '@models/services';
import { ClassModel } from '@models/classes';
import { ServicesService } from '@front/core/services';
import { ClassesService } from '@front/core/classes';
import { getWeekStart, LoggerService } from '@front/utils';

@Component({
  selector: 'app-services-detail',
  standalone: true,
  imports: [RouterModule, ClassWeekCalendarComponent],
  templateUrl: './services-detail.component.html',
  styleUrls: ['./services-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sessionStore = inject(SessionSignalStore);
  private servicesService = inject(ServicesService);
  private classesService = inject(ClassesService);
  private logger = inject(LoggerService);

  service = signal<Service | null>(null);
  classes = signal<ClassModel[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  serviceId = computed(() => this.route.snapshot.paramMap.get('id') || '');

  classSlots = computed<ClassCalendarSlot<ClassModel>[]>(() => {
    const classes = this.classes();
    const service = this.service();

    if (!service || classes.length === 0) {
      return [];
    }

    return classes.map((cls) => ({
      id: cls.id,
      date: cls.date.toDate(),
      startTime: cls.startAt,
      durationMinutes: cls.duration,
      color: CalendarColor.BLUE,
      displayLabel: cls.startAt,
      displaySubLabel: `${cls.duration} min • ${cls.capacity} plazas<br>${cls.userBookings.length} inscripciones`,
      data: cls,
    }));
  });

  hasClasses = computed(() => this.classSlots().length > 0);

  minClassDate = computed(() => {
    const classes = this.classes();
    if (classes.length === 0) return undefined;

    const dates = classes.map(cls => cls.date.toDate());
    return new Date(Math.min(...dates.map(d => d.getTime())));
  });

  maxClassDate = computed(() => {
    const classes = this.classes();
    if (classes.length === 0) return undefined;

    const dates = classes.map(cls => cls.date.toDate());
    return new Date(Math.max(...dates.map(d => d.getTime())));
  });

  constructor() {
    effect(() => {
      const loading = this.sessionStore.loading();
      const facility = this.sessionStore.selectedFacility();
      const serviceId = this.serviceId();

      if (!loading && facility?.id && serviceId) {
        this.loadService(facility.id, serviceId);
        this.loadClasses(facility.id, serviceId);
      }
    });
  }

  private loadService(facilityId: string, serviceId: string): void {
    this.isLoading.set(true);
    this.servicesService.getServiceById(facilityId, serviceId).subscribe({
      next: (service) => {
        this.service.set(service || null);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.logger.error('Error loading service:', error);
        this.errorMessage.set('Error al cargar el servicio');
        this.isLoading.set(false);
      },
    });
  }

  private loadClasses(facilityId: string, serviceId: string): void {
    this.classesService.getClassesByService(facilityId, serviceId, { since: getWeekStart(new Date()) }).then(
      (classes) => {
        this.classes.set(classes);
      },
      (error) => {
        this.logger.error('Error loading classes:', error);
        this.errorMessage.set('Error al cargar las clases');
      },
    );
  }

  onSlotClick(slot: ClassCalendarSlot<ClassModel>): void {
    this.logger.log('Class clicked:', slot);
  }

  goToEdit(): void {
    this.router.navigate(['/home/services', this.serviceId(), 'edit']);
  }

  goToProgramClasses(): void {
    this.router.navigate(['/home/services', this.serviceId(), 'program-classes']);
  }

  goBack(): void {
    this.router.navigate(['/home/services']);
  }
}
