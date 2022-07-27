import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesLayoutComponent } from 'src/app/layouts/pages-layout/pages-layout.component';
import { AuthGuard } from '../guards/auth.guard';
import { EmployeesComponent } from './admin/employees/employees.component';
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

const routes: Routes = [
  {
    path: '',
    component: PagesLayoutComponent,
    children: [
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
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
