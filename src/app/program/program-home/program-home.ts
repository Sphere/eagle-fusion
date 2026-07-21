import { Component, computed, EventEmitter, Input, Output, signal, OnInit } from '@angular/core'
import { Subject, firstValueFrom } from 'rxjs'
import { ValueService } from '../../../../library/ws-widget/utils/src/lib/services/value.service'
import { PlaylistService } from '../../services/playlist.service'
import { WidgetUserService } from '../../../../library/ws-widget/collection/src/public-api'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-program-home',
  templateUrl: './program-home.html',
  styleUrl: './program-home.scss',
  standalone: false,
})
export class ProgramHome implements OnInit {
  @Input() configData: any
  @Output() programClick = new EventEmitter()
  isXSmall = computed(() => this.valueSvc.isMobile())
  isLoading = signal(true)
  programData = signal<any[]>([])
  cometencyData: { name: any; levels: string }[] = []
  public unsubscribe = new Subject<void>()
  programList: any
  showDetails = signal(false)
  programDisplayConfig: any = {}
  enrollmentData: any[] = []
  constructor(
    private readonly valueSvc: ValueService,
    private readonly playlistSvc: PlaylistService,
    private readonly userSvc: WidgetUserService,
    private readonly configSvc: ConfigurationsService
  ) {
  }

  async ngOnInit() {
    console.log("[ProgramHome] Init started with configData:", this.configData)
    const plyLsData = await this.playlistSvc.getPlaylistConfig()

    // Set display config for program cards (shows programStatus)
    this.programDisplayConfig = {
      ...this.configData?.cardDisplayConfig,
      displayType: 'card-program',
    }

    // Fetch enrollment data with progress info for program status calculation
    const userId = this.configSvc.userProfile?.userId

    if (userId) {
      try {
        this.enrollmentData = await firstValueFrom(this.userSvc.fetchUserEnrollmentWithProgress(userId))
        console.log('[ProgramHome] Fetched enrollment with progress:', this.enrollmentData, 'courses')
      } catch (error) {
        console.warn('[ProgramHome] Failed to fetch enrollment with progress, using fallback:', error)
        this.enrollmentData = []
      }
    } else {
      console.log('[ProgramHome] No userId, using fallback enrollment data')
    }

    console.log('[ProgramHome] Final enrollmentData to use:', this.enrollmentData?.length, 'courses')

    const enricher = this.enrichProgramWithCount(plyLsData, 'en')
    const enrichedPrograms = this.configData?.programs?.map((program: any) =>
      enricher(program, this.enrollmentData)
    )

    console.log('[ProgramHome] Enriched programs:', enrichedPrograms)
    this.programData.set(enrichedPrograms)
    this.isLoading.set(false)
  }

  enrichProgramWithCount = (playlists: any[], defaultLang: string) => (program: any, enrollmentData: any = null): any => {
    let playlist = null
    let payload: string[] = []

    if (program.type === 'course') {
      playlist = this.getStaticPlaylistForLang(playlists, program.playlistConfigId, defaultLang)
      payload = playlist?.dataSource?.payload ?? []
      console.log(`[ProgramHome] Course program "${program.title}":`, {
        playlistConfigId: program.playlistConfigId,
        playlistFound: !!playlist,
        payload,
      })
    } else if (program.type === 'competency') {
      playlist = this.getCompetencyPlaylistForLang(playlists, program.playlistConfigId)
      // Extract course IDs from competency levels
      payload = playlist?.dataSource?.payload ?? []
      // payload = this.extractCourseIdsFromCompetency(playlist)
      console.log(`[ProgramHome] Competency program "${program.title}":`, {
        playlistConfigId: program.playlistConfigId,
        playlistFound: !!playlist,
        payload,
      })
    }

    const courseCount = payload.length

    // Use provided enrollment data or fall back to input property
    const enrolledCourses = enrollmentData || []

    // Calculate program status based on enrolled courses
    const programStatus = this.calculateProgramStatus(
      payload,
      enrolledCourses
    )

    console.log(`[ProgramHome] Program "${program.title}" enriched:`, {
      type: program.type,
      courseCount,
      programStatus,
    })

    return {
      ...program,
      courseCount,
      payload,
      programStatus,
    }
  }

  private calculateProgramStatus(
    payload: string[],
    enrolledCourses: any[] = []
  ): string {
    if (!payload.length || !enrolledCourses?.length) {
      console.log('[ProgramHome] No payload or enrolledCourses', {
        courseIdsLength: payload.length,
        enrolledCoursesLength: enrolledCourses?.length,
      })
      return ''
    }

    console.log('[ProgramHome] Calculating status:', {
      payload,
      enrolledCourses: enrolledCourses.map((c: any) => ({
        identifier: c.identifier,
        courseId: c.courseId,
        contentId: c.contentId,
        completionPercentage: c.completionPercentage,
      })),
    })

    // Match enrolled courses with program course IDs
    const matchedCourses = enrolledCourses.filter(
      (course: any) => payload.includes(course.courseId || course.contentId)
    )

    console.log('[ProgramHome] Matched courses:', matchedCourses.length, matchedCourses)

    if (!matchedCourses.length) {
      console.log('[ProgramHome] No matched courses found')
      return ''
    }

    // Count completed and in-progress courses
    const completedCount = matchedCourses.filter(
      (course: any) => course.completionPercentage === 100
    ).length

    const inProgressCount = matchedCourses.filter(
      (course: any) => course.completionPercentage == 0 && course.completionPercentage < 100
    ).length

    console.log('[ProgramHome] Counts:', { completedCount, inProgressCount, total: payload.length })

    // Determine status
    if (completedCount === payload.length && payload.length > 0) {
      return 'Completed'
    } else if (completedCount > 0 || inProgressCount > 0) {
      return 'In-Progress'
    }

    return ''
  }

  getStaticPlaylistForLang = (playlists: any[], playlistConfigId: string, defaultLang: string): any | null => {
    const playlist = playlists.find(
      p =>
        p.playlistId === playlistConfigId &&
        p?.dataSource?.type === 'static' &&
        p.language === defaultLang &&
        this.isValidPlaylist(p)
    )
    return playlist || null
  }
  getCompetencyPlaylistForLang = (playlists: any, playlistConfigId: string): any | null => {
    const playlist = playlists.find(
      p =>
        p.playlistId === playlistConfigId &&
        p?.dataSource?.type === 'competency' &&
        this.isValidPlaylist(p)
    )
    return playlist || null
  }

  isValidPlaylist = (playlist: any): boolean =>
    Boolean(
      playlist?.dataSource?.type &&
      Array.isArray(playlist?.dataSource?.payload) &&
      playlist.dataSource.payload.length > 0
    )

  openProgram(programData: any): void {
    this.programList = programData
    this.playlistSvc?.selectedProgram.set(programData)
    this.playlistSvc?.showDetails.set(true)
    this.showDetails.set(true)
  }
}