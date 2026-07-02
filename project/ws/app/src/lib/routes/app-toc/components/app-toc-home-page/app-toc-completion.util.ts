export interface IProgressRecord {
  contentId: string
  completionPercentage?: number | string | null
}

/**
 * Compute course completion % from per-resource progress records.
 *
 * Only resources that still exist in the current course hierarchy
 * (`currentResourceIds`) are counted. Editing a live course leaves orphaned
 * progress records for removed resources; counting their 100% would inflate
 * the total (e.g. 5×100 over a 5-resource course reads as 100%) even when the
 * current resources are incomplete. Restricting to current leaf nodes keeps
 * this value in sync with the server-side completionPercentage.
 */
export function computeCourseCompletion(
  progressRecords: IProgressRecord[] | null | undefined,
  currentResourceIds: string[] | null | undefined,
): number {
  const ids = currentResourceIds || []
  const currentIds = new Set(ids)
  const aggregate = (progressRecords || [])
    .filter(rec => rec && currentIds.has(rec.contentId))
    .reduce((total, rec) => total + (Number(rec.completionPercentage) || 0), 0)
  const denominator = ids.length * 100
  const percentage = denominator ? Math.round((aggregate / denominator) * 100) : 0
  return Math.min(Math.max(percentage, 0), 100)
}
