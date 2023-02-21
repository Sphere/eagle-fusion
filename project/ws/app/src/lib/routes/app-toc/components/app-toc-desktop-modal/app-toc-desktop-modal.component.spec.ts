import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTocDesktopModalComponent } from './app-toc-desktop-modal.component';

describe('AppTocDesktopModalComponent', () => {
  let component: AppTocDesktopModalComponent;
  let fixture: ComponentFixture<AppTocDesktopModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppTocDesktopModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTocDesktopModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
