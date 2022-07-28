import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, take } from 'rxjs';
import { LoginService } from 'src/app/auth/login/services/login.service';
import { Key } from 'src/app/models/key.model';
import { KeysService } from 'src/app/pages/services/keys.service';
import { LogsService } from 'src/app/pages/services/logs.service';

@Injectable({ providedIn: 'root' })
export class AdminLogsResolveer implements Resolve<Key[]> {
  constructor(
    private readonly logsService: LogsService,
    private readonly loginService: LoginService
  ) {}

  resolve(): Observable<Key[]> | Promise<Key[]> | Key[] {
    return this.logsService
      .getAdminLogs(
        this.loginService.user.id as string,
        this.loginService.user.companyId as string
      )
      .pipe(take(1));
  }
}
