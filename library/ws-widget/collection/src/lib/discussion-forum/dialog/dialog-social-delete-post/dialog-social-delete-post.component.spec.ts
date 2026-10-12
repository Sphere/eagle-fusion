import { of, throwError } from 'rxjs'
import { DialogSocialDeletePostComponent } from './dialog-social-delete-post.component'

describe('DialogSocialDeletePostComponent', () => {
  let component: DialogSocialDeletePostComponent
  let dialogRef: any
  let socialSvc: any
  let configSvc: any

  const build = () => new DialogSocialDeletePostComponent(dialogRef, { postId: 'p1' }, socialSvc, configSvc)

  beforeEach(() => {
    dialogRef = { close: jest.fn() }
    socialSvc = { deletePost: jest.fn().mockReturnValue(of({ ok: true })) }
    configSvc = { userProfile: { userId: 'u1' } }
    component = build()
  })

  afterEach(() => jest.clearAllMocks())

  describe('construction', () => {
    it('should take the user id from the profile', () => {
      expect(component).toBeTruthy()
      expect(component.userId).toBe('u1')
      expect(component.isDeleting).toBe(false)
      expect(component.errorInDeleting).toBe(false)
    })

    it('should leave the user id blank when there is no profile', () => {
      configSvc.userProfile = null
      expect(build().userId).toBe('')
    })

    it('should leave the user id blank when the profile has none', () => {
      configSvc.userProfile = {}
      expect(build().userId).toBe('')
    })
  })

  describe('deletePost', () => {
    it('should close the dialog with true on success', () => {
      component.deletePost()
      expect(socialSvc.deletePost).toHaveBeenCalledWith('p1', 'u1')
      expect(component.isDeleting).toBe(false)
      expect(dialogRef.close).toHaveBeenCalledWith(true)
    })

    it('should surface an error and keep the dialog open on failure', () => {
      socialSvc.deletePost.mockReturnValue(throwError(() => new Error('down')))
      component.deletePost()
      expect(component.isDeleting).toBe(false)
      expect(component.errorInDeleting).toBe(true)
      expect(dialogRef.close).not.toHaveBeenCalled()
    })

    it('should stay in the deleting state when there is no user id', () => {
      configSvc.userProfile = null
      const anonymous = build()
      anonymous.deletePost()
      expect(anonymous.isDeleting).toBe(true)
      expect(socialSvc.deletePost).not.toHaveBeenCalled()
    })
  })
})
