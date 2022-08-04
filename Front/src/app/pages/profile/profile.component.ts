import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { faSpinner, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { LoginService } from 'src/app/auth/login/services/login.service';
import { FormBase } from 'src/app/utils/form-controls/form.base';
import { COMPANY_MANAGER } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent extends FormBase<any> implements OnInit {
  faSpinner: IconDefinition = faSpinner;
  waiting = false;

  constructor(
    protected readonly fb: FormBuilder,
    readonly loginService: LoginService
  ) {
    super(fb);
  }

  ngOnInit(): void {
    this.initForm();
    this.setForm();
  }

  protected initForm(): void {
    this.form =
      this.loginService.user.rol === COMPANY_MANAGER
        ? this.fb.group({
            email: [null, [Validators.required, Validators.email]],
            name: [null, Validators.required],
            firstSurname: [null, Validators.required],
            secondSurname: [null],
            actualPassword: [null, Validators.required],
            password: [null, Validators.required],
            confirmPassword: [null, Validators.required],
          })
        : this.fb.group({
            actualPassword: [null, Validators.required],
            password: [null, Validators.required],
            confirmPassword: [null, Validators.required],
          });
  }

  protected setForm(): void {
    this.loginService.user.rol === COMPANY_MANAGER
      ? this.form.patchValue({
          email: this.loginService.user.email,
          name: this.loginService.user.name,
          firstSurname: this.loginService.user.firstSurname,
          secondSurname: this.loginService.user.secondSurname ?? '',
          actualPassword: null,
          password: null,
          confirmPassword: null,
        })
      : this.form.patchValue({
          actualPassword: null,
          password: null,
          confirmPassword: null,
        });
  }

  save(): void {}
}
