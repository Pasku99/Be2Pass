import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
export interface DialogData {
  title: string;
  subtitle: string;
  icon: string;
  message: string;
  action: string;
  data: [];
}
@Component({
  selector: 'app-com-modal-general',
  templateUrl: './com-modal-general.component.html',
  styleUrls: ['./com-modal-general.component.scss']
})
export class ComModalGeneralComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ComModalGeneralComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {}

  accept(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
