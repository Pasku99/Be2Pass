import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { Key } from 'src/app/models/key.model';

@Component({
  selector: 'app-shared-employee-keys',
  templateUrl: './shared-employee-keys.component.html',
  styleUrls: ['./shared-employee-keys.component.scss'],
})
export class SharedEmployeeKeysComponent implements OnInit {
  keys: Key[] = [];
  breakpoint: number = 0;
  searchText: string = '';

  constructor(
    private readonly dialog: MatDialog,
    private readonly activatedRoute: ActivatedRoute
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
    this.activatedRoute.data
      .pipe(take(1))
      .subscribe((res) => (this.keys = res['keys']?.keys));
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
