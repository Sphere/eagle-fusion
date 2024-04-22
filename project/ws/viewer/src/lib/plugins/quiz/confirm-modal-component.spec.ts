import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { ConfirmmodalComponent } from './confirm-modal-component'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'
import { ConfigurationsService, ValueService } from '@ws-widget/utils/src/public-api'
import { WidgetContentService } from '@ws-widget/collection'
import { of } from 'rxjs'
import { MatFormFieldModule, MatIconModule, MatInputModule } from '@angular/material'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { HttpClientTestingModule } from '@angular/common/http/testing' // Import HttpClientTestingModule

class MatDialogRefMock {
  close() { }
}

describe('ConfirmmodalComponent', () => {
  let component: ConfirmmodalComponent
  let fixture: ComponentFixture<ConfirmmodalComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmmodalComponent],
      imports: [
        ReactiveFormsModule,
        MatSnackBarModule,
        MatDialogModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        HttpClientTestingModule
      ],
      providers: [
        FormBuilder,
        MatSnackBar,
        { provide: MatDialogRef, useClass: MatDialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: ConfigurationsService, useValue: {} },
        { provide: ValueService, useValue: { isXSmall$: of(false) } },
        WidgetContentService
      ]
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmmodalComponent)
    component = fixture.componentInstance
    TestBed.get(MatDialogRef)
    fixture.detectChanges()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should set selectedRating when calling setRating', () => {
    component.setRating(3)
    expect(component.selectedRating).toBe(3)
  })

  it('should not submit data if review is empty', () => {
    spyOn(component, 'submitRating')
    component.submitData()
    expect(component.submitRating).not.toHaveBeenCalled()
  })

  it('should submit data when review is not empty and rating is selected', () => {
    spyOn(component, 'submitRating')
    component.ratingsForm.patchValue({ review: 'Test review' })
    component.selectedRating = 4
    component.submitData()
    expect(component.submitRating).toHaveBeenCalled()
  })

  it('should not call contentSvc.submitCourseRating when review is empty and submitRating is called', fakeAsync(() => {
    spyOn(component.contentSvc, 'submitCourseRating')
    component.submitRating(component.ratingsForm)
    tick()
    expect(component.contentSvc.submitCourseRating).not.toHaveBeenCalled()
  }))

  it('should call submitRating when submitData is called with non-empty review and selectedRating', () => {
    spyOn(component, 'submitRating')
    component.ratingsForm.patchValue({ review: 'Test review' })
    component.selectedRating = 4
    component.submitData()
    expect(component.submitRating).toHaveBeenCalled()
  })

  it('should call openSnackbar with error message if contentSvc call fails in submitRating', fakeAsync(() => {
    spyOn(component.snackBar, 'open')
    spyOn(component.contentSvc, 'submitCourseRating').and.returnValue(Promise.reject({}))
    const mockData = { request: { courseId: 'testCourseId' } }
    component.data = mockData
    component.ratingsForm.patchValue({ review: 'Test review' })
    component.selectedRating = 4

    component.submitRating(component.ratingsForm)
    tick()

    expect(component.snackBar.open).toHaveBeenCalledWith('An error occurred, please try again later!', 'X', { duration: 5000 })
  }))


  it('should call submitRating when review is not empty and rating is selected', () => {
    component.ratingsForm.patchValue({ review: 'Test review' })
    component.selectedRating = 4
    const submitRatingSpy = spyOn(component, 'submitRating')
    component.submitData()
    expect(submitRatingSpy).toHaveBeenCalled()
  })

  it('should not call submitRating when review is empty', () => {
    component.ratingsForm.patchValue({ review: '' })
    component.selectedRating = 4
    const submitRatingSpy = spyOn(component, 'submitRating')
    component.submitData()
    expect(submitRatingSpy).not.toHaveBeenCalled()
  })

  it('should not call submitCourseRating when review is empty in submitRating', fakeAsync(() => {
    component.ratingsForm.patchValue({ review: '' })
    const submitCourseRatingSpy = spyOn(component.contentSvc, 'submitCourseRating')
    component.submitRating(component.ratingsForm)
    tick()
    expect(submitCourseRatingSpy).not.toHaveBeenCalled()
  }))


  it('should handle API success and close dialog', fakeAsync(() => {
    const mockData = { request: { courseId: 'testCourseId' } }
    component.data = mockData
    component.ratingsForm.patchValue({ review: 'Test review' })
    component.selectedRating = 4
    spyOn(component.contentSvc, 'submitCourseRating').and.returnValue(Promise.resolve({ params: { status: 'Successful' } }))
    const openSnackbarSpy = spyOn(component, 'openSnackbar')
    const dialogRefCloseSpy = spyOn(component.dialogRef, 'close')
    component.submitRating(component.ratingsForm)
    tick()
    expect(openSnackbarSpy).toHaveBeenCalledWith('Thank You for your feedback!')
    expect(dialogRefCloseSpy).toHaveBeenCalledWith({ event: 'CONFIRMED' })
  }))

  it('should handle API success with unsuccessful status and close dialog', fakeAsync(() => {
    const mockData = { request: { courseId: 'testCourseId' } }
    component.data = mockData
    component.ratingsForm.patchValue({ review: 'Test review' })
    component.selectedRating = 4
    spyOn(component.contentSvc, 'submitCourseRating').and.returnValue(Promise.resolve({ params: { status: 'Unsuccessful' } }))
    const openSnackbarSpy = spyOn(component, 'openSnackbar')
    const dialogRefCloseSpy = spyOn(component.dialogRef, 'close')
    component.submitRating(component.ratingsForm)
    tick()
    expect(openSnackbarSpy).toHaveBeenCalledWith('Something went wrong, please try again later!')
    expect(dialogRefCloseSpy).toHaveBeenCalledWith({ event: 'CONFIRMED' })
  }))

  it('should handle API failure with error message', fakeAsync(() => {
    const mockData = { request: { courseId: 'testCourseId' } }
    component.data = mockData
    component.ratingsForm.patchValue({ review: 'Test review' })
    component.selectedRating = 4
    spyOn(component.contentSvc, 'submitCourseRating').and.returnValue(Promise.reject({ error: { message: 'Error message' } }))
    const openSnackbarSpy = spyOn(component, 'openSnackbar')
    component.submitRating(component.ratingsForm)
    tick()
    expect(openSnackbarSpy).toHaveBeenCalledWith('Error message')
  }))

  it('should handle API failure without error message', fakeAsync(() => {
    const mockData = { request: { courseId: 'testCourseId' } }
    component.data = mockData
    component.ratingsForm.patchValue({ review: 'Test review' })
    component.selectedRating = 4
    spyOn(component.contentSvc, 'submitCourseRating').and.returnValue(Promise.reject({}))
    const openSnackbarSpy = spyOn(component, 'openSnackbar')
    component.submitRating(component.ratingsForm)
    tick()
    expect(openSnackbarSpy).toHaveBeenCalledWith('An error occurred, please try again later!')
  }))
})
