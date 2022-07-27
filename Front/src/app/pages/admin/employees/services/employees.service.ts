import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Employee } from 'src/app/pages/models/employee-model';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;
const version = environment.version;

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  constructor(private http: HttpClient) {}

  getEmployees(idAdmin: string, companyId: string): Observable<any> {
    return this.http.get(
      `${base_url}/${version}/users?idAdmin=${idAdmin}&companyId=${companyId}`,
      this.headers
    );
  }

  createEmployees(employees: Employee[], idAdmin: string): Observable<any> {
    return this.http.post(
      `${base_url}/${version}/users`,
      { idAdmin: idAdmin, employees: employees },
      this.headers
    );
  }

  editEmployee(
    employee: Employee,
    idAdmin: string,
    idEmployee: string
  ): Observable<any> {
    return this.http.put(
      `${base_url}/${version}/users/employee?id=${idEmployee}`,
      { idAdmin: idAdmin, ...employee },
      this.headers
    );
  }

  getSharedEmployees(userId: string, companyId: string): Observable<any> {
    return this.http.get(
      `${base_url}/${version}/users/shared?userId=${userId}&companyId=${companyId}`,
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
