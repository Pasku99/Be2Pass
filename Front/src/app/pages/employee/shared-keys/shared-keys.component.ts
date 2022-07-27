import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { LoginService } from 'src/app/auth/login/services/login.service';
import { EmployeesService } from '../../admin/employees/services/employees.service';
import { Employee } from '../../models/employee-model';

@Component({
  selector: 'app-shared-keys',
  templateUrl: './shared-keys.component.html',
  styleUrls: ['./shared-keys.component.scss'],
})
export class SharedKeysComponent implements OnInit {
  breakpoint: number = 0;
  employees: Employee[] = [];

  constructor(
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
      .getSharedEmployees(
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
}
