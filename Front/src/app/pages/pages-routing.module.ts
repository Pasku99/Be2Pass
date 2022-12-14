import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { AdminLogsComponent } from './admin/admin-logs/admin-logs.component';
import { AdminLogsResolveer } from './admin/admin-logs/resolvers/admin-log.resolver';
import { EmployeeKeysComponent } from './admin/employees/employee-keys/employee-keys.component';
import { EmployeesComponent } from './admin/employees/employees.component';
import { EmployeesKeysResolver } from './admin/employees/resolvers/employees-keys.resolver';
import { WorkGroupsKeysComponent } from './admin/work-groups/work-groups-keys/work-groups-keys.component';
import { WorkGroupsComponent } from './admin/work-groups/work-groups.component';
import { MyKeysComponent } from './common/my-keys/my-keys.component';
import { MyKeysResolver } from './common/my-keys/resolvers/my-keys.resolver';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedEmployeeKeysResolver } from './employee/resolvers/shared-employee-keys.resolver';
import { WorkgroupsEmployeesResolver } from './employee/resolvers/workgroups-employees.resolver';
import { SharedEmployeeKeysComponent } from './employee/shared-keys/shared-employee-keys/shared-employee-keys.component';
import { SharedKeysComponent } from './employee/shared-keys/shared-keys.component';
import { WorkGroupsEmployeesComponent } from './employee/work-groups-employees/work-groups-employees.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {
    path: 'admin',
    component: DashboardComponent,
    data: {
      rol: 'COMPANY_MANAGER',
    },
    children: [
      {
        path: 'my-keys',
        component: MyKeysComponent,
        canActivate: [AuthGuard],
        resolve: {
          keys: MyKeysResolver,
        },
        data: {
          rol: 'COMPANY_MANAGER',
        },
      },
      {
        path: 'employees',
        component: EmployeesComponent,
        canActivate: [AuthGuard],
        data: {
          rol: 'COMPANY_MANAGER',
        },
      },
      {
        path: 'employees/:employeeId',
        component: EmployeeKeysComponent,
        canActivate: [AuthGuard],
        data: {
          rol: 'COMPANY_MANAGER',
        },
        resolve: { keys: EmployeesKeysResolver },
      },
      {
        path: 'work-groups',
        component: WorkGroupsComponent,
        canActivate: [AuthGuard],
        data: {
          rol: 'COMPANY_MANAGER',
        },
      },
      {
        path: 'work-groups/:workgroupId',
        component: WorkGroupsKeysComponent,
        canActivate: [AuthGuard],
        data: {
          rol: 'COMPANY_MANAGER',
        },
      },
      {
        path: 'logs',
        component: AdminLogsComponent,
        canActivate: [AuthGuard],
        data: {
          rol: 'COMPANY_MANAGER',
        },
        resolve: {
          logs: AdminLogsResolveer,
        },
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard],
        data: {
          rol: 'COMPANY_MANAGER',
        },
      },
    ],
  },
  {
    path: 'employee',
    component: DashboardComponent,
    data: {
      rol: 'EMPLOYEE',
    },
    children: [
      {
        path: 'my-keys',
        component: MyKeysComponent,
        canActivate: [AuthGuard],
        resolve: {
          keys: MyKeysResolver,
        },
        data: {
          rol: 'EMPLOYEE',
        },
      },
      {
        path: 'shared-keys',
        component: SharedKeysComponent,
        canActivate: [AuthGuard],
        data: {
          rol: 'EMPLOYEE',
        },
      },
      {
        path: 'shared-keys/:ownerId',
        component: SharedEmployeeKeysComponent,
        canActivate: [AuthGuard],
        data: {
          rol: 'EMPLOYEE',
        },
        resolve: { keys: SharedEmployeeKeysResolver },
      },
      {
        path: 'work-groups',
        component: WorkGroupsEmployeesComponent,
        canActivate: [AuthGuard],
        data: {
          rol: 'EMPLOYEE',
        },
        resolve: {
          workgroups: WorkgroupsEmployeesResolver,
        },
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard],
        data: {
          rol: 'EMPLOYEE',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
