import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom, take } from 'rxjs';
import { LoginService } from 'src/app/auth/login/services/login.service';
import { WorkGroup } from 'src/app/models/work-group.model';
import { WorkgroupsService } from '../../services/workgroups.service';
import { AddNewWorkGroupDialogComponent } from './add-new-work-group-dialog/add-new-work-group-dialog.component';

@Component({
  selector: 'app-work-groups',
  templateUrl: './work-groups.component.html',
  styleUrls: ['./work-groups.component.scss'],
})
export class WorkGroupsComponent implements OnInit {
  breakpoint: number = 0;
  workgroups: WorkGroup[] = [];

  constructor(
    protected readonly dialog: MatDialog,
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

  async openAddNewWorkGroupDialog(): Promise<void> {
    const workgroup = await firstValueFrom(
      this.dialog
        .open<AddNewWorkGroupDialogComponent, any, WorkGroup>(
          AddNewWorkGroupDialogComponent,
          {
            disableClose: true,
            maxWidth: '50%',
            minWidth: '35%',
          }
        )
        .afterClosed()
        .pipe(take(1))
    );
    if (workgroup) {
      this.workgroupsService
        .createWorkgroup(workgroup)
        .pipe(take(1))
        .subscribe((res) => this.workgroups.push(res.workgroup));
    }
  }
  // const index = this.workgroups.findIndex(
  //   (foundWorkgroup) => foundWorkgroup.id === workgroup.id
  // );
  // this.workgroups[index] = res.workgroup;
}
