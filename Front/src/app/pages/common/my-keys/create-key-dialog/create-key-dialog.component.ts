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
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, Observable, startWith, take, throwError } from 'rxjs';
import { LoginService } from 'src/app/auth/login/services/login.service';
import { WorkGroup } from 'src/app/models/work-group.model';
import { KeysService } from 'src/app/pages/services/keys.service';
import { WorkgroupsService } from 'src/app/pages/services/workgroups.service';
import { FormBase } from 'src/app/utils/form-controls/form.base';
import { encrypt } from 'src/app/utils/functions/encrypt.function';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-key-dialog',
  templateUrl: './create-key-dialog.component.html',
  styleUrls: ['./create-key-dialog.component.scss'],
})
export class CreateKeyDialogComponent extends FormBase<any> implements OnInit {
  @ViewChild('workGroupInput')
  workGroupInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto')
  matAutocomplete!: MatAutocomplete;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  filteredWorkGroups!: Observable<String[]>;
  hide: boolean = true;
  chipSelectedWorkGroups: WorkGroup[] = [];
  allWorkGroups: WorkGroup[] = [];

  private allowFreeTextAddWorkGroup: boolean = false;

  constructor(
    protected readonly fb: FormBuilder,
    protected readonly dialogRef: MatDialogRef<CreateKeyDialogComponent>,
    private readonly keysService: KeysService,
    private readonly loginService: LoginService,
    private readonly translateService: TranslateService,
    private readonly workgroupsService: WorkgroupsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    super(fb);
  }

  ngOnInit(): void {
    this.initForm();
    if (!this.data?.isWorkgroupKey) this.getWorkgroups();
  }

  protected initForm(): void {
    this.form = this.fb.group({
      username: [null, Validators.required],
      key: [null, Validators.required],
      service: [null, Validators.required],
      URL: [null, Validators.required],
      // image: [null, FileValidator.maxContentSize(5242880)],
      workGroup: [null],
    });
  }

  protected setForm(...args: any[] | { [key: string]: any }[]): void {}

  private getWorkgroups(): void {
    this.workgroupsService
      .getWorkgroups(
        this.loginService.user.companyId as string,
        this.loginService.user.id as string
      )
      .pipe(take(1))
      .subscribe((res) => {
        this.allWorkGroups = res.workgroups;
        this.filteredWorkGroups = this.workGroupControl.valueChanges.pipe(
          startWith(null),
          map((workGroupName) => this.filterOnValueChange(workGroupName))
        );
      });
  }

  private filterOnValueChange(workGroupName: string | null): String[] {
    let result: String[] = [];
    //
    // Remove the WorkGroups we have already selected from all WorkGroups to
    // get a starting point for the autocomplete list.
    //
    let allWorkGroupsLessSelected = this.allWorkGroups.filter(
      (workGroup) => this.chipSelectedWorkGroups.indexOf(workGroup) < 0
    );
    if (workGroupName) {
      result = this.filterWorkGroup(allWorkGroupsLessSelected, workGroupName);
    } else {
      result = allWorkGroupsLessSelected.map(
        (workGroup) => workGroup.name as string
      );
    }
    return result;
  }

  private filterWorkGroup(
    workGroupList: WorkGroup[],
    workGroupName: String
  ): String[] {
    let filteredWorkGroupList: WorkGroup[] = [];
    const filterValue = workGroupName.toLowerCase();
    let workGroupsMatchingWorkgroupName = workGroupList.filter(
      (workGroup) => workGroup?.name?.toLowerCase().indexOf(filterValue) === 0
    );
    if (
      workGroupsMatchingWorkgroupName.length ||
      this.allowFreeTextAddWorkGroup
    ) {
      //
      // either the WorkGroup name matched some autocomplete options
      // or the name didn't match but we're allowing
      // non-autocomplete WorkGroup names to be entered
      //
      filteredWorkGroupList = workGroupsMatchingWorkgroupName;
    } else {
      //
      // the WorkGroup name didn't match the autocomplete list
      // and we're only allowing WorkGroups to be selected from the list
      // so we show the whjole list
      //
      filteredWorkGroupList = workGroupList;
    }
    //
    // Convert filtered list of WorkGroup objects to list of WorkGroup
    // name strings and return it
    //
    return filteredWorkGroupList.map((workGroup) => workGroup.name as string);
  }

  addWorkGroup(event: MatChipInputEvent): void {
    if (!this.allowFreeTextAddWorkGroup) {
      // only allowed to select from the filtered autocomplete list
      return;
    }

    //
    // Only add when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    //
    if (this.matAutocomplete.isOpen) {
      return;
    }

    // Add our WorkGroup
    const value = event.value;
    if ((value || '').trim()) {
      this.selectWorkGroupByName(value.trim());
    }

    this.resetInputs();
  }

  private selectWorkGroupByName(workGroupName: any) {
    let foundWorkGroup = this.allWorkGroups.filter(
      (workGroup) => workGroup.name == workGroupName
    );
    if (foundWorkGroup.length) {
      //
      // We found the workGroup name in the allWorkgroups list
      //
      this.chipSelectedWorkGroups.push(foundWorkGroup[0]);
    } else {
      //
      // Create a new workGroup, assigning a new higher workGroupId
      // This is the use case when allowFreeTextAddworkGroup is true
      //
      let highestWorkGroupId = Math.max(
        ...this.chipSelectedWorkGroups.map((workGroup) =>
          parseInt(workGroup.id as string)
        ),
        0
      );
      this.chipSelectedWorkGroups.push({
        name: workGroupName,
        id: (highestWorkGroupId + 1).toString(),
      });
    }
  }

  removeWorkGroup(workGroup: WorkGroup): void {
    const index = this.chipSelectedWorkGroups.indexOf(workGroup);
    if (index >= 0) {
      this.chipSelectedWorkGroups.splice(index, 1);
      this.resetInputs();
    }
  }

  private resetInputs() {
    // clear input element
    this.workGroupInput.nativeElement.value = '';
    // clear control value and trigger WorkGroupControl.valueChanges event
    if (this.workGroupControl) this.workGroupControl.setValue(null);
  }

  workGroupSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectWorkGroupByName(event.option.value);
    this.resetInputs();
  }

  save(): void {
    if (this.form.valid) {
      this.insertMasterPasswordAndSave();
    }
  }

  private insertMasterPasswordAndSave(): void {
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
        this.data?.isWorkgroupKey
          ? this.createWorkgroupKey(result.value.password)
          : this.createKey(result.value.password);
      }
    });
  }

  private createKey(password: string): void {
    this.keysService
      .createKey(
        {
          ...this.form.value,
          key: encrypt(
            this.form.get('key')?.value,
            password,
            this.loginService.user.privateKey as string
          ),
          workGroupsIds: this.chipSelectedWorkGroups.map(
            (workGroup) => workGroup.id
          ),
        },
        this.loginService.user.id as string
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
            title: 'Clave insertada con éxito',
          });
        }
      });
  }

  private createWorkgroupKey(password: string): void {
    this.keysService
      .createWorkgroupKey(
        {
          ...this.form.value,
          key: encrypt(
            this.form.get('key')?.value,
            password,
            this.loginService.user.privateKey as string
          ),
        },
        this.loginService.user.id as string,
        this.data.workgroupId
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
            title: 'Clave insertada con éxito',
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
    return this.form.get('workGroup') as FormControl;
  }
}
