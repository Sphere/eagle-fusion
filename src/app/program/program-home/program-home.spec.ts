import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramHome } from './program-home';

describe('ProgramHome', () => {
  let component: ProgramHome;
  let fixture: ComponentFixture<ProgramHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
