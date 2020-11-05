import { TestBed } from '@angular/core/testing'

import { UserAutocompleteService } from './user-autocomplete.service'

describe('UserAutocompleteService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: UserAutocompleteService = TestBed.get(UserAutocompleteService)
    expect(service).toBeTruthy()
  })
})
