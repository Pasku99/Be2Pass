import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserRegister } from '../models/register.model';

const base_url = environment.base_url;
const version = environment.version;

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  constructor(private http: HttpClient) {}

  registerCompanyAndManager(user: UserRegister): Observable<any> {
    return this.http.post(`${base_url}/${version}/users/manager`, user);
  }
}
