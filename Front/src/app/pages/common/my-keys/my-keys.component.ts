import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, take } from 'rxjs';
import { Key } from 'src/app/models/key.model';
import { CreateKeyDialogComponent } from './create-key-dialog/create-key-dialog.component';

@Component({
  selector: 'app-my-keys',
  templateUrl: './my-keys.component.html',
  styleUrls: ['./my-keys.component.scss'],
})
export class MyKeysComponent implements OnInit {
  keys: Key[] = [];
  breakpoint: number = 0;
  searchText: string = '';

  constructor(
    protected readonly dialog: MatDialog,
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

  async openCreateKeyDialog(): Promise<void> {
    const key = await firstValueFrom(
      this.dialog
        .open<CreateKeyDialogComponent, any, Key>(CreateKeyDialogComponent, {
          disableClose: true,
          maxWidth: '50%',
          minWidth: '35%',
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
