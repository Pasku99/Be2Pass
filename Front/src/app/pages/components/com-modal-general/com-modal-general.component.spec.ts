import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComModalGeneralComponent } from './com-modal-general.component';

describe('ComModalGeneralComponent', () => {
  let component: ComModalGeneralComponent;
  let fixture: ComponentFixture<ComModalGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComModalGeneralComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComModalGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
