import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { faSpinner, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FormBase } from 'src/app/utils/form-controls/form.base';
import { PasswordRecoveryService } from './services/password-recovery.service';
import { catchError, take, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss'],
})
export class PasswordRecoveryComponent extends FormBase<any> implements OnInit {
  faSpinner: IconDefinition = faSpinner;
  waiting: boolean = false;
  areEqual: boolean = false;
  isConfirmed: boolean = false;

  constructor(
    protected readonly fb: FormBuilder,
    private readonly passwordRecoveryService: PasswordRecoveryService,
    private readonly route: ActivatedRoute,
    private readonly translateService: TranslateService,
    private readonly router: Router
  ) {
    super(fb);
  }

  ngOnInit(): void {
    this.initForm();
    this.setForm();
  }

  protected initForm(): void {
    this.form = this.fb.group({
      password: [null, Validators.required],
      confirmPassword: [null, Validators.required],
    });
  }

  protected setForm(): void {
    this.form.patchValue({
      password: null,
      confirmPassword: null,
    });
  }

  confirm(): void {
    this.isConfirmed = true;
    if (
      this.form.get('password')?.value ===
      this.form.get('confirmPassword')?.value
    ) {
      this.areEqual = true;
      this.route.paramMap.subscribe((param) => {
        console.log(param);
        this.passwordRecoveryService
          .passwordRecovery({
            recoveryToken: param.get('recoveryToken') as string,
            password: this.form.get('password')?.value,
            confirmPassword: this.form.get('confirmPassword')?.value,
          })
          .pipe(
            take(1),
            catchError((err) => {
              Swal.fire({
                icon: 'error',
                title: this.translateService.instant('oops'),
                text: err.error.message,
              });
              this.waiting = false;
              return throwError(() => new Error(err));
            })
          )
          .subscribe((res) => {
            this.waiting = false;
            Swal.fire({
              icon: 'success',
              title: this.translateService.instant(
                'password_change_was_succesfully'
              ),
            });
            this.router.navigateByUrl('login');
          });
      });
    }
  }
}
