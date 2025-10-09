import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SelectModule, WeekCalendarComponent } from '@ui';
import { SessionSignalStore } from '@front/state/session';
import { Service } from '@models/services';
import { ServicesService, SchedulesService } from '@front/core/services';
import { ServiceSchedule } from '@models/services';
import { CalendarSlot } from '@ui';

@Component({
  selector: 'app-programming-list',
  standalone: true,
  imports: [RouterModule, FormsModule, SelectModule, WeekCalendarComponent],
  templateUrl: './programming-list.component.html',
  styleUrls: ['./programming-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgrammingListComponent {
  private sessionStore = inject(SessionSignalStore);
  private servicesService = inject(ServicesService);
  private schedulesService = inject(SchedulesService);

  services = signal<Service[]>([]);
  schedules = signal<ServiceSchedule[]>([]);
  selectedService = signal<Service | null>(null);
  isLoading = signal(false);

  calendarSlots = computed<CalendarSlot[]>(() => {
    return this.schedules().map((schedule) => ({
      id: schedule.id || '',
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      durationMinutes: schedule.durationMinutes,
      displayLabel: this.selectedService()?.name || '',
      displaySubLabel: `${schedule.startTime}`,
    }));
  });

  constructor() {
    effect(() => {
      const facility = this.sessionStore.selectedFacility();
      if (facility?.id) {
        this.loadServices(facility.id);
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

  onServiceChange(service: Service | null): void {
    this.selectedService.set(service);
    if (service?.id) {
      const facilityId = this.sessionStore.selectedFacility()?.id;
      if (facilityId) {
        this.loadSchedules(facilityId, service.id);
      }
    } else {
      this.schedules.set([]);
    }
  }

  private loadSchedules(facilityId: string, serviceId: string): void {
    this.schedulesService.getAllSchedules(facilityId, serviceId).subscribe({
      next: (schedules) => {
        this.schedules.set(schedules);
      },
      error: () => {
        this.schedules.set([]);
      },
    });
  }

  onSlotClick(slotId: string): void {
    console.log('Slot clicked:', slotId);
  }
}
