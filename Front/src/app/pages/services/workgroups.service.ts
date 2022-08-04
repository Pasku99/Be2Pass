import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Workgroup } from 'src/app/models/work-group.model';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;
const version = environment.version;

@Injectable({
  providedIn: 'root',
})
export class WorkgroupsService {
  constructor(private http: HttpClient) {}

  getWorkgroups(companyId: string, userId: string): Observable<any> {
    return this.http.get(
      `${base_url}/${version}/workgroups/company/${companyId}/user/${userId}`,
      this.headers
    );
  }

  getWorkgroupsKeys(
    companyId: string,
    userId: string,
    workgroupId: string
  ): Observable<any> {
    return this.http.get(
      `${base_url}/${version}/workgroups/company/${companyId}/user/${userId}/workgroup/${workgroupId}`,
      this.headers
    );
  }

  createWorkgroup(workgroup: Workgroup): Observable<any> {
    return this.http.post(
      `${base_url}/${version}/workgroups`,
      workgroup,
      this.headers
    );
  }

  getEmployeeWorkgroups(companyId: string, userId: string): Observable<any> {
    return this.http.get(
      `${base_url}/${version}/workgroups/employee/company/${companyId}/user/${userId}`,
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
