import { ChangeDetectionStrategy, Component, input, output, OnDestroy, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProgramDraft } from '@models/classes';
import { NgxEditorComponent, NgxEditorMenuComponent, Editor, Toolbar } from 'ngx-editor';

@Component({
  selector: 'lib-program-description',
  templateUrl: './program-description.component.html',
  styleUrls: ['./program-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgxEditorComponent, NgxEditorMenuComponent],
})
export class ProgramDescriptionComponent implements OnDestroy {
  programs = input.required<ProgramDraft[]>();

  descriptionChange = output<{ programId: string; description: string }>();

  editors: Record<string, Editor> = {};

  toolbar: Toolbar = [
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['blockquote'],
    ['ordered_list', 'bullet_list'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
    ['undo', 'redo'],
  ];

  constructor() {
    effect(() => {
      const programs = this.programs();
      programs.forEach((program) => {
        if (!this.editors[program.id]) {
          this.editors[program.id] = new Editor();
        }
      });
    });
  }

  ngOnDestroy(): void {
    Object.values(this.editors).forEach((editor) => editor.destroy());
  }

  getEditor(programId: string): Editor {
    return this.editors[programId];
  }

  onDescriptionChange(programId: string, description: string): void {
    this.descriptionChange.emit({ programId, description });
  }
}

