export function buildCompetencySearchArray(competencyPayload: any[]): string[] {
  if (!Array.isArray(competencyPayload) || competencyPayload?.length === 0) {
    return []
  }
  const competencyIdentifiers: string[] = []
  competencyPayload.forEach(competencyObj => {
    const levels = Array.isArray(competencyObj?.levels)
    const comp = levels || competencyObj?.additionalProperties
      ? competencyObj
      : Object.values(competencyObj || {})[0] as any

    const competencyId = comp?.id
    if (!competencyId) return

    const levelDescriptions = levels
      ? comp?.levels || []
      : comp?.additionalProperties?.competencyLevelDescription || []

    levelDescriptions.forEach((levelDesc: any) => {
      const level = levelDesc?.courseId
      if (level) {
        competencyIdentifiers.push(`${level}`)
      }
    })
  })
  return competencyIdentifiers
}
