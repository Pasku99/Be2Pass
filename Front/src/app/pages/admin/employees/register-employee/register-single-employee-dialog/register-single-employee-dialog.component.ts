import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take } from 'rxjs';
import { LoginService } from 'src/app/auth/login/services/login.service';
import { Employee } from 'src/app/pages/models/employee-model';
import { FormBase } from 'src/app/utils/form-controls/form.base';
import { EmployeesService } from '../../services/employees.service';

@Component({
  selector: 'app-register-single-employee-dialog',
  templateUrl: './register-single-employee-dialog.component.html',
  styleUrls: ['./register-single-employee-dialog.component.scss'],
})
export class RegisterSingleEmployeeDialogComponent
  extends FormBase<any>
  implements OnInit
{
  title: string = 'Registrar nuevo empleado';

  constructor(
    protected readonly fb: FormBuilder,
    protected readonly dialogRef: MatDialogRef<RegisterSingleEmployeeDialogComponent>,
    private readonly employeesService: EmployeesService,
    private readonly loginService: LoginService,
    @Inject(MAT_DIALOG_DATA) public employee: Employee
  ) {
    super(fb);
  }

  ngOnInit(): void {
    this.initForm();
    this.setForm(this.employee);
    this.setTitle();
  }

  protected initForm(): void {
    this.form = this.fb.group({
      name: [null, Validators.required],
      firstSurname: [null, Validators.required],
      secondSurname: [null],
      email: [null, [Validators.required, Validators.email]],
    });
  }

  protected setForm(employee: Employee): void {
    this.form.patchValue({
      name: employee?.name,
      firstSurname: employee?.firstSurname,
      secondSurname: employee?.secondSurname,
      email: employee?.email,
    });
  }

  private setTitle(): void {
    if (this.employee) this.title = 'Editar empleado';
  }

  save() {
    if (this.form.valid) {
      if (this.employee) {
        this.employeesService
          .editEmployee(
            this.form.value as Employee,
            this.loginService.user.id as string,
            this.employee.id as string
          )
          .pipe(take(1))
          .subscribe((res) => {
            this.dialogRef.close(res.employee);
          });
      } else {
        this.dialogRef.close(this.form.value);
      }
    }
  }

  close() {
    this.dialogRef.close();
  }
}
