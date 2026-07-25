import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core'
import { Router } from '@angular/router'

interface AshaLevel {
  level: number
  levelName: string
  description?: string
  courseIds: string[]
  completed?: boolean
}

@Component({
  standalone: false,
  selector: 'ws-asha-learning-card',
  templateUrl: './asha-learning-card.component.html',
  styleUrls: ['./asha-learning-card.component.scss'],
})
// TODO: Instead of COMPETENCY DASHBOARD, competency data shows as a learning path, in future we can delete
export class AshaLearningCardComponent implements OnChanges {
  @Input() competency: any
  @Output() expandedChange = new EventEmitter<boolean>()

  title = ''
  levels: AshaLevel[] = []
  currentLevel = 1
  completedLevelCount = 0
  completedLevels: number[] = []
  progressPercentage = 0
  ctaLabel = 'START_SELF_ASSESSMENT'
  noteLabel = 'LEVEL_NOTE'
  @Input() expanded = false
  competencyId = ''
  cardHeaderLabel = 'COMPETENCY'

  constructor(private router: Router) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.competency) {
      this.buildCard()
    }
  }

  buildCard() {
    const data = this.normalizeCompetency(this.competency)
    this.competencyId = data.id || ''
    this.title = data.title || data.name || `Competency ${this.competencyId}`
    this.levels = (data.levels || []).map((level: any, index: number) => {
      const completed = Boolean(
        level.completed ||
        level.passFailStatus === 'Pass' ||
        level.status === 'Pass' ||
        level.status === 'completed'
      )
      return {
        level: level.level ?? index + 1,
        levelName: level.levelName || level.name || `Level ${level.level ?? index + 1}`,
        description: level.description || level.levelDescription || '',
        courseIds: this.extractCourseIds(level),
        completed,
      }
    })

    this.completedLevelCount = this.levels.filter(level => level.completed).length
    this.completedLevels = this.levels.filter(l => l.completed).map(l => l.level)
    this.progressPercentage = this.getProgressPercentage(data)
    this.currentLevel = this.getCurrentLevel()
    this.ctaLabel = this.getActionLabel()
    this.noteLabel = this.getNoteLabel()
  }

  normalizeCompetency(payload: any): any {
    if (!payload) {
      return { levels: [] }
    }

    if (payload.id && Array.isArray(payload.levels)) {
      return payload
    }

    if (Array.isArray(payload)) {
      const item = payload[0]
      if (item?.id && Array.isArray(item.levels)) {
        return item
      }
    }

    const firstKey = Object.keys(payload || {})[0]
    const competency = payload[firstKey] || payload
    const levels = [] as any[]
    const metaLevels = competency?.additionalProperties?.competencyLevelDescription || competency?.levels || []

    if (Array.isArray(metaLevels)) {
      metaLevels.forEach((level: any) => {
        if (level?.level) {
          levels.push({
            level: level.level,
            levelName: level.levelName || `Level ${level.level}`,
            description: level.description || level.levelDescription || '',
            course: level.course || [],
          })
        }
      })
    }

    return {
      id: competency.id || competency.competencyId || firstKey,
      title: competency.title || competency.name || competency.competencyName,
      levels,
    }
  }

  extractCourseIds(level: any): string[] {
    if (!level) {
      return []
    }
    if (Array.isArray(level.course)) {
      return level.course.map((item: any) => item.id || item.identifier).filter(Boolean)
    }
    if (Array.isArray(level.courseIds)) {
      return level.courseIds.filter(Boolean)
    }
    if (level.courseId) {
      return [level.courseId]
    }
    return []
  }

  getProgressPercentage(data: any): number {
    if (typeof data.progressPercentage === 'number') {
      return data.progressPercentage
    }
    if (Array.isArray(data.progress)) {
      const passed = data.progress.filter((item: any) => item.passFailStatus === 'Pass').length
      return Math.round((passed / this.levels.length) * 100)
    }
    return Math.round((this.completedLevelCount / Math.max(this.levels.length, 1)) * 100)
  }

  getCurrentLevel(): number {
    const firstIncomplete = this.levels.find(level => !level.completed)
    return firstIncomplete?.level || this.levels.length || 1
  }

  getActionLabel(): string {
    if (this.levels.length === 0) {
      return 'START_SELF_ASSESSMENT'
    }
    const nextLevel = this.levels.find(level => !level.completed) || this.levels[this.levels.length - 1]
    if (!nextLevel || nextLevel.courseIds.length === 0) {
      return 'START_SELF_ASSESSMENT'
    }
    return 'START_COURSE'
  }

  getNoteLabel(): string {
    if (this.progressPercentage >= 100) {
      return 'YOU_CLEAR_ALL_LEVELS'
    }
    const nextLevel = this.levels.find(level => !level.completed)
    if (!nextLevel) {
      return 'YOU_CLEAR_ALL_LEVELS'
    }
    if (this.getActionLabel() === 'START_COURSE') {
      return 'COMPLETE_LEVEL_COURSE'
    }
    return 'COMPLETE_LEVEL_ASSESSMENT'
  }

  toggleExpand() {
    this.expanded = !this.expanded
    this.expandedChange.emit(this.expanded)
  }

  onActionClick() {
    const nextLevel = this.levels.find(level => !level.completed) || this.levels[0]
    const courseId = nextLevel?.courseIds?.[0]
    if (this.ctaLabel === 'START_COURSE' && courseId) {
      this.router.navigate([`/app/toc/${courseId}/overview`], {
        queryParams: {
          competencyid: this.competencyId,
          levelId: nextLevel.level,
          courseid: courseId,
          isAsha: true,
        },
      })
      return
    }
    if (courseId) {
      this.router.navigate(['/app/user/self-assessment'], {
        queryParams: {
          contentId: courseId,
          competencyId: this.competencyId,
          level: nextLevel.level,
          isAsha: true,
        },
      })
      return
    }
    this.router.navigate(['/app/user/competency'])
  }

  getLevelState(level: AshaLevel) {
    if (level.completed) {
      return 'completed'
    }
    if (level.level === this.currentLevel) {
      return 'current'
    }
    return 'pending'
  }

  trackByLevel(_index: number, item: AshaLevel) {
    return item.level
  }
}
