import { ChangeDetectionStrategy, Component, input, output, signal, OnDestroy } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Service, ServiceSchedule } from '@models/services';
import { DateCalendarSlot, SelectModule, DateWeekCalendarComponent } from '@ui';
import { NgxEditorComponent, NgxEditorMenuComponent, Editor, Toolbar } from 'ngx-editor';

@Component({
  selector: 'app-program-information',
  templateUrl: './program-information.component.html',
  styleUrls: ['./program-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgxEditorComponent, NgxEditorMenuComponent, SelectModule, DateWeekCalendarComponent, ReactiveFormsModule],
})
export class ProgramInformationComponent implements OnDestroy {
  form = input.required<FormGroup>();
  services = input.required<Service[]>();
  dateCalendarSlots = input.required<DateCalendarSlot<ServiceSchedule>[]>();

  slotClick = output<{ slotId: string; isSelected: boolean }>();
  weekChange = output<{ start: Date; end: Date }>();

  editor: Editor = new Editor();
  toolbar: Toolbar = [
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['blockquote'],
    ['ordered_list', 'bullet_list'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
    ['undo', 'redo']
  ];

  minDate = signal<Date>(new Date());
  maxDate = signal<Date>((() => {
    const today = new Date();
    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(today.getDate() + (7 - today.getDay() + 1));
    const lastDayOfNextWeek = new Date(nextWeekStart);
    lastDayOfNextWeek.setDate(nextWeekStart.getDate() + 6);
    lastDayOfNextWeek.setHours(23, 59, 59, 999);
    return lastDayOfNextWeek;
  })());

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  onSlotClick(event: { slotId: string; isSelected: boolean }): void {
    this.slotClick.emit(event);
  }

  onWeekChange(weekRange: { start: Date; end: Date }): void {
    this.weekChange.emit(weekRange);
  }
}
