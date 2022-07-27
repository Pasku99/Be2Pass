import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, take } from 'rxjs';
import { LoginService } from 'src/app/auth/login/services/login.service';
import { Key } from 'src/app/models/key.model';
import { WorkgroupsService } from '../../services/workgroups.service';

@Injectable({ providedIn: 'root' })
export class WorkgroupsEmployeesResolver implements Resolve<Key[]> {
  constructor(
    private readonly workgroupsService: WorkgroupsService,
    private readonly loginService: LoginService
  ) {}

  resolve(): Observable<Key[]> | Promise<Key[]> | Key[] {
    return this.workgroupsService
      .getEmployeeWorkgroups(
        this.loginService.user.companyId as string,
        this.loginService.user.id as string
      )
      .pipe(take(1));
  }
}
