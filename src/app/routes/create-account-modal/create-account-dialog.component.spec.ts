// import { ComponentFixture, TestBed } from '@angular/core/testing'
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
// import { CreateAccountDialogComponent } from './create-account-dialog.component'
// import { MatIconModule } from '@angular/material/icon'

// describe('CreateAccountDialogComponent', () => {
//   let component: CreateAccountDialogComponent
//   let fixture: ComponentFixture<CreateAccountDialogComponent>
//   let dialogRefMock: MatDialogRef<CreateAccountDialogComponent>

//   beforeEach(async () => {

//     await TestBed.configureTestingModule({
//       imports: [MatIconModule],
//       declarations: [CreateAccountDialogComponent],
//       providers: [
//         { provide: MatDialogRef, useValue: dialogRefMock },
//         { provide: MAT_DIALOG_DATA, useValue: {} },
//       ],
//     }).compileComponents()

//     fixture = TestBed.createComponent(CreateAccountDialogComponent)
//     component = fixture.componentInstance
//     fixture.detectChanges()
//   })

//   it('should create', () => {
//     expect(component).toBeTruthy()
//   })


//   it('should call showSocialChats() when selectedData is "help"', () => {
//     const showSocialChatsSpy = jest.spyOn(component, 'showSocialChats')
//     component.selectedData = { selected: 'help' }
//     component.ngOnInit()
//     expect(showSocialChatsSpy).toHaveBeenCalled()
//   })

//   it('should set name and initialize firstName and lastName when selectedData is "name"', () => {
//     component.selectedData = { selected: 'name', details: { firstname: 'John', lastname: 'Doe' } }
//     component.ngOnInit()
//     expect(component.name).toEqual('name')
//     expect(component.firstName).toEqual('John')
//     expect(component.lastName).toEqual('Doe')
//   })

//   it('should call backToChatIcon()', () => {
//     const backToChatIconSpy = jest.spyOn(component, 'backToChatIcon')
//     component.backToChatIcon()
//     expect(backToChatIconSpy).toHaveBeenCalled()
//   })


//   // Test ngOnInit with various selectedData values to ensure proper assignment
//   it('should assign proper values based on selectedData value', () => {
//     // Mock MatDialogRef
//     const mockDialogRef = {
//       close: jest.fn(),
//       _overlayRef: null,  // Add any other required properties
//       _containerInstance: null,
//       id: null,
//       componentInstance: null,
//       // Add other properties as needed
//     }

//     const mockRenderer2 = {
//       createElement: jest.fn(),
//       appendChild: jest.fn(),
//     }

//     const mockDocument = {
//       body: {},
//     }

//     const mockSelectedData = {
//       selected: 'name',
//       details: { firstname: 'John', lastname: 'Doe' },
//     }

//     // Create component instance with mocked dependencies
//     const component = new CreateAccountDialogComponent(
//       mockDialogRef as any, // Cast to any to satisfy TypeScript
//       mockSelectedData as any, // Cast to any to satisfy TypeScript
//       mockDocument as any, // Cast to any to satisfy TypeScript
//       mockRenderer2 as any, // Cast to any to satisfy TypeScript
//     )

//     // Call ngOnInit manually
//     component.ngOnInit()

//     // Assert values
//     expect(component.name).toBe('name')
//     expect(component.firstName).toBe('John')
//     expect(component.lastName).toBe('Doe')
//   })

//   // it('should initialize with default values for name, firstName, and lastName', () => {
//   //   expect(component.name).toEqual('')
//   //   expect(component.firstName).toEqual('')
//   //   expect(component.lastName).toEqual('')
//   // })

//   it('should call showSocialChats() when selectedData is "help"', () => {
//     const showSocialChatsSpy = jest.spyOn(component, 'showSocialChats')
//     component.selectedData = { selected: 'help' }
//     component.ngOnInit()
//     expect(showSocialChatsSpy).toHaveBeenCalled()
//   })

