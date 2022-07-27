import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginService } from '../auth/login/services/login.service';

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}
  canActivate(): Observable<boolean> {
    return this.loginService.validateNoToken().pipe(
      tap((res) => {
        if (!res) {
          switch (this.loginService.user.rol) {
            case 'COMPANY_MANAGER':
              this.router.navigateByUrl('/admin/my-keys');
              break;
            case 'EMPLOYEE':
              this.router.navigateByUrl('/employee/my-keys');
              break;
          }
        }
      })
    );
  }
}
