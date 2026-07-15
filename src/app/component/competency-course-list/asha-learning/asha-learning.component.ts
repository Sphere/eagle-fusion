import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import * as _ from 'lodash-es'
import { WidgetContentService } from '../../../../../library/ws-widget/collection/src/public-api'
import { LoggerService } from '@ws-widget/utils'

@Component({
  standalone: false,
  selector: 'app-asha-learning',
  templateUrl: './asha-learning.component.html',
  styleUrls: ['./asha-learning.component.scss'],
})
export class AshaLearningComponent implements OnInit, OnChanges {
  @Input() ashaData
  @Input() expand
  @Input() inProgressCoursesCount?: number
  isExpanded: boolean = false
  btnName: string = "Start"
  levels = [1, 2, 3, 4, 5]
  showBtn = true
  completedLevels: number[] = []
  failedLevels: number[] = []
  currentLevel = 0
  nextLevelInfo: any
  constructor(
    private readonly router: Router,
    private readonly translate: TranslateService,
    private readonly contentSvc: WidgetContentService,
    private readonly logger: LoggerService
  ) { }

  ngOnInit() {
    this.isExpanded = this.expand
  }

  // getLevelStyle/getNextLevelEntriesAndLabel are synchronous — computing them here
  // (inside the CD pass) instead of after an `await` keeps the initial render in sync,
  // and re-runs when the parent refreshes the ashaData input.
  ngOnChanges(changes: SimpleChanges) {
    if (changes.ashaData) {
      this.getLevelStyle()
      this.nextLevelInfo = this.getNextLevelEntriesAndLabel(this.ashaData)
    }
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded
  }
  isAdminGrantedProgress(): boolean {
    if (!this.ashaData?.progress?.length) return false

    return _.every(
      this.ashaData?.progress,
      (entry: any) => entry.contentType === 'admin'
    )
  }
  getEarnedProgress(): any[] {
    return _.reject(this.ashaData?.progress || [], { contentType: 'admin' })
  }
  getNextLevelEntriesAndLabel(data: any): {
    highestLevelEntries: any[]
    label: string
  } {
    if (!data?.progress?.length || this.isAdminGrantedProgress()) {
      return { highestLevelEntries: [], label: 'START_SELF_ASSESSMENT' }
    }
    const earnedProgress = this.getEarnedProgress()
    const completedLevels = earnedProgress
      .filter((entry: any) => entry.passFailStatus === 'Pass')
      .map((entry: any) => entry.levelId)

    const allLevels = _.uniq(earnedProgress.map((entry: any) => entry.levelId)).sort((a: number, b: number) => a - b)
    const nextIncompleteLevel = allLevels.find((level: number) => !completedLevels.includes(level))

    let highestLevelEntries = _.filter(earnedProgress, { levelId: nextIncompleteLevel })

    if (_.isEmpty(highestLevelEntries)) {
      const fallbackLevel = completedLevels.length > 0 ? Math.max(...completedLevels) : allLevels[0]
      highestLevelEntries = _.filter(earnedProgress, { levelId: fallbackLevel })
    }

    const { contentType, passFailStatus } = highestLevelEntries[0] || {}
    let label = ''
    if (contentType === 'selfAssessment') {
      label = passFailStatus === 'Pass' ? 'START_SELF_ASSESSMENT' : 'START_COURSE'
    } else if (contentType === 'course') {
      label = 'START_COURSE'
    }

    return { highestLevelEntries, label }
  }