//   it('should set name and initialize firstName and lastName when selectedData is "name"', () => {
//     component.selectedData = { selected: 'name', details: { firstname: 'John', lastname: 'Doe' } }
//     component.ngOnInit()
//     expect(component.name).toEqual('name')
//     expect(component.firstName).toEqual('John')
//     expect(component.lastName).toEqual('Doe')
//   })

//   it('should call backToChatIcon()', () => {
//     const backToChatIconSpy = jest.spyOn(component, 'backToChatIcon')
//     component.backToChatIcon()
//     expect(backToChatIconSpy).toHaveBeenCalled()
//   })

//   // it('should handle null selectedData gracefully', () => {
//   //   component.selectedData = null
//   //   expect(() => component.ngOnInit()).not.toThrow()
//   //   expect(component.name).toEqual('')
//   //   expect(component.firstName).toEqual('')
//   //   expect(component.lastName).toEqual('')
//   // })

//   // it('should handle undefined selectedData gracefully', () => {
//   //   component.selectedData = undefined
//   //   expect(() => component.ngOnInit()).not.toThrow()
//   //   expect(component.name).toEqual('')
//   //   expect(component.firstName).toEqual('')
//   //   expect(component.lastName).toEqual('')
//   // })

//   // it('should initialize with default values when selectedData is empty object', () => {
//   //   component.selectedData = {}
//   //   component.ngOnInit()
//   //   expect(component.name).toEqual('')
//   //   expect(component.firstName).toEqual('')
//   //   expect(component.lastName).toEqual('')
//   // })

//   // it('should call confirm() and close dialog with data', () => {
//   //   const confirmData = 'confirm data'
//   //   const closeSpy = jest.spyOn(component.dialogRef, 'close')
//   //   component.confirm(confirmData)
//   //   expect(closeSpy).toHaveBeenCalledWith(confirmData)
//   // })

//   // it('should log error when showSocialChats() throws an error', () => {
//   //   const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
//   //   jest.spyOn(component, 'showSocialChats').mockImplementation(() => {
//   //     throw new Error('Simulated error in showSocialChats')
//   //   })
//   //   component.selectedData = { selected: 'help' }
//   //   component.ngOnInit()
//   //   expect(consoleErrorSpy).toHaveBeenCalled()
//   // })


//   // it('should handle unexpected selectedData format gracefully', () => {
//   //   component.selectedData = { otherProperty: 'unexpected format' }
//   //   expect(() => component.ngOnInit()).not.toThrow()
//   //   expect(component.name).toEqual('')
//   //   expect(component.firstName).toEqual('')
//   //   expect(component.lastName).toEqual('')
//   // })

//   // it('should initialize with default values when selectedData has missing details', () => {
//   //   component.selectedData = { selected: 'name' }
//   //   component.ngOnInit()
//   //   expect(component.name).toEqual('name')
//   //   expect(component.firstName).toEqual('')
//   //   expect(component.lastName).toEqual('')
//   // })

//   it('should call ngOnInit multiple times without error', () => {
//     component.selectedData = { selected: 'name', details: { firstname: 'John', lastname: 'Doe' } }
//     expect(() => {
//       component.ngOnInit()
//       component.ngOnInit()
//       component.ngOnInit()
//     }).not.toThrow()
//   })

//   // it('should handle unexpected error in ngOnInit gracefully', () => {
//   //   const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
//   //   jest.spyOn(component, 'ngOnInit').mockImplementation(() => {
//   //     throw new Error('Simulated error in ngOnInit')
//   //   })
//   //   expect(() => component.ngOnInit()).not.toThrow()
//   //   expect(consoleErrorSpy).toHaveBeenCalled()
//   // })

//   it('should handle edge case with long first and last names', () => {
//     component.selectedData = { selected: 'name', details: { firstname: 'John-Jacob-Jingleheimer', lastname: 'Schmidt' } }
//     component.ngOnInit()
//     expect(component.name).toEqual('name')
//     expect(component.firstName).toEqual('John-Jacob-Jingleheimer')
//     expect(component.lastName).toEqual('Schmidt')
//   })
// })

