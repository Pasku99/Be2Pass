import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, Observable, startWith, take } from 'rxjs';
import { LoginService } from 'src/app/auth/login/services/login.service';
import { Key } from 'src/app/models/key.model';
import { EmployeesService } from 'src/app/pages/admin/employees/services/employees.service';
import { Employee } from 'src/app/pages/models/employee-model';
import { KeysService } from 'src/app/pages/services/keys.service';
import { decrypt } from 'src/app/utils/functions/decrypt.function';
import Swal from 'sweetalert2';
import * as forge from 'node-forge';

@Component({
  selector: 'app-share-key-dialog',
  templateUrl: './share-key-dialog.component.html',
  styleUrls: ['./share-key-dialog.component.scss'],
})
export class ShareKeyDialogComponent implements OnInit {
  @ViewChild('employeeInput')
  employeeInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto')
  matAutocomplete!: MatAutocomplete;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  employeeControl = new FormControl();
  filteredEmployees!: Observable<String[]>;
  hide: boolean = true;
  chipSelectedEmployees: Employee[] = [];
  allEmployees: Employee[] = [];
  durationInSeconds: number = 5;
  countCopyDialog: number = 0;

  private allowFreeTextAddEmployee: boolean = false;

  constructor(
    protected readonly fb: FormBuilder,
    protected readonly dialogRef: MatDialogRef<ShareKeyDialogComponent>,
    private readonly employeesService: EmployeesService,
    private readonly loginService: LoginService,
    private readonly keysService: KeysService,
    private readonly snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public key: Key
  ) {}

  ngOnInit(): void {
    this.getEmployees();
  }

  private getEmployees(): void {
    this.employeesService
      .getEmployees(
        this.loginService.user.id as string,
        this.loginService.user.companyId as string
      )
      .pipe(take(1))
      .subscribe((res) => {
        this.allEmployees = res.employees;
        this.filteredEmployees = this.employeeControl.valueChanges.pipe(
          startWith(null),
          map((employeeEmail) => this.filterOnValueChange(employeeEmail))
        );
      });
  }

  private filterOnValueChange(employeeEmail: string | null): String[] {
    let result: String[] = [];
    let allEmployeesLessSelected = this.allEmployees.filter(
      (employee) => this.chipSelectedEmployees.indexOf(employee) < 0
    );
    if (employeeEmail)
      result = this.filterEmployee(allEmployeesLessSelected, employeeEmail);
    else result = allEmployeesLessSelected.map((employee) => employee.email);

    return result;
  }

  private filterEmployee(
    employeeList: Employee[],
    employeeEmail: String
  ): String[] {
    let filteredEmployeeList: Employee[] = [];
    const filterValue = employeeEmail.toLowerCase();
    let employeesMatchingEmployeeEmail = employeeList.filter(
      (employee) => employee.email.toLowerCase().indexOf(filterValue) === 0
    );
    if (
      employeesMatchingEmployeeEmail.length ||
      this.allowFreeTextAddEmployee
    ) {
      filteredEmployeeList = employeesMatchingEmployeeEmail;
    } else {
      filteredEmployeeList = employeeList;
    }
    return filteredEmployeeList.map((employee) => employee.email);
  }

  addEmployee(event: MatChipInputEvent): void {
    if (!this.allowFreeTextAddEmployee) {
      return;
    }
    if (this.matAutocomplete.isOpen) {
      return;
    }
    const value = event.value;
    if ((value || '').trim()) {
      this.selectEmployeeByName(value.trim());
    }

    this.resetInputs();
  }

  private selectEmployeeByName(employeeEmail: string) {
    let foundEmployee = this.allEmployees.filter(
      (employee) => employee.email == employeeEmail
    );
    if (foundEmployee.length) {
      this.chipSelectedEmployees.push(foundEmployee[0]);
    } else {
      let highestEmployeeId = Math.max(
        ...this.chipSelectedEmployees.map((employee) =>
          parseInt(employee.id as string)
        ),
        0
      );
      this.chipSelectedEmployees.push({
        name: '',
        id: (highestEmployeeId + 1).toString(),
        firstSurname: '',
        secondSurname: '',
        email: employeeEmail,
      });
    }
  }

  removeEmployee(employee: Employee): void {
    const index = this.chipSelectedEmployees.indexOf(employee);
    if (index >= 0) {
      this.chipSelectedEmployees.splice(index, 1);
      this.resetInputs();
    }
  }

  private resetInputs() {
    this.employeeInput.nativeElement.value = '';
    if (this.employeeControl) this.employeeControl.setValue(null);
  }

  employeeSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectEmployeeByName(event.option.value);
    this.resetInputs();
  }

  save(): void {
    if (this.chipSelectedEmployees.length > 0)
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
        confirmButtonText: 'Compartir clave',
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
            let transits = [];
            for (const employee of this.chipSelectedEmployees) {
              let encryptedKey = forge.util.encode64(
                forge.pki
                  .publicKeyFromPem(employee.publicKey as string)
                  .encrypt(key, 'RSA-OAEP', { md: forge.md.sha512.create() })
              );
              transits.push({
                receiverId: employee.id,
                encryptedKey: encryptedKey,
                companyId: employee.companyId,
              });
            }
            this.keysService
              .shareKey(
                this.key.id as string,
                transits,
                this.loginService.user.id as string
              )
              .pipe(take(1))
              .subscribe((res) => {
                if (res.ok) {
                  this.openSnackBar();
                }
              });
          } else {
            this.openMasterPasswordDialog(false);
            this.countCopyDialog++;
          }
        }
      });
    }
  }

  private openSnackBar(): void {
    this.snackBar.open('Compartido con éxito', 'Cerrar', {
      duration: this.durationInSeconds * 1000,
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
