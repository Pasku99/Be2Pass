import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { firstValueFrom, take } from 'rxjs';
import { LoginService } from 'src/app/auth/login/services/login.service';
import { Key } from 'src/app/models/key.model';
import { CreateKeyDialogComponent } from 'src/app/pages/common/my-keys/create-key-dialog/create-key-dialog.component';
import { WorkgroupsService } from 'src/app/pages/services/workgroups.service';

@Component({
  selector: 'app-work-groups-keys',
  templateUrl: './work-groups-keys.component.html',
  styleUrls: ['./work-groups-keys.component.scss'],
})
export class WorkGroupsKeysComponent implements OnInit {
  breakpoint: number = 0;
  keys: Key[] = [];
  searchText: string = '';
  workgroupId: string = '';

  constructor(
    protected readonly dialog: MatDialog,
    private readonly workgroupsService: WorkgroupsService,
    private readonly loginService: LoginService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getWorkgroupsKeys();
    this.setInitialResponsive();
  }

  private getWorkgroupsKeys(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.workgroupId = params.get('workgroupId') as string;
      this.workgroupsService
        .getWorkgroupsKeys(
          this.loginService.user.companyId as string,
          this.loginService.user.id as string,
          this.workgroupId
        )
        .pipe(take(1))
        .subscribe((res) => (this.keys = res.keys));
    });
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

  async openCreateKeyDialog(): Promise<void> {
    const key = await firstValueFrom(
      this.dialog
        .open<CreateKeyDialogComponent, any, Key>(CreateKeyDialogComponent, {
          disableClose: true,
          maxWidth: '50%',
          minWidth: '35%',
          data: {
            isWorkgroupKey: true,
            workgroupId: this.workgroupId,
          },
        })
        .afterClosed()
        .pipe(take(1))
    );
    if (key) this.keys.push(key);
  }

  search(): void {
    if (this.searchText !== '') {
      let searchValue = this.searchText.toLocaleLowerCase();
      this.keys = this.keys.filter((key) =>
        key.service?.toLocaleLowerCase().match(searchValue)
      );
    } else {
      this.ngOnInit();
    }
  }
}
