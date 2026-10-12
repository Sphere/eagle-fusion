export interface ITocCompetencyGroup {
  name: string
  levels: string[]
}

/**
 * `competencies_v1` reaches the UI in more than one shape depending on which API served the
 * content — a JSON string from search/hierarchy, an already-parsed array from some callers,
 * a keyed object, or the truthy-but-empty `'[]'`. Parse defensively and always return an
 * array so callers never have to guard a throw.
 */
export function parseCompetencies(raw: any): any[] {
  if (!raw) {
    return []
  }

  let parsed: any = raw
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw)
    } catch {
      return []
    }
  }

  if (Array.isArray(parsed)) {
    return parsed.filter(item => item && typeof item === 'object')
  }

  if (typeof parsed === 'object') {
    return Object.values(parsed).filter((item: any) => item && typeof item === 'object')
  }

  return []
}

/**
 * Groups competencies by name so a course carrying several competencies renders each name with
 * only its own levels, instead of one name followed by every level found.
 */
export function groupCompetenciesByName(raw: any): ITocCompetencyGroup[] {
  const groups: ITocCompetencyGroup[] = []

  parseCompetencies(raw).forEach((competency: any) => {
    const name = competency.competencyName || competency.name || ''
    const level = competency.level

    let group = groups.find(item => item.name === name)
    if (!group) {
      group = { name, levels: [] }
      groups.push(group)
    }

    if (level !== undefined && level !== null && level !== '') {
      const label = `Level ${level}`
      if (!group.levels.includes(label)) {
        group.levels.push(label)
      }
    }
  })

  return groups.filter(group => group.name || group.levels.length)
}

export function hasCompetencyData(raw: any): boolean {
  return groupCompetenciesByName(raw).length > 0
}
