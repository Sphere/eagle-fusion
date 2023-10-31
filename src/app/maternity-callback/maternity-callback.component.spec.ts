import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaternityCallbackComponent } from './maternity-callback.component';

describe('MaternityCallbackComponent', () => {
  let component: MaternityCallbackComponent;
  let fixture: ComponentFixture<MaternityCallbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaternityCallbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaternityCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
