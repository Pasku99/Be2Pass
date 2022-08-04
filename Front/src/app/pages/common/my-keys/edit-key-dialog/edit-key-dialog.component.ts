import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, Observable, startWith, throwError, take } from 'rxjs';
import { LoginService } from 'src/app/auth/login/services/login.service';
import { Key } from 'src/app/models/key.model';
import { Workgroup } from 'src/app/models/work-group.model';
import { KeysService } from 'src/app/pages/services/keys.service';
import { WorkgroupsService } from 'src/app/pages/services/workgroups.service';
import { FormBase } from 'src/app/utils/form-controls/form.base';
import { encrypt } from 'src/app/utils/functions/encrypt.function';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-key-dialog',
  templateUrl: './edit-key-dialog.component.html',
  styleUrls: ['./edit-key-dialog.component.scss'],
})
export class EditKeyDialogComponent extends FormBase<any> implements OnInit {
  @ViewChild('workGroupInput')
  workGroupInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto')
  matAutocomplete!: MatAutocomplete;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  filteredWorkGroups!: Observable<String[]>;
  hide: boolean = true;
  chipSelectedWorkGroups: Workgroup[] = [];
  allWorkGroups: Workgroup[] = [];
  workGroupsNotSelected: Workgroup[] = [];
  private allowFreeTextAddWorkGroup: boolean = false;

  constructor(
    protected readonly fb: FormBuilder,
    protected readonly dialogRef: MatDialogRef<EditKeyDialogComponent>,
    private readonly keysService: KeysService,
    private readonly loginService: LoginService,
    private readonly translateService: TranslateService,
    private readonly workgroupsService: WorkgroupsService,
    @Inject(MAT_DIALOG_DATA) public key: Key
  ) {
    super(fb);
  }

  ngOnInit(): void {
    this.getWorkgroups();
    this.initForm();
    this.setWorkGroups();
    this.setForm(this.key);
  }

  private getWorkgroups(): void {
    this.workgroupsService
      .getWorkgroups(
        this.loginService.user.companyId as string,
        this.loginService.user.id as string
      )
      .pipe(take(1))
      .subscribe((res) => {
        this.allWorkGroups = res.workgroups;
        this.chipSelectedWorkGroups = this.key.workgroups as Workgroup[];
        this.filteredWorkGroups = this.workGroupControl.valueChanges.pipe(
          startWith(null),
          map((workGroupName) => this.filterOnValueChange(workGroupName))
        );
      });
  }

  protected initForm(): void {
    this.form = this.fb.group({
      username: [null, Validators.required],
      key: [null, Validators.required],
      service: [null, Validators.required],
      URL: [null, Validators.required],

      workgroup: [null],
    });
  }

  protected setForm(key: Key): void {
    this.form.patchValue({
      username: key.username,
      key: key.key,
      service: key.service,
      URL: key.URL,

      workgroup: key.workgroups,
    });
  }

  private setWorkGroups(): void {
    this.filteredWorkGroups = this.workGroupControl.valueChanges.pipe(
      startWith(null),
      map((workGroupName) => this.filterOnValueChange(workGroupName))
    );
    this.workGroupsNotSelected = this.allWorkGroups.filter(
      (workGroup1) =>
        !this.chipSelectedWorkGroups.some(
          (workgroup2) => workGroup1.id === workgroup2.id
        )
    );
  }

  private filterOnValueChange(workGroupName: string | null): String[] {
    let result: String[] = [];

    let allWorkGroupsLessSelected = this.workGroupsNotSelected.filter(
      (workgroup) => this.chipSelectedWorkGroups.indexOf(workgroup) < 0
    );
    if (workGroupName) {
      result = this.filterWorkGroup(allWorkGroupsLessSelected, workGroupName);
    } else {
      result = allWorkGroupsLessSelected.map(
        (workgroup) => workgroup.name as string
      );
    }
    return result;
  }

  private filterWorkGroup(
    workGroupList: Workgroup[],
    workGroupName: String
  ): String[] {
    let filteredWorkGroupList: Workgroup[] = [];
    const filterValue = workGroupName.toLowerCase();
    let workGroupsMatchingWorkgroupName = workGroupList.filter(
      (workgroup) => workgroup.name?.toLowerCase().indexOf(filterValue) === 0
    );
    if (
      workGroupsMatchingWorkgroupName.length ||
      this.allowFreeTextAddWorkGroup
    ) {
      filteredWorkGroupList = workGroupsMatchingWorkgroupName;
    } else {
      filteredWorkGroupList = workGroupList;
    }

    return filteredWorkGroupList.map((workgroup) => workgroup.name as string);
  }

  addWorkGroup(event: MatChipInputEvent): void {
    if (!this.allowFreeTextAddWorkGroup) {
      return;
    }

    if (this.matAutocomplete.isOpen) {
      return;
    }

    const value = event.value;
    if ((value || '').trim()) {
      this.selectWorkGroupByName(value.trim());
    }

    this.resetInputs();
  }

  private selectWorkGroupByName(workGroupName: any) {
    let foundWorkGroup = this.workGroupsNotSelected.filter(
      (workgroup) => workgroup.name == workGroupName
    );
    if (foundWorkGroup.length) {
      this.chipSelectedWorkGroups.push(foundWorkGroup[0]);
    } else {
      let highestWorkGroupId = Math.max(
        ...this.chipSelectedWorkGroups.map((workgroup) =>
          parseInt(workgroup.id as string)
        ),
        0
      );
      this.chipSelectedWorkGroups.push({
        name: workGroupName,
        id: (highestWorkGroupId + 1).toString(),
      });
    }
  }

  removeWorkGroup(workgroup: Workgroup): void {
    const index = this.chipSelectedWorkGroups.indexOf(workgroup);
    if (index >= 0) {
      this.chipSelectedWorkGroups.splice(index, 1);
      this.resetInputs();
    }
  }

  private resetInputs() {
    this.workGroupInput.nativeElement.value = '';

    if (this.workGroupControl) this.workGroupControl.setValue(null);
  }

  workGroupSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectWorkGroupByName(event.option.value);
    this.resetInputs();
  }

  save(): void {
    if (this.form.valid) this.editAndSave();
  }

  private editAndSave(): void {
    Swal.fire({
      title: 'Introduzca su contraseña maestra',
      html: `<input type="password" id="password" class="swal2-input" placeholder="Contraseña maestra">`,
      confirmButtonText: 'Añadir nueva clave',
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
        this.keysService
          .editKey(
            {
              ...this.form.value,
              key: encrypt(
                this.form.get('key')?.value,
                result.value.password,
                this.loginService.user.privateKey as string
              ),
              workgroups: this.chipSelectedWorkGroups.map(
                (workgroup) => workgroup.id
              ),
            },
            this.loginService.user.id as string,
            this.key.id as string
          )
          .pipe(
            take(1),
            catchError((err) => {
              Swal.fire({
                icon: 'error',
                title: this.translateService.instant('oops'),
                text: err.error.message,
              });
              return throwError(() => new Error(err));
            })
          )
          .subscribe((res) => {
            if (res) {
              this.dialogRef.close(res.key);
              Swal.fire({
                icon: 'success',
                title: 'Clave editada con éxito',
              });
            }
          });
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  get passwordControl(): FormControl {
    return this.form.get('password') as FormControl;
  }

  get workGroupControl(): FormControl {
    return this.form.get('workgroup') as FormControl;
  }
}
