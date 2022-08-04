import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, take } from 'rxjs';
import { LoginService } from 'src/app/auth/login/services/login.service';
import { Key } from 'src/app/models/key.model';
import { KeysService } from 'src/app/pages/services/keys.service';

@Injectable({ providedIn: 'root' })
export class EmployeesKeysResolver implements Resolve<Key[]> {
  constructor(
    private readonly keysService: KeysService,
    private readonly loginService: LoginService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<Key[]> | Promise<Key[]> | Key[] {
    return this.keysService
      .getEmployeesKeys(
        this.loginService.user.companyId as string,
        this.loginService.user.id as string,
        route.paramMap.get('employeeId') as string
      )
      .pipe(take(1));
  }
}
