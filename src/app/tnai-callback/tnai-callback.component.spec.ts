import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TnaiCallbackComponent } from './tnai-callback.component';

describe('TnaiCallbackComponent', () => {
  let component: TnaiCallbackComponent;
  let fixture: ComponentFixture<TnaiCallbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TnaiCallbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TnaiCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
