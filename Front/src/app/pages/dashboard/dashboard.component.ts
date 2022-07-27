import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { MediaMatcher } from '@angular/cdk/layout';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { LoginService } from 'src/app/auth/login/services/login.service';
import { ComModalGeneralComponent } from '../components/com-modal-general/com-modal-general.component';
import { ModalGeneralModel } from '../components/com-modal-general/models/modal-general.model';

export const COMPANY_MANAGER = 'COMPANY_MANAGER';
export const EMPLOYEE = 'EMPLOYEE';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('menubtn', [
      state(
        'true',
        style({
          transform: 'rotate(90deg)',
        })
      ),
      state(
        'false',
        style({
          transform: 'rotate(0deg)',
        })
      ),
      transition('* => *', animate('300ms ease-in-out')),
    ]),
  ],
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  loadCompleted = false;
  mobileQuery!: MediaQueryList;
  sections = [
    {
      name: '',
      routerlink: '',
      icon: '',
    },
  ];

  private _mobileQueryListener!: () => void;

  constructor(
    public dialog: MatDialog,
    readonly changeDetectorRef: ChangeDetectorRef,
    readonly media: MediaMatcher,
    private router: Router,
    private readonly translate: TranslateService,
    private readonly loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.setupListeners();
  }

  ngAfterViewInit(): void {
    this.loadCompleted = true;
  }

  setupListeners(): void {
    this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', () => {
      this._mobileQueryListener;
    });
    this.sections =
      this.loginService.user.rol === COMPANY_MANAGER
        ? [
            {
              name: this.translate.instant('work_groups'),
              routerlink: '/admin/work-groups',
              icon: 'group_work',
            },
            {
              name: this.translate.instant('my_keys'),
              routerlink: '/admin/my-keys',
              icon: 'vpn_key',
            },
            {
              name: this.translate.instant('employees'),
              routerlink: '/admin/employees',
              icon: 'group',
            },
          ]
        : [
            {
              name: this.translate.instant('work_groups'),
              routerlink: '/employee/work-groups',
              icon: 'group_work',
            },
            {
              name: this.translate.instant('my_keys'),
              routerlink: '/employee/my-keys',
              icon: 'vpn_key',
            },
            {
              name: this.translate.instant('Claves compartidas'),
              routerlink: '/employee/shared-keys',
              icon: 'group',
            },
          ];
  }

  getMenuBtnToggle(snav: boolean): boolean {
    return snav ? true : false;
  }

  signOut(): void {
    const aux: ModalGeneralModel = new ModalGeneralModel(
      this.translate.instant('logout'),
      '',
      'logout',
      this.translate.instant('do_you_want_to_close_session'),
      '',
      []
    );
    this.dialog
      .open(ComModalGeneralComponent, {
        width: 'auto',
        data: aux,
        panelClass: 'modal-general',
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (result) {
          localStorage.removeItem('x-token');
          this.router.navigateByUrl('login');
          return true;
        } else {
          return false;
        }
      });
  }

  linkActive(sec: string): boolean {
    return this.router.url === sec;
  }

  setLanguageSpanish(): void {
    this.translate.setDefaultLang('es');
  }

  setLanguageEnglish(): void {
    this.translate.setDefaultLang('en');
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
}
