import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { forkJoin, Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { API_END_POINTS } from 'src/app/constants/apiConstants'
import _ from 'lodash-es'

@Injectable({ providedIn: 'root' })
export class MobileDashboardService {

  constructor(private http: HttpClient) { }

  getCompetencyInfo(
    competencyHomeData: any[],
    _rootOrgId: string,
    designation: string,
    lang: string
  ): { competencyIds: string[], competencyLevels: any[], isUserDesignationInRoles: boolean } | null {
    const item = competencyHomeData.find(p => p.playlistId === 'COMPETENCY_PLAYLIST')
    if (!item) return null

    const rolesInPlaylist: string[] = (item.role || []).map((r: string) => r.toLowerCase())
    const isUserDesignationInRoles = rolesInPlaylist.includes(designation.toLowerCase())
    if (!isUserDesignationInRoles) return null

    const competencies: any[] = item.dataSource?.payload || item?.payload || []
    if (!competencies.length) return null

    const competencyIds: string[] = _.flatMap(competencies, compObj =>
      Object.keys(compObj).map(key => compObj[key].id)
    )
    const competencyLevels: any[] = competencies.flatMap((compObj: any) =>
      Object.values(compObj).flatMap((comp: any) => {
        const levels: any[] = comp.additionalProperties?.competencyLevelDescription || []
        return levels.map((l: any) => ({
          competencyId: comp.id,
          // The level keeps its OWN name; the competency name is carried separately
          // (competencyName) only so the card title can be derived, then stripped.
          name: l.name || l.levelName,
          competencyName: comp.name,
          level: l.level,
          levelName: l.name || l.levelName,
          description: l.description,
          langHiName: l[`lang-${lang}-name`],
          langHiDescription: l[`lang-${lang}-description`],
          course: l.course || [],
        }))
      })
    )

    return { competencyIds, competencyLevels, isUserDesignationInRoles }
  }

  getAshaData(
    lang: string,
    competencyLevels: any[],
    competencyIds: string[],
    userId: string
  ): Observable<{ ashaData: any[], completedCourses: any[], inProgressCourses: any[] }> {
    const empty = { ashaData: [], completedCourses: [], inProgressCourses: [] }

    if (!competencyIds.length || !competencyLevels.length) return of(empty)

    // Build all competencies from playlist — guarantees count stays at 16
    const competencyMap = new Map<string, any>()
    for (const level of competencyLevels) {
      const key = String(level.competencyId)
      if (!competencyMap.has(key)) {
        competencyMap.set(key, {
          title: level.competencyName || level.name,
          competencyID: String(level.competencyId),
          contentId: level.course?.[0]?.id || '',
          batchId: '',
          isAsha: 'true',
          levels: [],
        })
      }
      // Strip the helper competencyName so card levels keep only their own fields.
      const cleanLevel = { ...level }
      delete cleanLevel.competencyName
      competencyMap.get(key).levels.push(cleanLevel)
    }

    const courses = Array.from(competencyMap.values())
    if (!courses.length) return of(empty)

    const searchPayload = {
      request: {
        filters: {
          primaryCategory: ['Course'],
          contentType: ['Course'],
          status: ['Live'],
          competency: [true],
          lang,
        },
      },
      sort: [{ lastUpdatedOn: 'desc' }],
    }

    return forkJoin({
      searchResult: this.http.post<any>(API_END_POINTS.SEARCH_V7PUBLIC, searchPayload).pipe(catchError(() => of(null))),
      progress: this.http.get<any>(API_END_POINTS.GET_ASHA_PROGRESS(userId)).pipe(catchError(() => of(null))),
    }).pipe(
      map(({ searchResult, progress }) => {
        // Enrich titles from search results — never reduces count
        const rawCourses: any[] = searchResult?.result?.content || searchResult?.content || []
        if (rawCourses.length) {
          const named = this.getFormattedCompetencyCoursesWithFilter(rawCourses, competencyLevels, competencyIds)
          named.forEach((n: any) => {
            const key = String(n.competencyID)
            if (competencyMap.has(key)) {
              const existing = competencyMap.get(key)
              competencyMap.set(key, {
                ...existing,
                ...n,
                competencyID: existing.competencyID,
                levels: existing.levels,
              })
            }
          })
        }
        const enrichedCourses = Array.from(competencyMap.values())
        const withProgress = this.mergeProgressData(enrichedCourses, progress?.data || [])
        return this.setCoursesState(withProgress)
      }),
      catchError(() => {
        const withProgress = this.mergeProgressData(courses, [])
        return of(this.setCoursesState(withProgress))
      })
    )
  }

  private getFormattedCompetencyCoursesWithFilter(
    courses: any[],
    competencyLevels: any[],
    competencyIds: string[]
  ): any[] {
    const uniqueIds = competencyIds.map(String)
    return courses
      .map(course => {
        const matchedLevel = competencyLevels.find(l =>
          (l.course || []).some((c: any) => c.id === course.identifier)
        )
        let competencyID = matchedLevel?.competencyId
        if (competencyID === undefined || competencyID === null) {
          try {
            competencyID = JSON.parse(course.competencies_v1 || '[]')[0]?.competencyId
          } catch {
            competencyID = undefined
          }
        }
        if (competencyID === undefined || competencyID === null || !uniqueIds.includes(String(competencyID))) {
          return null
        }
        const levels = competencyLevels.filter(l => String(l.competencyId) === String(competencyID))
        const batchId = course.batches?.[0]?.batchId || ''
        return {
          title: course.name,
          contentId: course.identifier,
          contentType: course.contentType,
          subTitle: course.subTitle || '',
          description: course.description || '',
          creator: course.creator || '',
          duration: course.duration || 0,
          batchId,
          thumbnail: course.posterImage || course.appIcon || '',
          childContent: (course.childNodes || course.children || []).length,
          competencyID,
          levels,
          lang: course.lang || course.language,
        }
      })
      .filter(Boolean)
  }

  private mergeProgressData(courses: any[], progressRecords: any[]): any[] {
    const merged = courses.map(course => {
      const courseKey = String(course.competencyID || '').toLowerCase()
      // The API returns 'competencylevel' as the level field; normalize to numeric 'levelId'.
      const rawProgress: any[] = (progressRecords || [])
        .filter(p => {
          const pid = p.competencyid ?? p.competencyId ?? ''
          return String(pid).toLowerCase() === courseKey
        })
        .map(p => ({ ...p, levelId: p.levelId ?? p.competencylevel }))

      if (!course.levels?.length) {
        return { ...course, progress: [] }
      }

      // Map every course id (across all languages) to the level numbers it appears in
      // (mirrors mobile groupLevelsByCourse — iterates ALL courses, not just course[0]).
      const courseGroups = new Map<string, string[]>()
      for (const level of course.levels) {
        ; (level.course || []).forEach((c: any) => {
          if (!c?.id) {
            return
          }
          if (!courseGroups.has(c.id)) {
            courseGroups.set(c.id, [])
          }
          courseGroups.get(c.id)!.push(String(level.level))
        })
      }

      // Identify completed courses (a Pass on a 'course' content type) by their level.
      const completedCourseIds = new Set<string>()
      rawProgress.forEach(p => {
        if (p.passFailStatus === 'Pass' && p.contentType?.toLowerCase() === 'course') {
          const matchingLevel = course.levels.find((l: any) => String(l.level) === String(p.levelId))
          const levelCourseId = matchingLevel?.course?.[0]?.id
          if (levelCourseId) {
            completedCourseIds.add(levelCourseId)
          }
        }
      })

      // Keep original per-level progress, then expand each completed course across all the
      // levels that course covers. NO sequential inference (matches mobile) — only the
      // levels actually tied to a completed course are marked Pass.
      const finalProgress = new Map<string, any>()
      rawProgress.forEach(p => finalProgress.set(String(p.levelId), p))

      completedCourseIds.forEach(completedCourseId => {
        const baseProgress = rawProgress.find(p => {
          const lvl = course.levels.find((l: any) => String(l.level) === String(p.levelId))
          return lvl?.course?.[0]?.id === completedCourseId && p.passFailStatus === 'Pass'
        })
          ; (courseGroups.get(completedCourseId) || []).forEach(levelNum => {
            finalProgress.set(levelNum, {
              levelId: Number(levelNum),
              competencyId: course.competencyID,
              completionpercentage: 100,
              passFailStatus: 'Pass',
              attemptcount: baseProgress?.attemptcount || 1,
              contentType: 'course',
            })
          })
      })

      const nonCourseProgress = rawProgress.filter(p => p.contentType?.toLowerCase() !== 'course')
      const mergedProgress = [...nonCourseProgress, ...Array.from(finalProgress.values())]
      const deduped = _.uniqBy(mergedProgress, (p: any) => `${p.levelId}-${p.contentType}-${p.passFailStatus}`)

      // Slim each record to the normalized shape the card/UI expects.
      const progress = deduped.map((p: any) => ({
        attemptcount: p.attemptcount ?? 0,
        competencyId: p.competencyId ?? p.competencyid ?? course.competencyID,
        completionpercentage: p.completionpercentage ?? 0,
        contentType: p.contentType,
        levelId: Number(p.levelId ?? p.competencylevel),
        passFailStatus: p.passFailStatus,
      }))

      // The self-assessment lives in its OWN course (the courseid on a selfAssessment progress
      // record), NOT the per-level learning course. Point contentId there so the guard fetches
      // the course that holds the assessment quiz. Fall back to the existing contentId when
      // there's no self-assessment progress yet.
      const selfAssessmentCourseId = rawProgress
        .find((p: any) => p.contentType?.toLowerCase() === 'selfassessment' && p.courseid)?.courseid

      return {
        ...course,
        ...(selfAssessmentCourseId ? { contentId: selfAssessmentCourseId } : {}),
        progress,
      }
    })

    return _.sortBy(merged, (item: any) => Number(item.competencyID))
  }

  private setCoursesState(courses: any[]): { ashaData: any[], completedCourses: any[], inProgressCourses: any[] } {
    const TOTAL_LEVELS = 5
    const completedCourses: any[] = []
    const inProgressCourses: any[] = []

    courses.forEach(course => {
      const completedLevels = (course.progress || []).filter((p: any) => p.passFailStatus === 'Pass').length
      const totalPercentage = Math.min((completedLevels / TOTAL_LEVELS) * 100, 100)
      const enriched = { ...course, completedLevels, totalPercentage }
      if (totalPercentage === 100) completedCourses.push(enriched)
      else inProgressCourses.push(enriched)
    })

    inProgressCourses.sort((a, b) => String(a.competencyID).localeCompare(String(b.competencyID)))
    inProgressCourses.forEach((c, i) => { c.expand = i === 0 })

    return { ashaData: courses, completedCourses, inProgressCourses }
  }
}
