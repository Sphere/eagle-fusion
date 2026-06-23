import { Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import * as _ from 'lodash-es'

@Component({
  standalone: false,
  selector: 'app-asha-learning',
  templateUrl: './asha-learning.component.html',
  styleUrls: ['./asha-learning.component.scss'],
})
export class AshaLearningComponent implements OnInit {
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
    private router: Router,
    private translate: TranslateService
  ) { }

  async ngOnInit() {
    this.isExpanded = this.expand
    await this.getLevelStyle()
    this.nextLevelInfo = await this.getNextLevelEntriesAndLabel(this.ashaData)
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

    if (this.isAdminGrantedProgress() || !data?.progress?.length) {
      this.router.navigate(['/app/user/self-assessment'], { queryParams: { competencyId: data.competencyID } })
      return
    }

    const earnedProgress = this.getEarnedProgress()
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

    const { contentType, passFailStatus, levelId, completionpercentage } = highestLevelEntry || {}

    if (contentType === 'selfAssessment' && passFailStatus === 'Pass') {
      this.router.navigate(['/app/user/self-assessment'], { queryParams: { competencyId: data.competencyID } })
      return
    }

    let targetLevelId = levelId || nextIncompleteLevel
    if (completionpercentage === 100) targetLevelId = (targetLevelId ?? 0) + 1

    const courseId = this.getCourseId(data.competencyID, targetLevelId, data)
    if (courseId) {
      this.router.navigate([`/app/toc/${courseId}/overview`], {
        queryParams: {
          primaryCategory: 'Course',
          batchId: data.batchId,
          competencyid: data.competencyID,
          levelId: targetLevelId,
          isAsha: true,
        },
      })
    } else {
      this.router.navigate(['/app/user/self-assessment'], { queryParams: { competencyId: data.competencyID } })
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
    console.log("Input data:", res) // Debugging the input array
    let matchedContent = null

    // Ensure ashaData and its properties exist
    if (!this.ashaData || !this.ashaData.levels || !this.ashaData.lang) {
      console.error("ashaData or ashaData properties are undefined.")
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

              console.log("Checking course:", course.id, content.identifier, content.lang, this.ashaData.lang)

              // First priority: Check if both courseIdMatches and languageMatches are true
              if (courseIdMatches && languageMatches) {
                console.log("Both matched:", course.id, content.identifier)
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
                console.log("Only courseIdMatches:", course.id, content.identifier)
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
      console.log("Matched content:", matchedContent)
    } else {
      console.log("No match found for levelId:", levelId)
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

  async getLevelStyle() {
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
    // const initialLevel = 1

    // Check if ashaData and progress exist
    if (!this.ashaData?.progress || !Array.isArray(this.ashaData.progress) || !this.ashaData.progress.length) {
      return this.translate.instant("LEVEL_NOTE")
    }
    if (this.isAdminGrantedProgress()) {
      return this.translate.instant("LEVEL_NOTE")
    }
    // // Check if all levels are completed
    // if (this.getCompletionPercentage() === 100) {
    //   return this.translate.instant('YOU_CLEAR_ALL_LEVELS')
    //   // return 'Note: You have cleared all the levels and you have gained this competency.';
    // }
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