  startSelfAssesment(data: any, event: Event) {
    event.stopPropagation()
    this.contentSvc.setAshaCardData(data)
    if (this.isAdminGrantedProgress()) {
      this.router.navigate(['/app/user/self-assessment'], { queryParams: data })
      return
    }

    const earnedProgress = this.getEarnedProgress()
    if (data?.progress?.length) {
      this.btnName = "Continue"
      const completedLevels = earnedProgress
        .filter((entry: any) => entry.passFailStatus === 'Pass')
        .map((entry: any) => entry.levelId)

      const allLevels = [1, 2, 3, 4, 5]
      const nextIncompleteLevel: number | null = allLevels
        .filter(level => !completedLevels.includes(level))
        .reduce((min: number | null, level: number) => (min === null || level < min ? level : min), null)

      let highestLevelEntries = earnedProgress.filter((entry: any) => entry.levelId === nextIncompleteLevel)

      if (!highestLevelEntries.length) {
        const lowerDone = completedLevels.filter((l: number) => l < (nextIncompleteLevel ?? Infinity))
        const fallback = lowerDone.length > 0 ? Math.max(...lowerDone) : Math.min(...completedLevels)
        highestLevelEntries = earnedProgress.filter((entry: any) => entry.levelId === fallback)
      }

      const highestLevelEntry =
        highestLevelEntries.find((e: any) => e.passFailStatus === 'Pass' && e.contentType === 'course') ||
        highestLevelEntries[0]

      const { contentType, passFailStatus } = highestLevelEntry || {}

      // Any completed course means the learner is progressing via courses, so the next step
      // is a course (not a self-assessment) even if the current focus entry is a passed
      // self-assessment — e.g. level 1 self-assessment cleared + level 3/4 course done.
      const hasCourseProgress = earnedProgress.some(
        (e: any) => e.contentType === 'course' && e.passFailStatus === 'Pass'
      )

      if (contentType === 'selfAssessment' && passFailStatus === 'Pass' && !hasCourseProgress) {
        this.router.navigate(['/app/user/self-assessment'], { queryParams: data })
        return
      } else {
        // Levels are sequential, so always start the FIRST incomplete level's course. This
        // handles a stray completed higher level (e.g. level 5 course done while 1-4 aren't
        // → start level 1) and course-progress cases (→ resume at the next pending level),
        // and avoids an invalid level id (e.g. 6) that would 400 the getCourses search.
        const nextLevelId = nextIncompleteLevel
        if (!nextLevelId) {
          // Every level is cleared — nothing to start (the button is hidden at 100%).
          return
        }

        const identifier: any = this.getCourseId(data.competencyID, String(nextLevelId), data)
        if (!identifier) {
          // No course mapped for this level/language — skip the search to avoid a 400.
          return
        }

        this.contentSvc.getFilteredCourseSearchResults(identifier).subscribe(res => {
          const navigationdata = res.result.content[0]
          const batchId = navigationdata.batches?.[0]?.batchId

          const ashaData = {
            isAsha: true,
            batchid: batchId,
            contentid: navigationdata.identifier,
            competencylevel: nextLevelId,
            completionpercentage: 0,
            progress: "course",
            competencyid: data.competencyID,
            competencyName: data.title,
          }

          this.contentSvc.setAshaData(ashaData)

          // Navigate to the course page
          this.router.navigate([`/app/toc/${navigationdata.identifier}/overview`], {
            queryParams: {
              primaryCategory: "Course",
              batchId: batchId,
              competencyid: data.competencyID,
              levelId: nextLevelId,
              courseid: data.contentId,
              isAsha: true,
            },
          })
        })
      }
    } else {
      this.router.navigate(['/app/user/self-assessment'], { queryParams: data })
    }
  }

  getCourseId(competencyId: string, levelId: string, ashaData: any): string | null {
    // Extract the language from the ashaData
    const language = ashaData.lang || this.translate.getCurrentLang()

    // Iterate over the levels in the ashaData
    for (const level of ashaData.levels) {
      // Check if the competencyId and levelId match
      if (level.competencyId.toString() == competencyId && level.level == levelId) {
        // Iterate over the courses in the matched level
        for (const course of level.course) {
          // Check if the course language matches the input language (ashaData.lang)
          if (course.lang == language) {
            return course.id // Return the matched course ID
          }
        }
      }
    }

    // If no match is found, return null
    return null
  }

  getNavigationData(res, levelId) {
    this.logger.log('Input data:', res) // Debugging the input array
    let matchedContent = null

    // Ensure ashaData and its properties exist
    if (!this.ashaData || !this.ashaData.levels || !this.ashaData.lang) {
      this.logger.error('ashaData or ashaData properties are undefined.')
    } else {
      // Iterate through each content in res
      matchedContent = res.find(content => {
        // Iterate through all levels in ashaData
        for (const level of this.ashaData.levels) {
          if (level.level == levelId) {
            // Iterate through all courses in the level
            for (const course of level.course) {
              const courseIdMatches = course.id === content.identifier
              const languageMatches = content.lang === this.ashaData.lang

              this.logger.log('Checking course:', course.id, content.identifier, content.lang, this.ashaData.lang)

              // First priority: Check if both courseIdMatches and languageMatches are true
              if (courseIdMatches && languageMatches) {
                this.logger.log('Both matched:', course.id, content.identifier)
                matchedContent = content // Found a match with both conditions
                return true // Return immediately as we've found the desired match
              }
            }
          }
        }

        // If no match was found, look for courseIdMatches condition alone
        for (const level of this.ashaData.levels) {
          if (level.level == levelId) {
            for (const course of level.course) {
              const courseIdMatches = course.id === content.identifier
              if (courseIdMatches) {
                this.logger.log('Only courseIdMatches:', course.id, content.identifier)
                matchedContent = content // Found a match for courseIdMatches alone
                return true // Return immediately as we've found the match
              }
            }
          }
        }

        return false // No match for this content
      })
    }

    // Check if a match was found
    if (matchedContent) {
      this.logger.log('Matched content:', matchedContent)
    } else {
      this.logger.log('No match found for levelId:', levelId)
    }

    return matchedContent
  }

