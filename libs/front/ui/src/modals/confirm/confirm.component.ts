import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { ButtonComponent } from '@p1kka/ui/src/actions';

@Component({
  selector: 'ui-confirm-modal',
  imports: [MatDialogModule, ButtonComponent],
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.scss',
})
export class ConfirmComponent {
  /* ************************************************************************** */
  /* * PUBLIC INJECTIONS                                                      * */
  /* ************************************************************************** */

  readonly data = inject(MAT_DIALOG_DATA) as { message: string };

  /* ************************************************************************** */
  /* * PRIVATE INJECTIONS                                                     * */
  /* ************************************************************************** */

  private dialogRef = inject(MatDialogRef<ConfirmComponent>);

  /* ************************************************************************** */
  /* * PUBLIC METHODS                                                         * */
  /* ************************************************************************** */

  cancel() {
    this.dialogRef.close(false);
  }

  confirm() {
    this.dialogRef.close(true);
  }
}
