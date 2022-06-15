import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTocHomePageComponent } from './app-toc-home-page.component';

describe('AppTocHomePageComponent', () => {
  let component: AppTocHomePageComponent;
  let fixture: ComponentFixture<AppTocHomePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppTocHomePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTocHomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