  getCompletionPercentage(): number {
    if (this.isAdminGrantedProgress()) {
      this.showBtn = true
      return 0
    }
    // Check if progress data exists; if not, set showBtn to true and return 0
    if (!this.ashaData?.progress || this.ashaData.progress.length === 0) {
      this.showBtn = true
      return 0
    }

    const completedLevels = _.filter(this.getEarnedProgress(), { passFailStatus: 'Pass' }).length
    const totalPercentage = (completedLevels / 5) * 100 // Assuming 5 levels total
    this.showBtn = totalPercentage === 100 ? false : true
    return totalPercentage
  }

  getLevelStyle() {
    if (this.isAdminGrantedProgress()) {
      this.completedLevels = []
      this.failedLevels = []
      this.currentLevel = 0
      return                     // stop here, don't calculate further
    }

    const progress = this.getEarnedProgress()
    this.completedLevels = progress
      .filter((entry: any) => entry.passFailStatus === "Pass")
      .map((entry: any) => entry.levelId)

    this.failedLevels = progress
      .filter((entry: any) => entry.passFailStatus === "Fail")
      .map((entry: any) => entry.levelId)

    const nextLevel = this.levels.find(level => !this.completedLevels.includes(level))

    this.currentLevel = nextLevel ? this.levels.indexOf(nextLevel) : this.levels.length
  }

  getLevelNote() {
    // Check if ashaData and progress exist
    if (!this.ashaData?.progress || !Array.isArray(this.ashaData.progress) || !this.ashaData.progress.length) {
      return this.translate.instant("LEVEL_NOTE")
    }
    if (this.isAdminGrantedProgress()) {
      return this.translate.instant("LEVEL_NOTE")
    }
    const earnedProgress = this.getEarnedProgress()
    if (!earnedProgress.length) {
      return this.translate.instant('LEVEL_NOTE')
    }
    const completedLevels = earnedProgress
      .filter((entry: any) => entry.passFailStatus === "Pass")
      .map((entry: any) => entry.levelId)

    const allLevels = [1, 2, 3, 4, 5]

    // Find the next incomplete level
    const nextIncompleteLevel = allLevels
      .filter(level => !completedLevels.includes(level))
      .reduce((min, level) => (min === null || level < min ? level : min), null)

    // If all levels are completed
    if (nextIncompleteLevel === null) {
      return this.translate.instant("YOU_CLEAR_ALL_LEVELS")
    }

    // Filter entries for the next incomplete level
    let nextLevelEntries = earnedProgress.filter((entry: any) => entry.levelId === nextIncompleteLevel)

    // If no entries exist for the next incomplete level, fallback to the closest lower completed level
    if (nextLevelEntries.length === 0) {
      const lowerCompletedLevels = completedLevels.filter(level => level < nextIncompleteLevel)
      const fallbackLevel =
        lowerCompletedLevels.length > 0 ? Math.max(...lowerCompletedLevels) : Math.min(...completedLevels, 0)
      nextLevelEntries = earnedProgress.filter((entry: any) => entry.levelId === fallbackLevel)
    }

    // Select the highest priority entry
    let selectedEntry = nextLevelEntries.find(
      (entry: any) => entry.passFailStatus === "Pass" && entry.contentType === "course"
    )

    if (!selectedEntry) {
      selectedEntry = nextLevelEntries[0]
    }

    const { contentType, passFailStatus, levelId } = selectedEntry || {}

    if (selectedEntry) {
      if (
        selectedEntry.levelId === 5 &&
        selectedEntry.passFailStatus === "Pass" &&
        selectedEntry.completionpercentage === 100
      ) {
        return this.translate.instant("YOU_CLEAR_ALL_LEVELS")
      }

      if (selectedEntry.passFailStatus === "Fail") {
        if (contentType === "course") {
          return this.translate.instant("NOTE_CLEAR_COURSE", {
            nextLevel: levelId,
          })
        } else {
          return this.translate.instant("NOTE_CLEAR_ASSESSMENT", {
            nextLevel: levelId,
          })
        }
      } else if (selectedEntry.passFailStatus === "Pass") {
        if (contentType === "course") {
          return this.translate.instant("COMPLETE_LEVEL_COURSE", {
            nextLevel: levelId + 1,
          })
        } else {
          return this.translate.instant("COMPLETE_LEVEL_ASSESSMENT", {
            nextLevel: levelId + 1,
          })
        }
      }
    } else {
      if (contentType === "selfAssessment" && passFailStatus === "Pass") {
        return this.translate.instant("CLEAR_LEVEL_ASSESSMENT", {
          nextLevel: levelId,
        })
      } else if (contentType === "selfAssessment" && passFailStatus === "Fail") {
        return this.translate.instant("CLEAR_LEVEL_COURSE", {
          nextLevel: levelId,
        })
      } else {
        return this.translate.instant("CLEAR_LEVEL_COURSE", {
          nextLevel: levelId ? levelId : 1,
        })
      }
    }
  }
}
