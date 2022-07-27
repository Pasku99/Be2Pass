import { Directive, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

@Directive()
export abstract class FormBase<T> implements OnDestroy {
  @Output() readonly changeValue = new EventEmitter<T>();

  protected readonly unsubscribe$ = new Subject<void>();

  form!: FormGroup;

  constructor(protected readonly formBuilder: FormBuilder) {}

  protected abstract initForm(): void;
  protected abstract setForm(...args: { [key: string]: any }[] | any[]): void;

  get valid(): boolean {
    return this.form?.valid ?? false;
  }

  get invalid(): boolean {
    return this.form?.invalid ?? false;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
