import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { faClipboard, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { firstValueFrom, take } from 'rxjs';
import { LoginService } from 'src/app/auth/login/services/login.service';
import { Key } from 'src/app/models/key.model';
import { decrypt } from 'src/app/utils/functions/decrypt.function';
import Swal from 'sweetalert2';
import { DeleteKeyDialogComponent } from '../../common/my-keys/delete-key-dialog/delete-key-dialog.component';
import { EditKeyDialogComponent } from '../../common/my-keys/edit-key-dialog/edit-key-dialog.component';
import { ShareKeyDialogComponent } from '../../common/my-keys/share-key-dialog/share-key-dialog.component';

@Component({
  selector: 'app-password-card',
  templateUrl: './password-card.component.html',
  styleUrls: ['./password-card.component.scss'],
})
export class PasswordCardComponent implements OnInit {
  @Input()
  key!: Key;
  @Input()
  canEdit: boolean = false;
  @Input()
  canShare: boolean = false;
  @Input()
  canDelete: boolean = false;

  faClipboard: IconDefinition = faClipboard;
  durationInSeconds: number = 5;
  countCopyDialog: number = 0;

  constructor(
    protected readonly dialog: MatDialog,
    private readonly loginService: LoginService,
    private readonly clipboard: Clipboard,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  async openShareKeyDialog(): Promise<void> {
    const key = await firstValueFrom(
      this.dialog
        .open(ShareKeyDialogComponent, {
          disableClose: true,
          maxWidth: '50%',
          minWidth: '35%',
          data: this.key,
        })
        .afterClosed()
        .pipe(take(1))
    );
  }

  async openEditKeyDialog(): Promise<void> {
    const key = await firstValueFrom(
      this.dialog
        .open<EditKeyDialogComponent, any, Key>(EditKeyDialogComponent, {
          disableClose: true,
          maxWidth: '50%',
          minWidth: '35%',
          data: this.key,
        })
        .afterClosed()
        .pipe(take(1))
    );
    if (key) this.key = { ...key };
  }

  async openDeleteKeyDialog(): Promise<void> {
    const key = await firstValueFrom(
      this.dialog
        .open<DeleteKeyDialogComponent, any, Key>(DeleteKeyDialogComponent, {
          disableClose: true,
          maxWidth: '50%',
          minWidth: '35%',
          data: this.key,
        })
        .afterClosed()
        .pipe(take(1))
    );
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
        confirmButtonText: 'Copiar clave',
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
          const privateKey = decrypt(
            this.loginService.user.privateKey as string,
            result.value.password
          );
          const key = decrypt(this.key.key as string, privateKey);
          if (key !== '') {
            if (this.clipboard.copy(key)) this.openSnackBar();
          } else {
            this.openMasterPasswordDialog(false);
            this.countCopyDialog++;
          }
        }
      });
    }
  }

  private openSnackBar(): void {
    this.snackBar.open('Copiado con éxito', 'Cerrar', {
      duration: this.durationInSeconds * 1000,
    });
  }
}
