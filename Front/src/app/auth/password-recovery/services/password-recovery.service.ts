import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PasswordRecovery } from '../models/password-recovery.model';

const base_url = environment.base_url;
const version = environment.version;

@Injectable({
  providedIn: 'root',
})
export class PasswordRecoveryService {
  constructor(private http: HttpClient) {}

  passwordRecovery(passwordRecovery: PasswordRecovery): Observable<any> {
    return this.http.put(
      `${base_url}/${version}/login/password-recovery`,
      passwordRecovery
    );
  }

  sendPasswordRecovery(email: string): Observable<any> {
    return this.http.post(`${base_url}/${version}/login/password-recovery`, {
      email: email,
    });
  }
}
