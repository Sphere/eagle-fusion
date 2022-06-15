import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTocDesktopComponent } from './app-toc-desktop.component';

describe('AppTocDesktopComponent', () => {
  let component: AppTocDesktopComponent;
  let fixture: ComponentFixture<AppTocDesktopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppTocDesktopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTocDesktopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
