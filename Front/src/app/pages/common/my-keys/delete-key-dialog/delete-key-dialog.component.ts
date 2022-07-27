import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-key-dialog',
  templateUrl: './delete-key-dialog.component.html',
  styleUrls: ['./delete-key-dialog.component.scss'],
})
export class DeleteKeyDialogComponent implements OnInit {
  constructor(
    protected readonly dialogRef: MatDialogRef<DeleteKeyDialogComponent>
  ) {}

  ngOnInit() {}

  save(): void {}

  close(): void {
    this.dialogRef.close();
  }
}
