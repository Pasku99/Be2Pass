import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { LoginService } from 'src/app/auth/login/services/login.service';
import { WorkGroup } from 'src/app/models/work-group.model';
import { WorkgroupsService } from '../../services/workgroups.service';

@Component({
  selector: 'app-work-groups-employees',
  templateUrl: './work-groups-employees.component.html',
  styleUrls: ['./work-groups-employees.component.scss'],
})
export class WorkGroupsEmployeesComponent implements OnInit {
  breakpoint: number = 0;
  workgroups: WorkGroup[] = [];

  constructor(
    private readonly workgroupsService: WorkgroupsService,
    private readonly loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.setInitialResponsive();
    this.getWorkGroups();
  }

  private getWorkGroups(): void {
    this.workgroupsService
      .getWorkgroups(
        this.loginService.user.companyId as string,
        this.loginService.user.id as string
      )
      .pipe(take(1))
      .subscribe((res) => (this.workgroups = res.workgroups));
  }

  private setInitialResponsive(): void {
    this.breakpoint =
      window.innerWidth >= 1600
        ? 4
        : window.innerWidth <= 1190 && window.innerWidth >= 865
        ? 2
        : window.innerWidth < 865
        ? 1
        : 3;
  }

  onResize(event: any): void {
    this.breakpoint =
      event.target.innerWidth >= 1600
        ? 4
        : event.target.innerWidth <= 1190 && event.target.innerWidth >= 865
        ? 2
        : event.target.innerWidth < 865
        ? 1
        : 3;
  }
}
