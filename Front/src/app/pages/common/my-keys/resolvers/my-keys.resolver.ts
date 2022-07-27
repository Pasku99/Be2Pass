import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, take } from 'rxjs';
import { LoginService } from 'src/app/auth/login/services/login.service';
import { Key } from 'src/app/models/key.model';
import { KeysService } from 'src/app/pages/services/keys.service';

@Injectable({ providedIn: 'root' })
export class MyKeysResolver implements Resolve<Key[]> {
  constructor(
    private readonly keysService: KeysService,
    private readonly loginService: LoginService
  ) {}

  resolve(): Observable<Key[]> | Promise<Key[]> | Key[] {
    return this.keysService
      .getMyKeys(this.loginService.user.id as string)
      .pipe(take(1));
  }
}
