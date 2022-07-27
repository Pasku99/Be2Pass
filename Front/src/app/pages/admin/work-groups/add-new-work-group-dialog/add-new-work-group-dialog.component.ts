import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { map, Observable, startWith, take } from 'rxjs';
import { LoginService } from 'src/app/auth/login/services/login.service';
import { Employee } from 'src/app/pages/models/employee-model';
import { FormBase } from 'src/app/utils/form-controls/form.base';
import { EmployeesService } from '../../employees/services/employees.service';

@Component({
  selector: 'app-add-new-work-group-dialog',
  templateUrl: './add-new-work-group-dialog.component.html',
  styleUrls: ['./add-new-work-group-dialog.component.scss'],
})
export class AddNewWorkGroupDialogComponent
  extends FormBase<any>
  implements OnInit
{
  @ViewChild('employeeInput')
  employeeInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto')
  matAutocomplete!: MatAutocomplete;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  employeeControl = new FormControl();
  filteredEmployees!: Observable<String[]>;
  hide: boolean = true;
  chipSelectedEmployees: Employee[] = [];
  allEmployees: Employee[] = [];

  private allowFreeTextAddEmployee: boolean = false;

  constructor(
    protected readonly fb: FormBuilder,
    protected readonly dialogRef: MatDialogRef<AddNewWorkGroupDialogComponent>,
    private readonly employeesService: EmployeesService,
    private readonly loginService: LoginService
  ) {
    super(fb);
  }

  ngOnInit(): void {
    this.initForm();
    this.getEmployees();
  }

  protected initForm(): void {
    this.form = this.fb.group({
      name: [null, Validators.required, Validators.maxLength(25)],
    });
  }

  protected setForm(...args: any[] | { [key: string]: any }[]): void {}

  private getEmployees(): void {
    this.employeesService
      .getEmployees(
        this.loginService.user.id as string,
        this.loginService.user.companyId as string
      )
      .pipe(take(1))
      .subscribe((res) => {
        this.allEmployees = res.employees;
        this.filteredEmployees = this.employeeControl.valueChanges.pipe(
          startWith(null),
          map((employeeEmail) => this.filterOnValueChange(employeeEmail))
        );
      });
  }

  private filterOnValueChange(employeeEmail: string | null): String[] {
    let result: String[] = [];
    let allEmployeesLessSelected = this.allEmployees.filter(
      (employee) => this.chipSelectedEmployees.indexOf(employee) < 0
    );
    if (employeeEmail)
      result = this.filterEmployee(allEmployeesLessSelected, employeeEmail);
    else result = allEmployeesLessSelected.map((employee) => employee.email);

    return result;
  }

  private filterEmployee(
    employeeList: Employee[],
    employeeEmail: String
  ): String[] {
    let filteredEmployeeList: Employee[] = [];
    const filterValue = employeeEmail.toLowerCase();
    let employeesMatchingEmployeeEmail = employeeList.filter(
      (employee) => employee.email.toLowerCase().indexOf(filterValue) === 0
    );
    if (
      employeesMatchingEmployeeEmail.length ||
      this.allowFreeTextAddEmployee
    ) {
      filteredEmployeeList = employeesMatchingEmployeeEmail;
    } else {
      filteredEmployeeList = employeeList;
    }
    return filteredEmployeeList.map((employee) => employee.email);
  }

  addEmployee(event: MatChipInputEvent): void {
    if (!this.allowFreeTextAddEmployee) {
      return;
    }
    if (this.matAutocomplete.isOpen) {
      return;
    }
    const value = event.value;
    if ((value || '').trim()) {
      this.selectEmployeeByName(value.trim());
    }

    this.resetInputs();
  }

  private selectEmployeeByName(employeeEmail: string) {
    let foundEmployee = this.allEmployees.filter(
      (employee) => employee.email == employeeEmail
    );
    if (foundEmployee.length) {
      this.chipSelectedEmployees.push(foundEmployee[0]);
    } else {
      let highestEmployeeId = Math.max(
        ...this.chipSelectedEmployees.map((employee) =>
          parseInt(employee.id as string)
        ),
        0
      );
      this.chipSelectedEmployees.push({
        name: '',
        id: (highestEmployeeId + 1).toString(),
        firstSurname: '',
        secondSurname: '',
        email: employeeEmail,
      });
    }
  }

  removeEmployee(employee: Employee): void {
    const index = this.chipSelectedEmployees.indexOf(employee);
    if (index >= 0) {
      this.chipSelectedEmployees.splice(index, 1);
      this.resetInputs();
    }
  }

  private resetInputs() {
    this.employeeInput.nativeElement.value = '';
    if (this.employeeControl) this.employeeControl.setValue(null);
  }

  employeeSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectEmployeeByName(event.option.value);
    this.resetInputs();
  }

  save(): void {
    this.dialogRef.close({
      name: this.form.get('name')?.value,
      userId: this.loginService.user.id,
      companyId: this.loginService.user.companyId,
      employeesIds: this.chipSelectedEmployees?.map((employee) => ({
        id: employee.id,
      })),
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
