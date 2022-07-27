import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, take, tap } from 'rxjs';
import { LoginService } from '../auth/login/services/login.service';
import { NotificationComponent } from '../pages/components/notification/notification.component';
import { KeysService } from '../pages/services/keys.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private loginService: LoginService,
    private readonly keysService: KeysService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {}
  canActivate(next: ActivatedRouteSnapshot): Observable<boolean> {
    return this.loginService.validateToken().pipe(
      tap((res) => {
        if (!res) {
          this.router.navigateByUrl('/login');
        } else {
          if (
            next.data['rol'] !== '*' &&
            this.loginService.user.rol !== next.data['rol']
          ) {
            switch (this.loginService.user.rol) {
              case 'COMPANY_MANAGER':
                this.router.navigateByUrl('/admin/my-keys');
                break;
              case 'EMPLOYEE':
                this.router.navigateByUrl('/employee/my-keys');
                break;
            }
          }
          this.keysService
            .transit(this.loginService.user.id as string)
            .pipe(take(1))
            .subscribe((res) => {
              if (res.ok) {
                for (const transit of res.transits) {
                  console.log(transit);
                  this.snackBar.openFromComponent(NotificationComponent, {
                    data: {
                      message:
                        transit.sender.name +
                        ' ' +
                        transit.sender.firstSurname +
                        ' desea compartirte una clave',
                      transitId: transit.id,
                      senderId: transit.sender.id,
                      receiverId: transit.receiver.id,
                      key: transit.key,
                      accept: 'Aceptar',
                      cancel: 'Cancelar',
                    },
                  });
                }
              }
            });
        }
      })
    );
  }
}
