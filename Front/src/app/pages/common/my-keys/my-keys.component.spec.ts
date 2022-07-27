/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MyKeysComponent } from './my-keys.component';

describe('MyKeysComponent', () => {
  let component: MyKeysComponent;
  let fixture: ComponentFixture<MyKeysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyKeysComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyKeysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
