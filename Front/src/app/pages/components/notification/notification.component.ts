import { Component, Inject, OnInit } from '@angular/core';
import {
  MatSnackBarRef,
  MAT_SNACK_BAR_DATA,
} from '@angular/material/snack-bar';
import * as CryptoJS from 'crypto-js';
import * as forge from 'node-forge';
import { take } from 'rxjs';
import { LoginService } from 'src/app/auth/login/services/login.service';
import { decrypt } from 'src/app/utils/functions/decrypt.function';
import Swal from 'sweetalert2';
import { KeysService } from '../../services/keys.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {
  durationInSeconds: number = 5;
  countCopyDialog: number = 0;
  keypair: any;
  constructor(
    public readonly snackBarRef: MatSnackBarRef<NotificationComponent>,
    private readonly keysService: KeysService,
    private readonly loginService: LoginService,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  accept(): void {
    if (this.data.transitId && this.data.senderId && this.data.receiverId)
      this.openMasterPasswordDialog(true);
  }

  openMasterPasswordDialog(isFirst: boolean): void {
    if (this.countCopyDialog >= 5) {
      setTimeout(() => {
        this.countCopyDialog = 0;
      }, 60000);
    } else {
      Swal.fire({
        title: isFirst
          ? 'Introduzca su contraseña maestra'
          : 'Contraseña incorrecta. Vuelva a intentarlo',
        html: `<input type="password" id="password" class="swal2-input" placeholder="Contraseña maestra">`,
        confirmButtonText: 'Aceptar clave',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: 'red',
        allowOutsideClick: false,
        focusConfirm: false,
        preConfirm: () => {
          const password = Swal.getPopup()!.querySelector(
            '#password'
          ) as HTMLInputElement;
          if (!password.value) {
            Swal.showValidationMessage(`Introduzca su contraseña maestra`);
          }
          return { password: password.value };
        },
      }).then((result) => {
        if (result.value?.password) {
          const decryptedPrivateKey = decrypt(
            this.loginService.user.privateKey as string,
            result.value.password
          );
          let decryptedKey = forge.pki
            .privateKeyFromPem(decryptedPrivateKey)
            .decrypt(forge.util.decode64(this.data.key), 'RSA-OAEP', {
              md: forge.md.sha512.create(),
            });

          const encryptedUserKey = CryptoJS.AES.encrypt(
            decryptedKey,
            decryptedPrivateKey,
            { mode: CryptoJS.mode.CTR }
          ).toString();
          this.keysService
            .acceptKey(
              this.data.transitId,
              this.data.senderId,
              this.data.receiverId,
              encryptedUserKey
            )
            .pipe(take(1))
            .subscribe(() => {
              this.snackBarRef.dismiss();
            });
        } else {
          this.openMasterPasswordDialog(false);
          this.countCopyDialog++;
        }
      });
    }
  }

  cancel(): void {
    this.snackBarRef.dismiss();
  }
}
