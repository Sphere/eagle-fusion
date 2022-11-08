import { TestBed } from '@angular/core/testing';

import { CompetencyService } from './competency.service';

describe('CompetencyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CompetencyService = TestBed.get(CompetencyService);
    expect(service).toBeTruthy();
  });
});
