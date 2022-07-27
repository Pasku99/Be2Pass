import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, take, tap } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { environment } from 'src/environments/environment';
import { UserLogin } from '../models/login.model';

const base_url = environment.base_url;
const version = environment.version;

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  user: User = {} as User;

  constructor(private http: HttpClient, protected readonly router: Router) {}

  login(user: UserLogin): Observable<any> {
    return this.http.post(`${base_url}/${version}/login`, user).pipe(
      tap((res: any) => {
        localStorage.setItem('x-token', res.user?.token);
        this.user = res.user;
      })
    );
  }

  isAuthenticated(): Observable<any> {
    return this.http.get(`${base_url}/${version}/login/token`, this.headers);
  }

  validate(correct: boolean, incorrect: boolean): Observable<boolean> {
    if (this.token === '') {
      return of(incorrect);
    }
    return this.isAuthenticated().pipe(
      take(1),
      tap((res) => {
        localStorage.setItem('x-token', res.user?.token);
        this.user = res.user;
      }),
      map(() => {
        return correct;
      }),
      catchError(() => {
        localStorage.removeItem('x-token');
        return of(incorrect);
      })
    );
  }

  validateToken(): Observable<boolean> {
    return this.validate(true, false);
  }

  validateNoToken(): Observable<boolean> {
    return this.validate(false, true);
  }

  logout(): void {
    localStorage.removeItem('x-token');
    this.router.navigateByUrl('login');
  }

  get headers(): any {
    return {
      headers: {
        'x-token': localStorage.getItem('x-token') || '',
      },
    };
  }

  get token(): string {
    return localStorage.getItem('x-token') || '';
  }
}
