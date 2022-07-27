import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLayoutComponent } from 'src/app/layouts/auth-layout/auth-layout.component';
import { NoAuthGuard } from '../guards/no-auth.guard';
import { LoginComponent } from './login/login.component';
import { PasswordRecoveryComponent } from './password-recovery/password-recovery.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  {
    path: 'login',
    component: AuthLayoutComponent,
    canActivate: [NoAuthGuard],
    children: [{ path: '', component: LoginComponent }],
  },
  {
    path: 'register',
    component: AuthLayoutComponent,
    canActivate: [NoAuthGuard],
    children: [{ path: '', component: RegisterComponent }],
  },
  {
    path: 'password-recovery/:recoveryToken',
    component: AuthLayoutComponent,
    canActivate: [NoAuthGuard],
    children: [
      {
        path: '',
        component: PasswordRecoveryComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
