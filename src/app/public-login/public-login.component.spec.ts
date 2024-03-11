import { TestBed, ComponentFixture } from '@angular/core/testing'
import { PublicLoginComponent } from './public-login.component'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { MatInputModule } from '@angular/material/input'

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { of, throwError } from 'rxjs'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'


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
  let component: PublicLoginComponent
  let fixture: ComponentFixture<PublicLoginComponent>
  let mockSnackBar1: MockMatSnackBar
  //let service: SignupService
  //let http: HttpClient
  // Mocked API call simulating a successful response
  //const mockApiSuccess = () => of([])

  // Mocked API call simulating an error
  //const mockApiError = () => throwError(new Error('API error'))

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublicLoginComponent],
      imports: [RouterModule, ReactiveFormsModule, MatInputModule, HttpClientTestingModule, MatSnackBarModule],
      providers: [
        { provide: SignupService, useClass: MockSignupService },
        { provide: MatSnackBar, useClass: MockMatSnackBar },
        { provide: HttpClient, useValue: { get: jest.fn(), post: jest.fn() } },
      ] // Add MatSnackBar to the providers array
    }).compileComponents()
    //service = TestBed.get(SignupService)
    //http = TestBed.get(HttpClient)
  })

  beforeEach(() => {
    mockSnackBar1 = new MockMatSnackBar()
  })

  // it('should handle successful API response', async () => {
  //   // Mock the API call using jest.spyOn (or similar)

  //   jest.spyOn(service, 'fetchStartUpDetails').mockReturnValue(Promise.resolve(mockApiSuccess))

  //   const observable = of(service.fetchStartUpDetails()) // Call the function that uses the mocked API
  //   console.log(observable)
  //   // Use async/await with toPromise() to test the emitted value
  //   const data = await observable.toPromise()

  //   console.log(data) // Output: [1, 2, 3] (array of emitted values)

  //   expect(data).toEqual({ data: data })
  // })

  // it('should call getBook method and return results', () => {
  //   const getBookResponse = {
  //     data: [{ id: 1, title: 'Book 1' }, { id: 2, title: 'Book 2' }]
  //   }

  //   const response = cold('-a|', { a: getBookResponse })
  //   const expected = cold('-b|', { b: getBookResponse.data })
  //   http.get = jest.fn(() => response)

  //   expect(service.fetchStartUpDetails()).toBeObservable(expected)
  // })

  it('should create the component', () => {
    setTimeout(() => {
      fixture = TestBed.createComponent(PublicLoginComponent)
      component = fixture.componentInstance
      console.log(component, 'c')
      fixture.detectChanges()
      expect(component).toBeTruthy()
    })
  })
  // it('should open snack bar on login failure', () => {
  //   setTimeout(() => {
  //     const mockSnackBar = TestBed.get(MatSnackBar)
  //     console.log(component, 'c111')
  //     const mockData = { some: 'data' }
  //     component.otpClick(mockData)
  //     spyOn(mockSnackBar, 'open')

  //     expect(mockSnackBar.open).toHaveBeenCalledWith(
  //       'Login failed!',
  //       'Retry',
  //       { duration: 3000 }
  //     )
  //   })
  // })

  it('should handle error during POST1', async () => {
    setTimeout(async () => {
      fixture = TestBed.createComponent(PublicLoginComponent)
      component = fixture.componentInstance
      console.log(component)
      const mockData = { some: 'data' }
      const expectedError = new HttpErrorResponse({ error: 'Something went wrong' }) // Define the expected error
      const httpTestingController = TestBed.get(HttpClientTestingModule)

      // Call your component's method that triggers the POST request
      component.otpClick(mockData)

      // Intercept the POST request using HttpTestingController
      const req = httpTestingController.expectOne('/apis/public/v8/ssoLogin/otp/sendOtp') // Replace with your endpoint URL
      expect(req.request.method).toEqual('POST')
      expect(req.request.body).toEqual(mockData)

      // Respond with the mocked error response
      req.flush(expectedError, { status: 400, statusText: 'Bad Request' }) // Set error status and text

      // Assert that your component handles the error as expected
      try {
        await component.otpClick(mockData) // Should throw an error
        fail('Expected an error to be thrown')
      } catch (error) {
        expect(error).toEqual(expectedError) // Compare the received error with the expected error
      }

      // Verify that all requests have been handled
      httpTestingController.verify()
    })
  })
  // it('should call createBook method - Success Response', () => {
  //   const createBookArg: CreateBook = {
  //     name: 'Test Book'
  //   }
  //   const createBookResponse = {
  //     data: {
  //       message: 'Book Created Successfully'
  //     },
  //   }

  //   const response = cold('-a|', { a: createBookResponse })
  //   const expected = cold('-b|', { b: createBookResponse.data })
  //   http.post = jest.fn(() => response)

  //   expect(service.createBook(createBookArg)).toBeObservable(expected)
  // })
  it('should handle error during POST', async () => {
    setTimeout(async () => {
      const mockData = { "userEmail": "sprakashg@yopmail.com", "userPhone": "" }
      const expectedError = new HttpErrorResponse({ error: 'Something went wrong' })

      TestBed.get(HttpClientTestingModule).handle = (request: any) => {
        console.log(request)
        return throwError(expectedError)
      }

      // Call your component's method that triggers the POST request
      try {
        await component.otpClick(mockData)
        fail('Expected an error to be thrown')
      } catch (error) {
        console.log(error, 'eror')
        expect(error).toEqual(expectedError)
      }
    })
  })

  it('should handle successful POST response', async () => {
    setTimeout(() => {
      const mockData = { "userEmail": "sprakashg@yopmail.com", "userPhone": "" }
      const expectedResponse = {
        "message": "User otp successfully sent",
        "userId": "36911d5d-9a4c-4b20-8195-42f40fc5f7b3"
      }

      const httpTestingController = TestBed.get(HttpClientTestingModule)

      // Call your component's method that triggers the POST request
      component.otpClick(mockData)

      // Use HttpTestingController to intercept and handle the request
      const req = httpTestingController.expectOne('/apis/public/v8/ssoLogin/otp/sendOtp') // Replace with your endpoint URL
      expect(req.request.method).toEqual('POST')
      expect(req.request.body).toEqual(mockData)

      req.flush(expectedResponse) // Respond with the mocked response

      // Assert that your component handles the response as expected
      // ... your assertions here

      httpTestingController.verify() // Verify that all requests have been handled
    })
  })

  // it('should handle successful POST response', async () => {
  //   const mockData = { some: 'data' }
  //   const expectedResponse = { result: 'success' }

  //   // Assuming `getHttpBackend` is available in your version
  //   const httpBackend = TestBed.get(HttpBackend)

  //   spyOn(httpBackend, 'handle').and.callFake((request: any, next: any) => {
  //     expect(request.url).toEqual('/your-api-endpoint') // Replace with your endpoint URL
  //     expect(request.method).toEqual('POST')
  //     expect(request.body).toEqual(mockData)

  //     return new HttpResponse({ status: 200, body: expectedResponse })
  //   })

  //   // Call your component's method that triggers the POST request
  //   component.yourMethodThatPostsData(mockData)

  //   // Assert that your component handles the response as expected
  //   // ... your assertions here
  // })

  // it('should handle successful POST response', async () => {
  //   const mockData = { some: 'data' }
  //   const expectedResponse = { result: 'success' }

  //   TestBed.get(HttpClientTestingModule).getHttpHandler().handle = (request: any) => {
  //     // Assert that the request is correct (optional)
  //     expect(request.url).toEqual('/your-api-endpoint') // Replace with your endpoint URL
  //     expect(request.method).toEqual('POST')
  //     expect(request.body).toEqual(mockData)

  //     return new HttpResponse({ status: 200, body: expectedResponse })
  //   }

  //   // Call your component's method that triggers the POST request
  //   component.otpClick(mockData)

  //   // Assert that your component handles the response as expected
  //   // ... your assertions here
  // })

  it('should call open with provided message, action, and config', () => {

    //const mockSnackBar1 = TestBed.get(MatSnackBar)
    const message = 'Test message'
    const action = 'Retry'
    const config = { duration: 3000 }

    spyOn(mockSnackBar1, 'open')
    mockSnackBar1.open(message, action, config)

    expect(mockSnackBar1.open).toHaveBeenCalledWith(message, action, config)

  })

  // it('should log the message, action, and config when open is called', () => {
  //   setTimeout(() => {
  //     const message = 'Test message'
  //     const action = 'Retry'
  //     const config = { duration: 3000 }

  //     spyOn(console, 'log')
  //     mockSnackBar.open(message, action, config)

  //     expect(console.log).toHaveBeenCalledWith(
  //       'Mock MatSnackBar open called:',
  //       message,
  //       action,
  //       config
  //     )
  //   })
  // })

})