import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileProfileNavComponent } from './mobile-profile-nav.component';

describe('MobileProfileNavComponent', () => {
  let component: MobileProfileNavComponent;
  let fixture: ComponentFixture<MobileProfileNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileProfileNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileProfileNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
