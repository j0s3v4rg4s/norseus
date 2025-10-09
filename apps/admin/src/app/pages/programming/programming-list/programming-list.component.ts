import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ClassWeekCalendarComponent, ClassCalendarSlot, CalendarColor, ClassCalendarLegendItem } from '@ui';
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

  private readonly colorPalette: CalendarColor[] = [
    CalendarColor.BLUE,
    CalendarColor.GREEN,
    CalendarColor.PURPLE,
    CalendarColor.ORANGE,
    CalendarColor.PINK,
    CalendarColor.INDIGO,
    CalendarColor.TEAL,
    CalendarColor.ROSE,
  ];

  classSlots = signal<ClassCalendarSlot<ClassModel>[]>([]);

  hasClasses = computed<boolean>(() => {
    return this.classSlots().length > 0;
  });

  legendItems = signal<ClassCalendarLegendItem[]>([]);

  filteredClassSlots = computed<ClassCalendarSlot<ClassModel>[]>(() => {
    const slots = this.classSlots();
    const legendItems = this.legendItems();

    if (legendItems.length === 0) {
      return slots;
    }

    const visibleServiceIds = legendItems.filter((item) => item.visible).map((item) => item.id);

    return slots.filter((slot) => {
      const serviceId = slot.data?.serviceId;
      return serviceId && visibleServiceIds.includes(serviceId);
    });
  });

  constructor() {
    effect(() => {
      const facility = this.sessionStore.selectedFacility();
      if (facility?.id) {
        this.loadServices(facility.id);
        this.loadClasses(facility.id);
      }
    });

    effect(() => {
      const classes = this.classes();
      const services = this.services();
      this.generateClassSlots(classes, services);
    });
  }

  private generateClassSlots(classes: ClassModel[], services: Service[]) {
    if (classes.length === 0 || services.length === 0) {
      this.classSlots.set([]);
      return;
    }

    const serviceColorMap = this.generateServiceColorMap(classes, services);
    const allSlots: ClassCalendarSlot<ClassModel>[] = [];

    const legendItems = Object.keys(serviceColorMap).reduce((acc, serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        acc.push({
          id: serviceId,
          color: serviceColorMap[serviceId],
          serviceName: service?.name || '',
          visible: true,
        });
      }
      return acc;
    }, [] as ClassCalendarLegendItem[]);

    this.legendItems.set(legendItems);

    classes.forEach((cls) => {
      const service = services.find((s) => s.id === cls.serviceId);
      if (service) {
        const color = serviceColorMap[service.id];
        if (color) {
          allSlots.push({
            id: cls.id,
            date: cls.date.toDate(),
            startTime: cls.startAt,
            durationMinutes: cls.duration,
            color,
            displayLabel: service.name,
            displaySubLabel: `${cls.startAt} - ${cls.capacity} plazas <br> ${cls.userBookings.length} inscripciones`,
            data: cls,
          });
        }
      }
    });

    this.classSlots.set(allSlots);
  }

  private generateServiceColorMap(classes: ClassModel[], services: Service[]): Record<string, CalendarColor> {
    const serviceColorMap: Record<string, CalendarColor> = {};
    const uniqueServiceIds = new Set(classes.map((cls) => cls.serviceId));
    let colorIndex = 0;

    uniqueServiceIds.forEach((serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        serviceColorMap[serviceId] = this.colorPalette[colorIndex % this.colorPalette.length];
        colorIndex++;
      }
    });

    return serviceColorMap;
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

  onLegendToggle(item: ClassCalendarLegendItem): void {
    const currentLegendItems = this.legendItems();
    const updatedLegendItems = currentLegendItems.map((legendItem) =>
      legendItem.id === item.id ? { ...legendItem, visible: !legendItem.visible } : legendItem,
    );

    this.legendItems.set(updatedLegendItems);
  }
}
