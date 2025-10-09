import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ClassWeekCalendarComponent, ClassCalendarSlot } from '@ui';
import { SessionSignalStore } from '@front/state/session';
import { Service } from '@models/services';
import { ServicesService } from '@front/core/services';
import { ClassesService } from '@front/core/classes';
import { ClassModel } from '@models/classes';

@Component({
  selector: 'app-programming-list',
  standalone: true,
  imports: [RouterModule, ClassWeekCalendarComponent],
  templateUrl: './programming-list.component.html',
  styleUrls: ['./programming-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgrammingListComponent {
  private sessionStore = inject(SessionSignalStore);
  private servicesService = inject(ServicesService);
  private classesService = inject(ClassesService);

  services = signal<Service[]>([]);
  classes = signal<ClassModel[]>([]);
  isLoading = signal(false);

  classSlots = computed<ClassCalendarSlot<ClassModel>[]>(() => {
    const classes = this.classes();
    const services = this.services();

    if (classes.length === 0 || services.length === 0) return [];

    const allSlots: ClassCalendarSlot<ClassModel>[] = [];

    classes.forEach(cls => {
      const service = services.find(s => s.id === cls.serviceId);
      if (service) {
        allSlots.push({
          id: cls.id,
          date: cls.date.toDate(),
          startTime: cls.startAt,
          durationMinutes: cls.duration,
          categoryId: service.id, // Use service ID as categoryId for color grouping
          displayLabel: service.name,
          displaySubLabel: `${cls.startAt} - ${cls.capacity} plazas`,
          data: cls
        });
      }
    });

    return allSlots;
  });

  hasClasses = computed<boolean>(() => {
    return this.classSlots().length > 0;
  });

  constructor() {
    effect(() => {
      const facility = this.sessionStore.selectedFacility();
      if (facility?.id) {
        this.loadServices(facility.id);
        this.loadClasses(facility.id);
      }
    });
  }

  private loadServices(facilityId: string): void {
    this.isLoading.set(true);
    this.servicesService.getAllServices(facilityId).subscribe({
      next: (services) => {
        this.services.set(services);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  private loadClasses(facilityId: string): void {
    this.classesService.getAllClasses(facilityId).subscribe({
      next: (classes) => {
        this.classes.set(classes);
      },
      error: () => {
        this.classes.set([]);
      },
    });
  }

  onSlotClick(slot: ClassCalendarSlot<ClassModel>): void {
    console.log('Class clicked:', slot);
  }
}
