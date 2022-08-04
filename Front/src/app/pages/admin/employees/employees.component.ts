import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom, take } from 'rxjs';
import { LoginService } from 'src/app/auth/login/services/login.service';
import { Employee } from '../../models/employee-model';
import { RegisterEmployeeComponentDialog } from './register-employee/register-employee-dialog.component';
import { RegisterSingleEmployeeDialogComponent } from './register-employee/register-single-employee-dialog/register-single-employee-dialog.component';
import { EmployeesService } from './services/employees.service';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
})
export class EmployeesComponent implements OnInit {
  breakpoint: number = 0;
  employees: Employee[] = [];
  searchText: string = '';

  constructor(
    private readonly dialog: MatDialog,
    private readonly employeesService: EmployeesService,
    private readonly loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.setInitialResponsive();
    this.getEmployees();
  }

  private setInitialResponsive(): void {
    this.breakpoint =
      window.innerWidth > 1380
        ? 4
        : window.innerWidth <= 1380 && window.innerWidth >= 900
        ? 3
        : window.innerWidth < 900 && window.innerWidth >= 680
        ? 2
        : 1;
  }

  private getEmployees(): void {
    this.employeesService
      .getEmployees(
        this.loginService.user.id as string,
        this.loginService.user.companyId as string
      )
      .pipe(take(1))
      .subscribe((res) => {
        this.employees = res.employees;
      });
  }

  onResize(event: any): void {
    this.breakpoint =
      event.target.innerWidth > 1380
        ? 4
        : event.target.innerWidth <= 1380 && event.target.innerWidth >= 900
        ? 3
        : event.target.innerWidth < 900 && event.target.innerWidth >= 680
        ? 2
        : 1;
  }

  async openDialog(): Promise<void> {
    const employees = await firstValueFrom(
      this.dialog
        .open<RegisterEmployeeComponentDialog, any, Employee[]>(
          RegisterEmployeeComponentDialog,
          {
            disableClose: true,
            maxWidth: '50%',
            minWidth: '35%',
          }
        )
        .afterClosed()
        .pipe(take(1))
    );
    if (employees) {
      this.employees = this.employees.concat(employees);
    }
  }

  async openEditDialog(selectedEmployee: Employee): Promise<void> {
    const employee = await firstValueFrom(
      this.dialog
        .open<RegisterSingleEmployeeDialogComponent, any, Employee>(
          RegisterSingleEmployeeDialogComponent,
          {
            disableClose: true,
            maxWidth: '50%',
            minWidth: '35%',
            data: selectedEmployee,
          }
        )
        .afterClosed()
        .pipe(take(1))
    );
    if (employee) {
      const index = this.employees.findIndex(
        (foundEmployee) => foundEmployee.id === employee.id
      );
      this.employees[index] = employee;
    }
  }

  search(): void {
    if (this.searchText !== '') {
      let searchValue = this.searchText
        .toLocaleLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      this.employees = this.employees.filter(
        (employee) =>
          employee.name
            ?.toLocaleLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .match(searchValue) ||
          employee.firstSurname
            ?.toLocaleLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .match(searchValue) ||
          employee.secondSurname
            ?.toLocaleLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .match(searchValue)
      );
    } else {
      this.ngOnInit();
    }
  }
}
