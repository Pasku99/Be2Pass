import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom, take } from 'rxjs';
import { LoginService } from 'src/app/auth/login/services/login.service';
import { Employee } from 'src/app/pages/models/employee-model';
import { EmployeesService } from '../services/employees.service';
import { RegisterSingleEmployeeDialogComponent } from './register-single-employee-dialog/register-single-employee-dialog.component';

@Component({
  selector: 'app-register-employee-dialog',
  templateUrl: './register-employee-dialog.component.html',
  styleUrls: ['./register-employee-dialog.component.scss'],
})
export class RegisterEmployeeComponentDialog {
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  employees: Employee[] = [];

  constructor(
    protected readonly dialog: MatDialog,
    private readonly employeesService: EmployeesService,
    private readonly loginService: LoginService,
    private dialogRef: MatDialogRef<RegisterEmployeeComponentDialog>
  ) {}

  ngOnInit(): void {}

  save(): void {
    this.employeesService
      .createEmployees(this.employees, this.loginService.user.id as string)
      .pipe(take(1))
      .subscribe((res) => {
        this.dialogRef.close(res.employees);
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  remove(employee: Employee): void {
    const index = this.employees.indexOf(employee);

    if (index >= 0) {
      this.employees.splice(index, 1);
    }
  }

  async openRegisterSingleEmployeeDialog(): Promise<void> {
    const employee = await firstValueFrom(
      this.dialog
        .open<RegisterSingleEmployeeDialogComponent, any, Employee>(
          RegisterSingleEmployeeDialogComponent,
          {
            disableClose: true,
            maxWidth: '50%',
            minWidth: '35%',
          }
        )
        .afterClosed()
        .pipe(take(1))
    );
    if (employee) {
      this.employees.push(employee);
    }
  }
}
