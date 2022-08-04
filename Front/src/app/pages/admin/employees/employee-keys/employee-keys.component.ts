import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { Key } from 'src/app/models/key.model';
import { Employee } from 'src/app/pages/models/employee-model';
import { FullNamePipe } from 'src/app/utils/pipes/full-name.pipe';

@Component({
  selector: 'app-employee-keys',
  templateUrl: './employee-keys.component.html',
  styleUrls: ['./employee-keys.component.scss'],
})
export class EmployeeKeysComponent implements OnInit {
  keys: Key[] = [];
  breakpoint: number = 0;
  searchText: string = '';
  employeeName: string = '';

  constructor(
    protected readonly dialog: MatDialog,
    private readonly activatedRoute: ActivatedRoute,
    private readonly fullNamePipe: FullNamePipe
  ) {}

  ngOnInit(): void {
    this.setInitialResponsive();
    this.getKeys();
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

  private getKeys(): void {
    this.activatedRoute.data.pipe(take(1)).subscribe((res) => {
      this.keys = res['keys']?.keys;
      this.employeeName = this.fullNamePipe.transform(
        this.keys[0].user as Employee
      );
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
