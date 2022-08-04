import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { AngularMaterialModule } from '../angular-material.module';
import { HttpLoaderFactory } from '../app.module';
import { PagesLayoutComponent } from '../layouts/pages-layout/pages-layout.component';
import { FullNamePipe } from '../utils/pipes/full-name.pipe';
import { AdminLogsComponent } from './admin/admin-logs/admin-logs.component';
import { EmployeeKeysComponent } from './admin/employees/employee-keys/employee-keys.component';
import { EmployeesComponent } from './admin/employees/employees.component';
import { RegisterEmployeeComponentDialog } from './admin/employees/register-employee/register-employee-dialog.component';
import { RegisterSingleEmployeeDialogComponent } from './admin/employees/register-employee/register-single-employee-dialog/register-single-employee-dialog.component';
import { ProfileAdminComponent } from './admin/profile-admin/profile-admin.component';
import { AddNewWorkGroupDialogComponent } from './admin/work-groups/add-new-work-group-dialog/add-new-work-group-dialog.component';
import { WorkGroupsKeysComponent } from './admin/work-groups/work-groups-keys/work-groups-keys.component';
import { WorkGroupsComponent } from './admin/work-groups/work-groups.component';
import { CreateKeyDialogComponent } from './common/my-keys/create-key-dialog/create-key-dialog.component';
import { DeleteKeyDialogComponent } from './common/my-keys/delete-key-dialog/delete-key-dialog.component';
import { EditKeyDialogComponent } from './common/my-keys/edit-key-dialog/edit-key-dialog.component';
import { MyKeysComponent } from './common/my-keys/my-keys.component';
import { ShareKeyDialogComponent } from './common/my-keys/share-key-dialog/share-key-dialog.component';
import { ComModalGeneralComponent } from './components/com-modal-general/com-modal-general.component';
import { PasswordCardComponent } from './components/password-card/password-card.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedEmployeeKeysComponent } from './employee/shared-keys/shared-employee-keys/shared-employee-keys.component';
import { SharedKeysComponent } from './employee/shared-keys/shared-keys.component';
import { WorkGroupsEmployeesComponent } from './employee/work-groups-employees/work-groups-employees.component';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  declarations: [
    PagesLayoutComponent,
    ComModalGeneralComponent,
    PasswordCardComponent,
    MyKeysComponent,
    DashboardComponent,
    EmployeesComponent,
    RegisterEmployeeComponentDialog,
    RegisterSingleEmployeeDialogComponent,
    WorkGroupsComponent,
    AddNewWorkGroupDialogComponent,
    SharedKeysComponent,
    CreateKeyDialogComponent,
    ShareKeyDialogComponent,
    EditKeyDialogComponent,
    DeleteKeyDialogComponent,
    WorkGroupsEmployeesComponent,
    ProfileAdminComponent,
    WorkGroupsKeysComponent,
    SharedEmployeeKeysComponent,
    FullNamePipe,
    AdminLogsComponent,
    EmployeeKeysComponent,
    ProfileComponent,
  ],
  exports: [
    PagesLayoutComponent,
    ComModalGeneralComponent,
    PasswordCardComponent,
    MyKeysComponent,
    DashboardComponent,
    EmployeesComponent,
    RegisterEmployeeComponentDialog,
    RegisterSingleEmployeeDialogComponent,
    WorkGroupsComponent,
    AddNewWorkGroupDialogComponent,
    SharedKeysComponent,
    CreateKeyDialogComponent,
    ShareKeyDialogComponent,
    EditKeyDialogComponent,
    DeleteKeyDialogComponent,
    WorkGroupsEmployeesComponent,
    ProfileAdminComponent,
    WorkGroupsKeysComponent,
    SharedEmployeeKeysComponent,
    FullNamePipe,
    AdminLogsComponent,
    EmployeeKeysComponent,
    ProfileComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularMaterialModule,
    FontAwesomeModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [FullNamePipe],
})
export class PagesModule {}
