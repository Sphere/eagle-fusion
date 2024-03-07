import { TestBed, async, } from '@angular/core/testing'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { PublicLoginComponent } from './public-login.component'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { of } from 'rxjs'
import { SignupService } from 'src/app/routes/signup/signup.service'

import { MatInputModule } from '@angular/material/input'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
class MockMatSnackBar {
  open(message?: string, action?: string, config?: any) {
    // Optional: Simulate behavior for testing purposes (e.g., console.log)
    // Mock implementation
    console.log('Mock MatSnackBar open called', message, action, config)

  }
}
class MockSignupService {
  loginAPI() {
    // Return a mock observable for testing
    return of([])
  }

  fetchStartUpDetails() {
    // Return a mock observable for testing
    return of([])
  }
  sendOTP() {
    return of([])
  }
}

describe('PublicLoginComponent', () => {
  //let component: PublicLoginComponent
  //let fixture: ComponentFixture<PublicLoginComponent>
  let mockSnackBar: MockMatSnackBar
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PublicLoginComponent],
      imports: [RouterModule, ReactiveFormsModule, MatInputModule, HttpClientTestingModule, MatSnackBarModule],
      providers: [
        { provide: SignupService, useClass: MockSignupService },
        { provide: MatSnackBar, useClass: MockMatSnackBar },

      ] // Add MatSnackBar to the providers array
    }).compileComponents()
    //fixture = TestBed.createComponent(PublicLoginComponent)
    //component = fixture.componentInstance
    //fixture.detectChanges()
  }))
  beforeEach(() => {
    mockSnackBar = new MockMatSnackBar()
  })
  it('should open snack bar on login failure', () => {
    const mockSnackBar = TestBed.get(MatSnackBar)
    spyOn(mockSnackBar, 'open')

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Login failed!',
      'Retry',
      { duration: 3000 }
    )
  })

  it('should call open with provided message, action, and config', () => {
    const mockSnackBar = TestBed.get(MatSnackBar)
    const message = 'Test message'
    const action = 'Retry'
    const config = { duration: 3000 }

    spyOn(mockSnackBar, 'open')
    mockSnackBar.open(message, action, config)

    expect(mockSnackBar.open).toHaveBeenCalledWith(message, action, config)
  })

  it('should log the message, action, and config when open is called', () => {
    const message = 'Test message'
    const action = 'Retry'
    const config = { duration: 3000 }

    spyOn(console, 'log')
    mockSnackBar.open(message, action, config)

    expect(console.log).toHaveBeenCalledWith(
      'Mock MatSnackBar open called:',
      message,
      action,
      config
    )
  })

})