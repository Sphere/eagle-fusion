import { NsWidgetResolver } from './widget-resolver.model'

function isStringArray(strArr: string[] | any): boolean {
  return Array.isArray(strArr) && strArr.every(u => typeof u === 'string')
}

function isCheckRequired(requiredPermission: NsWidgetResolver.UnitPermission): boolean {
  if (
    requiredPermission === undefined ||
    requiredPermission === null ||
    requiredPermission === '' ||
    (Array.isArray(requiredPermission) && requiredPermission.length === 0)
  ) {
    return false
  }
  return true
}

function flipBoolean(value: boolean, flip = false) {
  return flip ? !value : value
}

function permissionTest(
  testFor: 'all' | 'some' | 'none',
  requiredPermission: NsWidgetResolver.UnitPermissionPrimitive | string[],
  matchAgainst: Set<string>,
  isRestrictive = false,
) {
  if (!isCheckRequired(requiredPermission)) {
    return true
  }
  if (typeof requiredPermission === 'string') {
    switch (testFor) {
      case 'all':
      case 'some':
        return flipBoolean(matchAgainst.has(requiredPermission), isRestrictive)
      case 'none':
        return flipBoolean(!matchAgainst.has(requiredPermission), isRestrictive)
    }
  }
  if (Array.isArray(requiredPermission)) {
    const matcher = (u: string) =>
      typeof u === 'string' && flipBoolean(matchAgainst.has(u), isRestrictive)
    switch (testFor) {
      case 'all':
        return requiredPermission.every(matcher)
      case 'some':
        return requiredPermission.some(matcher)
      case 'none':
        return !requiredPermission.every(matcher)
    }
  }
  return false
}

export function hasUnitPermission(
  requiredPermission: NsWidgetResolver.UnitPermission,
  matchAgainst?: Set<string> | string[] | string | null | undefined,
  isRestrictive = false,
): boolean {
  if (!isCheckRequired(requiredPermission)) {
    return true
  }
  const accessValues: Set<string> =
    matchAgainst instanceof Set
      ? matchAgainst
      : Array.isArray(matchAgainst) && isStringArray(matchAgainst)
        ? new Set(matchAgainst)
        : typeof matchAgainst === 'string'
          ? new Set([matchAgainst])
          : new Set()

  if (typeof requiredPermission === 'object' && requiredPermission !== null) {
    if (Array.isArray(requiredPermission)) {
      return permissionTest('all', requiredPermission, accessValues, isRestrictive)
    }
    return (
      permissionTest(
        'all',
        'all' in requiredPermission ? requiredPermission.all : null,
        accessValues,
        isRestrictive,
      ) &&
      permissionTest(
        'some',
        'some' in requiredPermission ? requiredPermission.some : null,
        accessValues,
        isRestrictive,
      ) &&
      permissionTest(
        'none',
        'none' in requiredPermission ? requiredPermission.none : null,
        accessValues,
        isRestrictive,
      )
    )
  }
  return false
}

export function hasPermissions(
  requiredPermission?: NsWidgetResolver.IPermissions,
  availableRoles?: Set<string> | string | string[] | null | undefined,
  availableGroups?: Set<string> | string | string[] | null | undefined,
  restrictedFeatures?: Set<string> | string | string[] | null | undefined,
): boolean {
  if (!requiredPermission) {
    return true
  }
  if (!requiredPermission.available || !requiredPermission.enabled) {
    return false
  }
  return (
    hasUnitPermission(requiredPermission.groups, availableGroups) &&
    hasUnitPermission(requiredPermission.roles, availableRoles) &&
    hasUnitPermission(requiredPermission.features, restrictedFeatures, true)
  )
}
