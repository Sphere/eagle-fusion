import { hasPermissions, hasUnitPermission } from './widget-resolver.permissions'

describe('widget-resolver.permissions', () => {
  describe('hasUnitPermission', () => {
    it('should pass when no permission is required', () => {
      expect(hasUnitPermission(undefined)).toBe(true)
      expect(hasUnitPermission(null)).toBe(true)
      expect(hasUnitPermission('')).toBe(true)
      expect(hasUnitPermission([])).toBe(true)
    })

    it('should reject a bare string requirement (only object/array forms are evaluated)', () => {
      expect(hasUnitPermission('admin' as any, ['admin'])).toBe(false)
    })

    describe('array requirement (implicit "all")', () => {
      it('should pass when every required value is available', () => {
        expect(hasUnitPermission(['a', 'b'], ['a', 'b', 'c'])).toBe(true)
      })

      it('should fail when any required value is missing', () => {
        expect(hasUnitPermission(['a', 'z'], ['a', 'b'])).toBe(false)
      })

      it('should fail when a required entry is not a string', () => {
        expect(hasUnitPermission([1 as any, 'a'], ['a'])).toBe(false)
      })
    })

    describe('"all" clause', () => {
      it('should pass when every value is available', () => {
        expect(hasUnitPermission({ all: ['a', 'b'] }, ['a', 'b'])).toBe(true)
      })

      it('should fail when one value is missing', () => {
        expect(hasUnitPermission({ all: ['a', 'b'] }, ['a'])).toBe(false)
      })

      it('should accept a single string value', () => {
        expect(hasUnitPermission({ all: 'a' }, ['a'])).toBe(true)
        expect(hasUnitPermission({ all: 'z' }, ['a'])).toBe(false)
      })
    })

    describe('"some" clause', () => {
      it('should pass when at least one value is available', () => {
        expect(hasUnitPermission({ some: ['z', 'a'] }, ['a'])).toBe(true)
      })

      it('should fail when no value is available', () => {
        expect(hasUnitPermission({ some: ['y', 'z'] }, ['a'])).toBe(false)
      })

      it('should accept a single string value', () => {
        expect(hasUnitPermission({ some: 'a' }, ['a'])).toBe(true)
      })
    })

    describe('"none" clause', () => {
      it('should pass when the value is absent', () => {
        expect(hasUnitPermission({ none: 'z' }, ['a'])).toBe(true)
      })

      it('should fail when the single value is present', () => {
        expect(hasUnitPermission({ none: 'a' }, ['a'])).toBe(false)
      })

      it('should pass for an array unless every value is present', () => {
        expect(hasUnitPermission({ none: ['a', 'z'] }, ['a'])).toBe(true)
        expect(hasUnitPermission({ none: ['a', 'b'] }, ['a', 'b'])).toBe(false)
      })
    })

    it('should require every present clause to hold', () => {
      expect(hasUnitPermission({ all: ['a'], some: ['b', 'z'], none: ['q'] }, ['a', 'b'])).toBe(true)
      expect(hasUnitPermission({ all: ['a'], some: ['y', 'z'], none: ['q'] }, ['a', 'b'])).toBe(false)
      expect(hasUnitPermission({ all: ['a'], some: ['b'], none: ['b'] }, ['a', 'b'])).toBe(false)
    })

    it('should invert the match when the check is restrictive', () => {
      // Restrictive checks are used for restricted features: presence means "denied".
      expect(hasUnitPermission({ all: ['a'] }, ['a'], true)).toBe(false)
      expect(hasUnitPermission({ all: ['a'] }, ['b'], true)).toBe(true)
    })

    describe('match-against coercion', () => {
      it('should accept a Set', () => {
        expect(hasUnitPermission({ all: ['a'] }, new Set(['a']))).toBe(true)
      })

      it('should accept a plain string', () => {
        expect(hasUnitPermission({ all: ['a'] }, 'a')).toBe(true)
      })

      it('should treat null and undefined as an empty set', () => {
        expect(hasUnitPermission({ all: ['a'] }, null)).toBe(false)
        expect(hasUnitPermission({ all: ['a'] }, undefined)).toBe(false)
      })

      it('should treat a non-string array as an empty set', () => {
        expect(hasUnitPermission({ all: ['a'] }, [1, 2] as any)).toBe(false)
      })
    })
  })

  describe('hasPermissions', () => {
    it('should pass when no permission block is supplied', () => {
      expect(hasPermissions()).toBe(true)
      expect(hasPermissions(undefined)).toBe(true)
    })

    it('should fail when the widget is disabled', () => {
      expect(hasPermissions({ enabled: false, available: true })).toBe(false)
    })

    it('should fail when the widget is unavailable', () => {
      expect(hasPermissions({ enabled: true, available: false })).toBe(false)
    })

    it('should pass an enabled, available widget with no specific requirements', () => {
      expect(hasPermissions({ enabled: true, available: true })).toBe(true)
    })

    it('should check roles against the available roles', () => {
      const perm = { enabled: true, available: true, roles: { all: ['admin'] } }
      expect(hasPermissions(perm, ['admin'])).toBe(true)
      expect(hasPermissions(perm, ['user'])).toBe(false)
    })

    it('should check groups against the available groups', () => {
      const perm = { enabled: true, available: true, groups: { some: ['g1', 'g2'] } }
      expect(hasPermissions(perm, [], ['g2'])).toBe(true)
      expect(hasPermissions(perm, [], ['g3'])).toBe(false)
    })

    it('should treat a listed feature as restricted', () => {
      const perm = { enabled: true, available: true, features: { all: ['beta'] } }
      expect(hasPermissions(perm, [], [], ['beta'])).toBe(false)
      expect(hasPermissions(perm, [], [], ['other'])).toBe(true)
    })

    it('should require roles, groups and features to all hold', () => {
      const perm = {
        enabled: true,
        available: true,
        roles: { all: ['admin'] },
        groups: { all: ['g1'] },
        features: { all: ['blocked'] },
      }
      expect(hasPermissions(perm, ['admin'], ['g1'], ['other'])).toBe(true)
      expect(hasPermissions(perm, ['admin'], ['g2'], ['other'])).toBe(false)
      expect(hasPermissions(perm, ['admin'], ['g1'], ['blocked'])).toBe(false)
    })
  })
})
