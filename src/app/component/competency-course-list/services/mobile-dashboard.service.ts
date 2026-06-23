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
    designation: string
  ): { competencyIds: string[], competencyLevels: any[], isUserDesignationInRoles: boolean } | null {
    const item = competencyHomeData.find(p => p.playlistId === 'COMPETENCY_PLAYLIST')
    if (!item) return null

    const rolesInPlaylist: string[] = (item.role || []).map((r: string) => r.toLowerCase())
    const isUserDesignationInRoles = rolesInPlaylist.includes(designation.toLowerCase())
    if (!isUserDesignationInRoles) return null

    const competencies: any[] = item.dataSource?.payload || []
    if (!competencies.length) return null

    const competencyIds: string[] = _.flatMap(competencies, (compObj) =>
      Object.keys(compObj).map((key) => compObj[key].id)
    )
    const competencyLevels: any[] = competencies.flatMap((compObj: any) =>
      Object.values(compObj).flatMap((comp: any) => {
        const levels: any[] = comp.additionalProperties?.competencyLevelDescription || []
        return levels.map((l: any) => ({
          competencyId: comp.id,
          name: comp.name,
          level: l.level,
          levelName: l.name || l.levelName,
          description: l.description,
          langHiName: l['lang-hi-name'],
          langHiDescription: l['lang-hi-description'],
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
          title: level.name,
          competencyID: level.competencyId,
          contentId: level.course?.[0]?.id || '',
          batchId: '',
          levels: [],
        })
      }
      competencyMap.get(key).levels.push(level)
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
            if (competencyMap.has(key) && n.title) {
              competencyMap.get(key).title = n.title
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
    return courses
      .map(course => {
        try {
          const parsed = JSON.parse(course.competencies_v1 || '[]')
          const competencyID = parsed[0]?.competencyId
          if (!competencyID || !competencyIds.map(String).includes(String(competencyID))) return null
          const levels = competencyLevels.filter(l => l.competencyId === competencyID)
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
            childContent: course.childNodes || [],
            competencyID,
            levels,
            lang: course.lang || course.language,
          }
        } catch {
          return null
        }
      })
      .filter(Boolean)
  }

  private mergeProgressData(courses: any[], progressRecords: any[]): any[] {
    return courses
      .map(course => {
        const courseId = String(course.competencyID || '').toLowerCase()
        // Normalize: the API returns 'competencylevel' as the level field, not 'levelId'.
        // Map to 'levelId' here so the rest of the code and the component both see it consistently.
        const rawProgress: any[] = (progressRecords || [])
          .filter(p => {
            const pid = p.competencyid ?? p.competencyId ?? ''
            return String(pid).toLowerCase() === courseId
          })
          .map(p => ({ ...p, levelId: p.levelId ?? p.competencylevel }))

        if (!course.levels?.length) {
          return { ...course, progress: [] }
        }

        // Build courseId → level numbers from playlist (mirrors mobile groupLevelsByCourse)
        const courseGroups = new Map<string, string[]>()
        for (const level of course.levels) {
          const levelCourseId = level.course?.[0]?.id
          if (levelCourseId) {
            if (!courseGroups.has(levelCourseId)) courseGroups.set(levelCourseId, [])
            courseGroups.get(levelCourseId)!.push(String(level.level))
          }
        }

        // Find completed course IDs using playlist level data
        const completedCourseIds = new Set<string>()
        rawProgress.forEach(p => {
          if (p.passFailStatus === 'Pass' && p.contentType?.toLowerCase() === 'course') {
            const matchingLevel = course.levels.find(
              (l: any) => String(l.level) === String(p.levelId)
            )
            const levelCourseId = matchingLevel?.course?.[0]?.id
            if (levelCourseId) completedCourseIds.add(levelCourseId)
          }
        })

        // Expand: mark ALL levels of each completed course as Pass
        const expandedCoursePass = new Map<string, any>()
        completedCourseIds.forEach(completedCourseId => {
          const levelNums = courseGroups.get(completedCourseId) || []
          const baseProgress = rawProgress.find(p => {
            const lvl = course.levels.find((l: any) => String(l.level) === String(p.levelId))
            return lvl?.course?.[0]?.id === completedCourseId && p.passFailStatus === 'Pass'
          })
          levelNums.forEach(levelNum => {
            expandedCoursePass.set(levelNum, {
              levelId: Number(levelNum),
              competencyId: course.competencyID,
              completionpercentage: 100,
              passFailStatus: 'Pass',
              attemptcount: baseProgress?.attemptcount || 1,
              contentType: 'course',
            })
          })
        })

        // Mobile pattern: combine ALL non-course records + expanded course records
        // (using originalProgress ensures no raw record is dropped even with odd levelIds)
        const originalProgress = new Map<string, any>()
        rawProgress.forEach(p => originalProgress.set(String(p.levelId), p))

        const finalProgress = new Map(originalProgress)
        expandedCoursePass.forEach((entry, levelNum) => finalProgress.set(levelNum, entry))

        const nonCourseProgress = rawProgress.filter(p => p.contentType?.toLowerCase() !== 'course')
        const rawMerged = [...nonCourseProgress, ...Array.from(finalProgress.values())]

        // Priority: if selfAssessment Pass exists for a level, drop course Pass for that level
        // This prevents double-counting when both paths complete the same level
        const levelsSaPass = new Set<string>(
          rawMerged
            .filter(p => p.contentType?.toLowerCase() === 'selfassessment' && p.passFailStatus === 'Pass')
            .map(p => String(p.levelId))
        )

        const seen = new Set<string>()
        const progress = rawMerged.filter(p => {
          if (
            p.contentType?.toLowerCase() === 'course' &&
            p.passFailStatus === 'Pass' &&
            levelsSaPass.has(String(p.levelId))
          ) return false // saPass already marks this level done; skip coursePass

          const key = `${p.levelId}-${p.contentType}-${p.passFailStatus}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })

        // Sequential inference: levels unlock in order 1 → 5.
        // If level N passes, all levels below N must also have been completed.
        // The API may only record the highest completed level, not one entry per level.
        const passedLevelNums = new Set(
          progress
            .filter(p => p.passFailStatus === 'Pass')
            .map(p => Number(p.levelId))
            .filter(n => !isNaN(n) && n >= 1 && n <= 5)
        )
        const maxPassedLevel = passedLevelNums.size > 0 ? Math.max(...passedLevelNums) : 0
        for (let l = 1; l < maxPassedLevel; l++) {
          if (!passedLevelNums.has(l)) {
            progress.push({
              levelId: l,
              competencyId: course.competencyID,
              completionpercentage: 100,
              passFailStatus: 'Pass',
              contentType: 'course',
            })
          }
        }

        return { ...course, progress }
      })
      .sort((a, b) => String(a.competencyID).localeCompare(String(b.competencyID)))
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
