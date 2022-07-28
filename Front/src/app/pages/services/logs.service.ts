import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;
const version = environment.version;

@Injectable({
  providedIn: 'root',
})
export class LogsService {
  constructor(private readonly http: HttpClient) {}

  getAdminLogs(userId: string, companyId: string): Observable<any> {
    return this.http.get(
      `${base_url}/${version}/users/logs?userId=${userId}&companyId=${companyId}`,
      this.headers
    );
  }

  get headers(): any {
    return {
      headers: {
        'x-token': localStorage.getItem('x-token') || '',
      },
    };
  }
}
